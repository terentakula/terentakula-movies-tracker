import { create } from "zustand";
import type {
  LibraryItem,
  UserMediaEntry,
  UserMediaItemRow,
} from "../types/userLibrary.types";
import { supabase } from "../../../shared/api/supabaseClient";

type MediaType = LibraryItem["mediaType"];

type UserLibraryState = {
  favorites: LibraryItem[];
  watchlist: LibraryItem[];
  watched: LibraryItem[];
  userEntries: Record<string, UserMediaEntry>;

  isLibraryLoading: boolean;
  libraryError: string | null;

  loadUserLibrary: (userId: string) => Promise<void>;
  clearLibraryState: () => void;

  toggleFavorite: (item: LibraryItem, userId?: string) => Promise<void>;
  toggleWatchlist: (item: LibraryItem, userId?: string) => Promise<void>;
  toggleWatched: (item: LibraryItem, userId?: string) => Promise<void>;

  isFavorite: (id: number, mediaType: MediaType) => boolean;
  isInWatchlist: (id: number, mediaType: MediaType) => boolean;
  isWatched: (id: number, mediaType: MediaType) => boolean;

  removeFavorite: (
    id: number,
    mediaType: MediaType,
    userId?: string,
  ) => Promise<void>;
  removeFromWatchlist: (
    id: number,
    mediaType: MediaType,
    userId?: string,
  ) => Promise<void>;
  removeFromWatched: (
    id: number,
    mediaType: MediaType,
    userId?: string,
  ) => Promise<void>;

  setRating: (
    id: number,
    mediaType: MediaType,
    rating: number | null,
    userId?: string,
  ) => Promise<void>;

  setNote: (
    id: number,
    mediaType: MediaType,
    note: string,
    userId?: string,
  ) => Promise<void>;

  getUserEntry: (
    id: number,
    mediaType: MediaType,
  ) => UserMediaEntry | undefined;

  clearUserEntry: (
    id: number,
    mediaType: MediaType,
    userId?: string,
  ) => Promise<void>;
};

const getEntryKey = (id: number, mediaType: MediaType) => {
  return `${mediaType}-${id}`;
};

const isSameItem = (item: LibraryItem, id: number, mediaType: MediaType) => {
  return item.id === id && item.mediaType === mediaType;
};

const rowToLibraryItem = (row: UserMediaItemRow): LibraryItem => {
  return {
    id: row.tmdb_id,
    mediaType: row.media_type,
    title: row.title,
    overview: row.overview,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    voteAverage: Number(row.vote_average),
    releaseDate: row.release_date,
    genres: row.genres ?? [],
  };
};

const rowsToState = (rows: UserMediaItemRow[]) => {
  const userEntries: Record<string, UserMediaEntry> = {};

  rows.forEach((row) => {
    if (row.rating !== null || row.note.trim()) {
      userEntries[getEntryKey(row.tmdb_id, row.media_type)] = {
        id: row.tmdb_id,
        mediaType: row.media_type,
        rating: row.rating === null ? null : Number(row.rating),
        note: row.note,
        updatedAt: row.updated_at,
      };
    }
  });

  return {
    favorites: rows.filter((row) => row.is_favorite).map(rowToLibraryItem),
    watchlist: rows.filter((row) => row.is_watchlist).map(rowToLibraryItem),
    watched: rows.filter((row) => row.is_watched).map(rowToLibraryItem),
    userEntries,
  };
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user?.id;
};

const getEffecttiveUserId = async (userId?: string) => {
  if (userId) {
    return userId;
  }
  return getCurrentUserId();
};

const getItemRow = async (userId: string, id: number, mediaType: MediaType) => {
  const { data, error } = await supabase
    .from("user_media_items")
    .select("*")
    .eq("user_id", userId)
    .eq("tmdb_id", id)
    .eq("media_type", mediaType)
    .maybeSingle<UserMediaItemRow>();

  if (error) {
    throw error;
  }

  return data;
};

const upsertItemFlags = async (
  item: LibraryItem,
  userId: string,
  flags: Partial<
    Pick<
      UserMediaItemRow,
      "is_favorite" | "is_watchlist" | "is_watched" | "rating" | "note"
    >
  >,
) => {
  const { error } = await supabase.from("user_media_items").upsert(
    {
      user_id: userId,
      tmdb_id: item.id,
      media_type: item.mediaType,
      title: item.title,
      overview: item.overview,
      poster_path: item.posterPath,
      backdrop_path: item.backdropPath,
      vote_average: item.voteAverage,
      release_date: item.releaseDate,
      genres: item.genres ?? [],
      updated_at: new Date().toISOString(),
      ...flags,
    },
    {
      onConflict: "user_id,tmdb_id,media_type",
    },
  );

  if (error) {
    throw error;
  }
};

const updateRowField = async (
  userId: string,
  id: number,
  mediaType: MediaType,
  values: Partial<
    Pick<
      UserMediaItemRow,
      "is_favorite" | "is_watchlist" | "is_watched" | "rating" | "note"
    >
  >,
) => {
  const { error } = await supabase
    .from("user_media_items")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("tmdb_id", id)
    .eq("media_type", mediaType);

  if (error) {
    throw error;
  }
};

