import { create } from "zustand";
import type { LibraryItem, UserMediaEntry } from "../types/userLibrary.types";
import { persist } from "zustand/middleware";

type UserLibraryState = {
  favorites: LibraryItem[];
  watchlist: LibraryItem[];
  watched: LibraryItem[];
  userEntries: Record<string, UserMediaEntry>;

  toggleFavorite: (item: LibraryItem) => void;
  toggleWatchlist: (item: LibraryItem) => void;
  toggleWatched: (item: LibraryItem) => void;

  isFavorite: (id: number, mediaType: LibraryItem["mediaType"]) => boolean;
  isInWatchlist: (id: number, mediaType: LibraryItem["mediaType"]) => boolean;
  isWatched: (id: number, mediaType: LibraryItem["mediaType"]) => boolean;

  removeFavorite: (id: number, mediaType: LibraryItem["mediaType"]) => void;
  removeFromWatchlist: (
    id: number,
    mediaType: LibraryItem["mediaType"],
  ) => void;
  removeFromWatched: (id: number, mediaType: LibraryItem["mediaType"]) => void;

  setRating: (
    id: number,
    mediaType: LibraryItem["mediaType"],
    rating: number | null
  ) => void;

  setNote: (
    id: number,
    mediaType: LibraryItem["mediaType"],
    note: string,
  ) => void;

  getUserEntry: (
    id: number,
    mediaType: LibraryItem["mediaType"],
  ) => UserMediaEntry | undefined;

  clearUserEntry: (id: number, mediaType: LibraryItem["mediaType"]) => void;
};

const getEntryKey = (id: number, mediaType: LibraryItem["mediaType"]) => {
  return `${mediaType}-${id}`;
};

const isSameItem = (
  item: LibraryItem,
  id: number,
  mediaType: LibraryItem["mediaType"],
) => {
  return item.id === id && item.mediaType === mediaType;
};

const toggleItem = (items: LibraryItem[], newItem: LibraryItem) => {
  const exists = items.some((item) =>
    isSameItem(item, newItem.id, newItem.mediaType),
  );

  if (exists) {
    return items.filter(
      (item) => !isSameItem(item, newItem.id, newItem.mediaType),
    );
  }
  return [newItem, ...items];
};

const createEmptyEntry = (
  id: number,
  mediaType: LibraryItem["mediaType"],
): UserMediaEntry => {
  return {
    id,
    mediaType,
    rating: null,
    note: "",
    updatedAt: new Date().toISOString(),
  };
};

export const useUserLibraryStore = create<UserLibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      watchlist: [],
      watched: [],
      userEntries: {},

      toggleFavorite: (item) => {
        set((state) => ({
          favorites: toggleItem(state.favorites, item),
        }));
      },
      toggleWatchlist: (item) => {
        set((state) => ({
          watchlist: toggleItem(state.watchlist, item),
        }));
      },
      toggleWatched: (item) => {
        set((state) => ({
          watched: toggleItem(state.watched, item),
        }));
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

      removeFavorite: (id, mediaType) => {
        set((state) => ({
          favorites: state.favorites.filter(
            (item) => !isSameItem(item, id, mediaType),
          ),
        }));
      },
      removeFromWatchlist: (id, mediaType) => {
        set((state) => ({
          watchlist: state.watchlist.filter(
            (item) => !isSameItem(item, id, mediaType),
          ),
        }));
      },
      removeFromWatched: (id, mediaType) => {
        set((state) => ({
          watched: state.watched.filter(
            (item) => !isSameItem(item, id, mediaType),
          ),
        }));
      },

      setRating: (id, mediaType, rating) => {
        const key = getEntryKey(id, mediaType);
        const currentEntry =
          get().userEntries[key] ?? createEmptyEntry(id, mediaType);

        set((state) => ({
          userEntries: {
            ...state.userEntries,
            [key]: {
              ...currentEntry,
              rating,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setNote: (id, mediaType, note) => {
        const key = getEntryKey(id, mediaType);
        const currentEntry =
          get().userEntries[key] ?? createEmptyEntry(id, mediaType);

        set((state) => ({
          userEntries: {
            ...state.userEntries,
            [key]: {
              ...currentEntry,
              note,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getUserEntry: (id, mediaType) => {
        const key = getEntryKey(id, mediaType);

        return get().userEntries[key];
      },

      clearUserEntry: (id, mediaType) => {
        const key = getEntryKey(id, mediaType);

        set((state) => {
          const nextEntries = { ...state.userEntries };

          delete nextEntries[key];

          return {
            userEntries: nextEntries,
          };
        });
      },
    }),
    { name: "terentakula-movies-library" },
  ),
);
