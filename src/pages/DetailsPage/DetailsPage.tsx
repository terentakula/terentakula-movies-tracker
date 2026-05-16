import { Link, useLocation, useParams } from "react-router-dom";
import type {
  CastMember,
  ImageItem,
  MediaDetails,
  MediaType,
  MovieDetails,
  SeasonSummary,
  TvDetails,
  VideoItem,
} from "../../features/movies/types/movie.type";
import { useMediaDetails } from "../../features/movies/hooks/useMediaDetails";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { EmptyState } from "../../shared/ui/EmptyState";
import { getTmdbImageUrl } from "../../shared/config/tmdb";
import { ROUTES } from "../../app/router/routes";
import { useUserLibraryStore } from "../../features/user-library/store/userLibraryStore";
import type { LibraryItem } from "../../features/user-library/types/userLibrary.types";
import { UserMediaPanel } from "../../features/user-library/components/UserMediaPanel";
import type { SearchPageState } from "../../features/movies/types/search.types";
import { useEffect, useState } from "react";
import { MovieRail } from "../../features/movies/components/MovieRail";
import { FaPlay } from "react-icons/fa";
import { useAuthStore } from "../../features/auth/store/authStore";

type DetailsPageProps = {
  mediaType: MediaType;
};

type DetailsTab =
  | "overview"
  | "videos"
  | "cast"
  | "gallery"
  | "seasons"
  | "similar"
  | "notes";

const isMovieDetails = (
  _details: MediaDetails,
  mediaType: MediaType,
): _details is MovieDetails => {
  return mediaType === "movie";
};

const isTvDetails = (
  _details: MediaDetails,
  mediaType: MediaType,
): _details is TvDetails => {
  return mediaType === "tv";
};

const getTitle = (details: MediaDetails, mediaType: MediaType) => {
  return mediaType === "movie"
    ? (details as MovieDetails).title
    : (details as TvDetails).name;
};

const getDate = (details: MediaDetails, mediaType: MediaType) => {
  return mediaType === "movie"
    ? (details as MovieDetails).release_date
    : (details as TvDetails).first_air_date;
};

