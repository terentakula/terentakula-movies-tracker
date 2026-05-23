import { useMemo, useState } from "react";
import { LibraryGrid } from "../../features/user-library/components/LibraryGrid";
import { useUserLibraryStore } from "../../features/user-library/store/userLibraryStore";
import type { LibraryItem } from "../../features/user-library/types/userLibrary.types";
import { useAuthStore } from "../../features/auth/store/authStore";

type MediaFilter = "all" | "movie" | "tv";
type SortType = "rating" | "year" | "title";

const mediaFilters: { label: string; value: MediaFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Фильмы", value: "movie" },
  { label: "Сериалы", value: "tv" },
];

const sortOptions: { label: string; value: SortType }[] = [
  { label: "По рейтингу", value: "rating" },
  { label: "По году", value: "year" },
  { label: "По названию", value: "title" },
];

const getYear = (item: LibraryItem) => {
  return item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : 0;
};

const getAverageRating = (items: LibraryItem[]) => {
  if (!items.length) {
    return null;
  }

  const ratedItems = items.filter((item) => item.voteAverage);

  if (!ratedItems.length) {
    return null;
  }

  const sum = ratedItems.reduce((acc, item) => acc + item.voteAverage, 0);

  return sum / ratedItems.length;
};

export const WatchlistPage = () => {
  const user = useAuthStore((state) => state.user)
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [sortType, setSortType] = useState<SortType>("rating");

  const watchlist = useUserLibraryStore((state) => state.watchlist);
  const removeFromWatchlist = useUserLibraryStore(
    (state) => state.removeFromWatchlist,
  );

  const moviesCount = watchlist.filter(
    (item) => item.mediaType === "movie",
  ).length;
  const tvCount = watchlist.filter((item) => item.mediaType === "tv").length;
  const averageRating = getAverageRating(watchlist);

  const filteredItems = useMemo(() => {
    const items =
      mediaFilter === "all"
        ? watchlist
        : watchlist.filter((item) => item.mediaType === mediaFilter);

    return [...items].sort((a, b) => {
      if (sortType === "rating") {
        return b.voteAverage - a.voteAverage;
      }

      if (sortType === "year") {
        return getYear(b) - getYear(a);
      }

      return a.title.localeCompare(b.title);
    });
  }, [mediaFilter, sortType, watchlist]);

  return (
    <section>
      <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-violet-400/25 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />

          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
              Watchlist
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Хочу посмотреть
            </h1>
            <p className="mb-8 max-w-3xl text-base leading-7 text-slate-300">
              Персональный список фильмов и сериалов, которые пользователь
              планирует посмотреть.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Всего в списке</p>
                <p className="text-3xl font-bold text-white">
                  {watchlist.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Фильмы</p>
                <p className="text-3xl font-bold text-violet-300">
                  {moviesCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Сериалы</p>
                <p className="text-3xl font-bold text-cyan-300">{tvCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Средний рейтинг</p>
                <p className="text-3xl font-bold text-yellow-200">
                  {averageRating !== null ? averageRating.toFixed(1) : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">Мой список</h2>
            <p className="text-sm text-slate-400">
              Можно отфильтровать список и быстро найти, что посмотреть дальше.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {mediaFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setMediaFilter(filter.value)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-bold transition",
                    mediaFilter === filter.value
                      ? "bg-violet-400 text-slate-950"
                      : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white",
                  ].join(" ")}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="rounded-full border border-white/10 bg-slate-950 px-4 py-2 font-bold text-slate-200 outline-none transition hover:bg-slate-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <LibraryGrid
        items={filteredItems}
        emptyTitle="Список пока пуст"
        emptyDescription="Откройте фильм или сериал и нажмите кнопку 'Хочу посмотреть'."
        onRemove={(item) => void removeFromWatchlist(item.id, item.mediaType, user?.id)}
      />
    </section>
  );
};