const deleteEmptyRow = async (
  userId: string,
  id: number,
  mediaType: MediaType,
) => {
  const row = await getItemRow(userId, id, mediaType);

  if (!row) {
    return;
  }

  const hasUsefulData =
    row.is_favorite ||
    row.is_watchlist ||
    row.is_watched ||
    row.rating !== null ||
    row.note.trim();

  if (hasUsefulData) {
    return;
  }

  const { error } = await supabase
    .from("user_media_items")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", id)
    .eq("media_type", mediaType);

  if (error) {
    throw error;
  }
};

const refreshLibrary = async (
  set: (
    partial:
      | Partial<UserLibraryState>
      | ((state: UserLibraryState) => Partial<UserLibraryState>),
  ) => void,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("user_media_items")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .returns<UserMediaItemRow[]>();

  if (error) {
    throw error;
  }

  set({
    ...rowsToState(data ?? []),
    isLibraryLoading: false,
    libraryError: null,
  });
};

export const useUserLibraryStore = create<UserLibraryState>((set, get) => ({
  favorites: [],
  watchlist: [],
  watched: [],
  userEntries: {},

  isLibraryLoading: false,
  libraryError: null,

  loadUserLibrary: async (userId) => {
    set({ isLibraryLoading: true, libraryError: null });

    try {
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        isLibraryLoading: false,
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось загрузить библиотеку.",
      });
    }
  },

  clearLibraryState: () => {
    set({
      favorites: [],
      watchlist: [],
      watched: [],
      userEntries: {},
      isLibraryLoading: false,
      libraryError: null,
    });
  },
  toggleFavorite: async (item, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    const isCurrentlyFavorite = get().isFavorite(item.id, item.mediaType);

    try {
      await upsertItemFlags(item, userId, {
        is_favorite: !isCurrentlyFavorite,
      });
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось обновить избранное.",
      });
    }
  },

  toggleWatchlist: async (item, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    const isCurrentlyInWatchlist = get().isInWatchlist(item.id, item.mediaType);

    try {
      await upsertItemFlags(item, userId, {
        is_watchlist: !isCurrentlyInWatchlist,
      });
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось обновить список желаний.",
      });
    }
  },
  toggleWatched: async (item, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    const isCurrentlyInWatched = get().isWatched(item.id, item.mediaType);

    try {
      await upsertItemFlags(item, userId, {
        is_watched: !isCurrentlyInWatched,
      });
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось обновить просмотренное.",
      });
    }
  },
  isFavorite: (id, mediaType) => {
    return get().favorites.some((item) => isSameItem(item, id, mediaType));
  },
  isInWatchlist: (id, mediaType) => {
    return get().watchlist.some((item) => isSameItem(item, id, mediaType));
  },
  isWatched: (id, mediaType) => {
    return get().watched.some((item) => isSameItem(item, id, mediaType));
  },
  removeFavorite: async (id, mediaType, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      await updateRowField(userId, id, mediaType, { is_favorite: false });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось удалить из избранного.",
      });
    }
  },
  removeFromWatchlist: async (id, mediaType, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      await updateRowField(userId, id, mediaType, { is_watchlist: false });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось удалить из списка желаний.",
      });
    }
  },
  removeFromWatched: async (id, mediaType, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      await updateRowField(userId, id, mediaType, { is_watched: false });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось удалить из просмотренного.",
      });
    }
  },
  setRating: async (id, mediaType, rating, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      const row = await getItemRow(userId, id, mediaType);

      if (!row) {
        set({
          libraryError:
            "Сначала добавьте фильм или сериал в избранное, список желаний или просмотренное.",
        });
        return;
      }

      await updateRowField(userId, id, mediaType, { rating });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось сохранить оценку.",
      });
    }
  },
  setNote: async (id, mediaType, note, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      const row = await getItemRow(userId, id, mediaType);

      if (!row) {
        set({
          libraryError:
            "Сначала добавьте фильм или сериал в избранное, список желаний или просмотренное.",
        });
        return;
      }

      await updateRowField(userId, id, mediaType, { note });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось сохранить заметку.",
      });
    }
  },
  getUserEntry: (id, mediaType) => {
    const key = getEntryKey(id, mediaType);

    return get().userEntries[key];
  },

  clearUserEntry: async (id, mediaType, userIdFromArgs) => {
    const userId = await getEffecttiveUserId(userIdFromArgs);

    if (!userId) {
      return;
    }

    try {
      await updateRowField(userId, id, mediaType, {
        rating: null,
        note: "",
      });
      await deleteEmptyRow(userId, id, mediaType);
      await refreshLibrary(set, userId);
    } catch (error) {
      set({
        libraryError:
          error instanceof Error
            ? error.message
            : "Не удалось очистить заметку и оценку.",
      });
    }
  },
}));