const formatRuntime = (runtime: number | null) => {
  if (!runtime) {
    return null;
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (!hours) {
    return `${minutes} мин`;
  }

  return `${hours} ч ${minutes} мин`;
};

const getMainTrailer = (videos: VideoItem[] = []) => {
  const youtubeVideos = videos.filter((video) => video.site === "YouTube");

  return (
    youtubeVideos.find((video) => video.type === "Trailer" && video.official) ||
    youtubeVideos.find((video) => video.type === "Trailer") ||
    youtubeVideos.find((video) => video.type === "Teaser") ||
    youtubeVideos[0] ||
    null
  );
};

const getCharacterText = (actor: CastMember) => {
  if (!actor.character) {
    return "Роль не указана";
  }

  return actor.character;
};

const getSeasonDate = (date: string | null) => {
  if (!date) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const sortVideos = (videos: VideoItem[] = []) => {
  const order: Record<string, number> = {
    Trailer: 1,
    Teaser: 2,
    Featurette: 3,
    "Behind the Scenes": 4,
    Clip: 5,
  };

  return [...videos]
    .filter((video) => video.site === "YouTube")
    .sort((a, b) => {
      const aOrder = order[a.type] ?? 99;
      const bOrder = order[b.type] ?? 99;

      return aOrder - bOrder;
    });
};

const getGalleryImages = (images: ImageItem[] = []) => {
  return [...images]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 18);
};

const getSeasonPosterUrl = (season: SeasonSummary) => {
  return getTmdbImageUrl(season.poster_path, "w342");
};

const formatUserEntryDate = (date?: string) => {
  if (!date) {
    return "Пока нет изменений";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const getTrackerStatus = ({
  isFavorite,
  isInWatchlist,
  isWatched,
}: {
  isFavorite: boolean;
  isInWatchlist: boolean;
  isWatched: boolean;
}) => {
  const statuses: string[] = [];

  if (isWatched) {
    statuses.push("Просмотрено");
  }
  if (isInWatchlist) {
    statuses.push("Хочу посмотреть");
  }
  if (isFavorite) {
    statuses.push("В избранном");
  }

  return statuses.length ? statuses.join(" - ") : "Не добавлено";
};

export const DetailsPage = ({ mediaType }: DetailsPageProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const runPrivateAvtion = (action: () => void) => {
    if (!user) {
      openAuthModal(
        "Войдите, чтобы сохранять фильмы, ставить оценки и писать заметки.",
      );
      return;
    }

    action();
  };

  const [selectedTab, setSelectedTab] = useState<DetailsTab | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [id, mediaType]);

  const detailsLocationState =
    location.state && typeof location.state === "object"
      ? (location.state as {
          fromSearch?: boolean;
          searchState?: SearchPageState;
        })
      : undefined;

  const cameFromSearch = Boolean(detailsLocationState?.fromSearch);
  const searchState = detailsLocationState?.searchState;

  const { data, isLoading, isError } = useMediaDetails({
    id,
    mediaType,
  });

  const toggleFavorite = useUserLibraryStore((state) => state.toggleFavorite);
  const toggleWatchlist = useUserLibraryStore((state) => state.toggleWatchlist);
  const toggleWatched = useUserLibraryStore((state) => state.toggleWatched);

  const setRating = useUserLibraryStore((state) => state.setRating);
  const setNote = useUserLibraryStore((state) => state.setNote);
  const clearUserEntry = useUserLibraryStore((state) => state.clearUserEntry);

  const isFavorite = useUserLibraryStore((state) =>
    data ? state.isFavorite(data.id, mediaType) : false,
  );
  const isInWatchlist = useUserLibraryStore((state) =>
    data ? state.isInWatchlist(data.id, mediaType) : false,
  );
  const isWatched = useUserLibraryStore((state) =>
    data ? state.isWatched(data.id, mediaType) : false,
  );
  const userEntry = useUserLibraryStore((state) =>
    data ? state.getUserEntry(data.id, mediaType) : undefined,
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message="Не удалось загрузить детальную информацию. Проверь id или TMDB" />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Ничего не найдено"
        description="Не удалось получить данные по этому фильму или сериалу"
      />
    );
  }

  const title = getTitle(data, mediaType);
  const date = getDate(data, mediaType);
  const posterUrl = getTmdbImageUrl(data.poster_path, "w500");
  const backdropUrl = getTmdbImageUrl(data.backdrop_path, "original");
  const year = date ? date.slice(0, 4) : null;
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "-";

  const allVideos = sortVideos(data.videos?.results);
  const trailer = getMainTrailer(data.videos?.results);

  const cast = data.credits?.cast?.slice(0, 12) ?? [];

  const recommendations =
    data.recommendations?.results
      ?.filter((item) => item.id !== data.id)
      .slice(0, 12) ?? [];

  const backdrops = getGalleryImages(data.images?.backdrops);
  const posters = getGalleryImages(data.images?.posters);
  const galleryImages = [...backdrops, ...posters].slice(0, 18);

  const collection = isMovieDetails(data, mediaType)
    ? data.belongs_to_collection
    : null;

  const seasons = isTvDetails(data, mediaType)
    ? (data.seasons?.filter((season) => season.season_number > 0) ?? [])
    : [];

  const tabs: {
    id: DetailsTab;
    label: string;
    visible: boolean;
  }[] = [
    { id: "overview", label: "Обзор", visible: true },
    { id: "videos", label: "Видео", visible: allVideos.length > 0 },
    { id: "cast", label: "Актёры", visible: cast.length > 0 },
    { id: "gallery", label: "Галерея", visible: galleryImages.length > 0 },
    { id: "seasons", label: "Сезоны", visible: seasons.length > 0 },
    { id: "similar", label: "Похожие", visible: recommendations.length > 0 },
    { id: "notes", label: "Мои заметки", visible: true },
  ];

  const visibleTabs = tabs.filter((tab) => tab.visible);

  const activeTab =
    selectedTab && visibleTabs.some((tab) => tab.id === selectedTab)
      ? selectedTab
      : "overview";

  const libraryItem: LibraryItem = {
    id: data.id,
    mediaType,
    title,
    overview: data.overview,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    voteAverage: data.vote_average,
    releaseDate: date || null,
    genres: data.genres,
  };

  return (
    <section key={`${mediaType}-${id}`}>
      <Link
        to={cameFromSearch ? ROUTES.search : ROUTES.home}
        state={cameFromSearch && searchState ? { searchState } : undefined}
        className="mb-6  inline-flex rounded-3xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        {cameFromSearch ? "Назад к списку" : "На главную"}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
        <div className="relative min-h-[360px]">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />

          <div className="relative flex min-h-[360px] items-end p-5 sm:p-8">
            <div className="grid w-full gap-6 md:grid-cols-[220px_1fr] md:items-end">
              <div className="mx-auto w-44 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 md:mx-0 md:w-full ">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={title}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm text-slate-500">
                    Нет постера
                  </div>
                )}
              </div>

              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {mediaType === "movie" ? "Фильм" : "Сериал"}
                  </span>

                  {year ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      {year}
                    </span>
                  ) : null}

                  <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-200">
                    Рейтинг {rating}
                  </span>
                </div>

                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
                  {title}
                </h1>

                {data.tagline ? (
                  <p className="mt-3 max-w-3xl text-lg italic text-slate-300">
                    {data.tagline}
                  </p>
                ) : null}

                <p className="mt-5 max-w-4xl text-base leading-7 text-slate-200">
                  {data.overview || "Описание пока отсутствует."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {trailer ? (
                    <button
                      type="button"
                      onClick={() => setSelectedTab("videos")}
                      className="rounded-full bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400"
                    >
                      Смотреть трейлер
                    </button>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    className={[
                      "rounded-full px-5 py-3 text-sm font-bold transition",
                      isFavorite
                        ? " bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : "border border-white/15 text-white hover:bg-white/10",
                    ].join(" ")}
                    onClick={() =>
                      runPrivateAvtion(() => toggleFavorite(libraryItem))
                    }
                  >
                    {isFavorite ? "В избранном" : "В избранное"}
                  </button>

                  <button
                    onClick={() =>
                      runPrivateAvtion(() => toggleWatchlist(libraryItem))
                    }
                    className={[
                      "rounded-full px-5 py-3 text-sm font-bold transition",
                      isInWatchlist
                        ? " bg-violet-400 text-slate-950 hover:bg-violet-300"
                        : "border border-white/15 text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    {isInWatchlist ? "В списке" : "Хочу посмотреть"}
                  </button>

                  <button
                    onClick={() =>
                      runPrivateAvtion(() => toggleWatched(libraryItem))
                    }
                    className={[
                      "rounded-full px-5 py-3 text-sm font-bold transition",
                      isWatched
                        ? " bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                        : "border border-white/15 text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    {isWatched ? "Просмотрено" : "Отметить просмотренным"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 p-5 sm:p-8 md:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Статус</p>
            <p className="mt-1 font-semibold">{data.status || "-"}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Голосов</p>
            <p className="mt-1 font-semibold">{data.vote_count}</p>
          </div>

          {isMovieDetails(data, mediaType) ? (
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Длительность</p>
              <p className="mt-1 font-semibold">
                {formatRuntime(data.runtime) || "-"}
              </p>
            </div>
          ) : null}
          {isTvDetails(data, mediaType) ? (
            <>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Сезонов</p>
                <p className="mt-1 font-semibold">{data.number_of_seasons}</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Серий</p>
                <p className="mt-1 font-semibold">{data.number_of_episodes}</p>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Дата выхода</p>
            <p className="mt-1 font-semibold">{date || "-"}</p>
          </div>
        </div>

        {data.genres.length ? (
          <div className="border-t border-white/10 p-5 sm:p-8">
            <h2 className="text-xl font-bold">Жанры</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sticky top-0 z-20 border-t border-white/10 bg-slate-950 px-5 py-4 backdrop-blur sm:px-8">
          <div className="flex justify-center flex-wrap gap-2 pb-1">
            {tabs
              .filter((tab) => tab.visible)
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={[
                    "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
                    activeTab === tab.id
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-5 sm:p-8">
          {activeTab === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Обзор</h2>

                  <p className="mt-4">
                    {data.overview || "Описание пока отсутствует."}
                  </p>
                </div>

                {trailer ? (
                  <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/30">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                {collection ? (
                  <Link
                    to={`/collections/${collection.id}`}
                    className="group block rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-cyan-400/15"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      Коллекция
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-white">
                      {collection.name}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Этот фильм входит в коллекцию. Открой страницу, чтобы
                      посмотреть все части.
                    </p>

                    <span className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-white/15">
                      Смотреть коллекцию
                    </span>
                  </Link>
                ) : null}
              </div>

              <aside className="space-y-4 ">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                      My Tracker
                    </p>
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                      Личное
                    </span>
                  </div>

                  <div className="mb-5 space-y-4 text-sm">
                    <div className="rounded-2xl bg-slate-950/60 p-4">
                      <p className="text-slate-500 mb-1">Статус</p>
                      <p className="font-semibold text-slate-100">
                        {getTrackerStatus({
                          isFavorite,
                          isInWatchlist,
                          isWatched,
                        })}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-4">
                      <p className="text-slate-500 mb-1">Моя оценка</p>
                      <span className="rounded-full font-semibold bg-yellow-400/15 px-3 py-1 text-yellow-200">
                        {userEntry?.rating
                          ? `${userEntry.rating} / 10`
                          : "Не оценено"}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-4">
                      <p className="text-slate-500 mb-1">Моя заметка</p>
                      <p className="line-clamp-4 leading-6 text-slate-200">
                        {userEntry?.note?.trim()
                          ? userEntry.note
                          : "Добавь личную заметку к этому тайтлу."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-950/60 p-4">
                      <p className="text-slate-500 mb-1">Обновлено</p>
                      <p className="font-semibold text-slate-100">
                        {formatUserEntryDate(userEntry?.updatedAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        runPrivateAvtion(() => setSelectedTab("notes"))
                      }
                      className="mt-5 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Редактировать оценку и заметку
                    </button>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Дополнительно
                    </h3>

                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-slate-500">Оригинальное название</p>
                        <p className="text-xl font-semibold text-slate-200">
                          {isMovieDetails(data, mediaType)
                            ? data.original_title
                            : data.original_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Тип</p>
                        <p className="text-xl font-semibold text-slate-200">
                          {mediaType === "movie" ? "Фильм" : "Сериал"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500">Рейтинг TMDB</p>
                        <p className="text-xl font-semibold text-slate-200">
                          {rating}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {activeTab === "videos" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Видео</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Трейлеры, тизеры и дополнительные ролики
                </p>
              </div>

              {trailer ? (
                <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-black/30">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title={trailer.name}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 transition hover:-translate-y-1 hover:border-cyan-400/50"
                  >
                    <div className="relative aspect-video bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                        alt={video.name}
                        className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-cyan-900 px-4 py-3 shadow-lg">
                          <FaPlay />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">
                        {video.type}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-white">
                        {video.name}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "cast" ? (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Актёры</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Основной актёрский состав
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {cast.map((actor) => {
                  const profileUrl = getTmdbImageUrl(
                    actor.profile_path,
                    "w185",
                  );

                  return (
                    <Link
                      to={`/person/${actor.id}`}
                      key={`${actor.id}-${actor.character}`}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-950/50"
                    >
                      <div className="aspect-[2/3] bg-white/5">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={actor.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-slate-500">
                            Нет фото
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="line-clamp-2 text-sm font-bold text-white">
                          {actor.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {getCharacterText(actor)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "gallery" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Галерея</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Кадры, постеры и фоновые изображения
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((image) => {
                  const imageUrl = getTmdbImageUrl(image.file_path, "w780");
                  const fullImageUrl = getTmdbImageUrl(
                    image.file_path,
                    "original",
                  );

                  if (!imageUrl || !fullImageUrl) {
                    return null;
                  }

                  return (
                    <button
                      key={image.file_path}
                      type="button"
                      onClick={() => setSelectedImageUrl(fullImageUrl)}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 text-left transition hover:-translate-y-1 hover:border-cyan-400/50"
                    >
                      <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "seasons" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Сезоны</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Список сезонов и базовая информация
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {seasons.map((season) => {
                  const seasonPosterUrl = getSeasonPosterUrl(season);

                  return (
                    <div
                      key={season.id}
                      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80"
                    >
                      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                        <div className="bg-white/5">
                          {seasonPosterUrl ? (
                            <img
                              src={seasonPosterUrl}
                              alt={season.name}
                              className="h-full min-h-44 w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full min-h-44 items-center justify-center text-sm text-slate-500">
                              Нет постера
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white">
                            {season.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {getSeasonDate(season.air_date)}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                              {season.episode_count} серий
                            </span>

                            <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-200">
                              {season.vote_average.toFixed(1)}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                            {season.overview || "Описание сезона отсутствует."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "similar" ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {mediaType === "movie" ? "Похожие фильмы" : "Похожие сериалы"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Рекомендации на основе выбранного тайтла
                </p>
              </div>

              <MovieRail
                title=""
                description=""
                items={recommendations}
                mediaType={mediaType}
              />
            </div>
          ) : null}

          {activeTab === "notes" && user ? (
            <UserMediaPanel
              id={data.id}
              mediaType={mediaType}
              rating={userEntry?.rating ?? null}
              note={userEntry?.note ?? ""}
              onChangeRating={(rating) => setRating(data.id, mediaType, rating)}
              onChangeNote={(note) => setNote(data.id, mediaType, note)}
              onClear={() => clearUserEntry(data.id, mediaType)}
            />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                My Tracker
              </p>
              <h2 className="mb-3 text-2xl font-bold text-white">
                Войдите, чтобы писать заметки.
              </h2>

              <p className="mb-6 mx-auto max-w-2xl text-sm leading-6 text-slate-400">
                оценки и заметки относятся к личному профилю, поэтому они
                доступны только фвторизованному пользователю.
              </p>

              <button
                type="button"
                onClick={() => openAuthModal("Войдите, чтобы поставить оценку и оставить заметку.")}
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Войти
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedImageUrl ? (
        <button
          type="button"
          onClick={() => setSelectedImageUrl(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <img
            src={selectedImageUrl}
            alt={title}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />

          <span className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            Закрыть
          </span>
        </button>
      ) : null}
    </section>
  );
};
