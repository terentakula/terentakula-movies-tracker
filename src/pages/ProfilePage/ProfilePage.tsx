import { Link } from "react-router-dom";
import { LibraryGrid } from "../../features/user-library/components/LibraryGrid";
import { useUserLibraryStore } from "../../features/user-library/store/userLibraryStore";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GenreStat = {
  id: number;
  name: string;
  count: number;
};

const getUniqueItems = (
  items: ReturnType<typeof useUserLibraryStore.getState>["favorites"],
) => {
  const map = new Map<string, (typeof items)[number]>();

  items.forEach((item) => {
    map.set(`${item.mediaType}-${item.id}`, item);
  });

  return Array.from(map.values());
};

const getFavoriteGenres = (
  items: ReturnType<typeof useUserLibraryStore.getState>["favorites"],
) => {
  const genreMap = new Map<number, GenreStat>();

  items.forEach((item) => {
    item.genres?.forEach((genre) => {
      const current = genreMap.get(genre.id);

      if (current) {
        genreMap.set(genre.id, {
          ...current,
          count: current.count + 1,
        });

        return;
      }

      genreMap.set(genre.id, {
        id: genre.id,
        name: genre.name,
        count: 1,
      });
    });
  });

  return Array.from(genreMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const formatDate = (date?: string) => {
  if (!date) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export const ProfilePage = () => {
  const favorites = useUserLibraryStore((state) => state.favorites);
  const watchlist = useUserLibraryStore((state) => state.watchlist);
  const watched = useUserLibraryStore((state) => state.watched);
  const userEntries = useUserLibraryStore((state) => state.userEntries);

  const removeFromWatched = useUserLibraryStore(
    (state) => state.removeFromWatched,
  );

  const entries = Object.values(userEntries);

  const ratedEntries = entries.filter((entry) => entry.rating !== null);
  const notesEntries = entries.filter((entry) => entry.note.trim().length > 0);

  const averageRating =
    ratedEntries.length > 0
      ? ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) /
        ratedEntries.length
      : null;

  const allSavedItems = getUniqueItems([
    ...favorites,
    ...watchlist,
    ...watched,
  ]);
  const favoriteGenres = getFavoriteGenres(allSavedItems);

  const moviesCount = allSavedItems.filter(
    (item) => item.mediaType === "movie",
  ).length;

  const tvCount = allSavedItems.filter(
    (item) => item.mediaType === "tv",
  ).length;

  const preferredMediaType =
    moviesCount === tvCount
      ? "Баланс фильмов и сериалов"
      : moviesCount > tvCount
        ? "Больше фильмов"
        : "Больше сериалов";

  const latestActivity = entries
    .filter((entry) => entry.updatedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const totalItems = allSavedItems.length;

  const mediaTypeChartData = [
    {
      name: "Фильмы",
      value: moviesCount,
    },
    {
      name: "Сериалы",
      value: tvCount,
    },
  ].filter((item) => item.value > 0);

  const ratingChartData = Array.from({ length: 10 }, (_, index) => {
    const rating = index + 1;

    return {
      rating: String(rating),
      count: ratedEntries.filter((entry) => entry.rating === rating).length,
    };
  }).filter((item) => item.count > 0);

  const hasChartsData =
    mediaTypeChartData.length > 0 || ratingChartData.length > 0;

  return (
    <section>
      <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-400/30 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-44 w-44 rounded-full bg-violet-400/30 blur-3xl" />

          <div className="relative">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Movie tracker
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Личный профиль
            </h1>
            <p className="mb-8 max-w-3xl text-base leading-7 text-slate-300">
              Здесь собирается твоя личная статистика: сохранённые фильмы и
              сериалы, оценки, заметки, просмотренное и жанровые предпочтения.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">
                  Всего в библиотеке
                </p>
                <p className="text-3xl font-bold text-white">{totalItems}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Избранное</p>
                <p className="text-3xl font-bold text-cyan-300">
                  {favorites.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Хочу посмотреть</p>
                <p className="text-3xl font-bold text-violet-300">
                  {watchlist.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Просмотрено</p>
                <p className="text-3xl font-bold text-emerald-300">
                  {watched.length}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Моих оценок</p>
                <p className="text-3xl font-bold text-white">
                  {ratedEntries.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Средняя оценка</p>
                <p className="text-3xl font-bold text-yellow-200">
                  {averageRating !== null ? averageRating.toFixed(1) : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Заметок</p>
                <p className="text-3xl font-bold text-white">
                  {notesEntries.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-2 text-sm text-slate-400">Мой вкус</p>
                <p className="text-xl font-bold text-white">
                  {preferredMediaType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 p-5 sm:p-6">
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Аналитика
          </p>

          <h2 className="mb-2 text-2xl font-bold text-white">
            Графики активности
          </h2>

          <p className="text-sm text-slate-400">
            Визуальная статистика по сохранённым фильмам, сериалам и твоим
            оценкам.
          </p>
        </div>

        {hasChartsData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <div className="mb-4">
                <h3 className="text-lg">Фильмы / Сериалы</h3>
                <p className="font-bold text-white">
                  Распределение сохранённых тайтлов по типу контента.
                </p>
              </div>
              {mediaTypeChartData.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mediaTypeChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {mediaTypeChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={index === 0 ? "#a78bfa" : "#34d399"}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background: "#020617",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 text-sm text-slate-500">
                  Пока нет сохранённый фильмов или сериалов.
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-violet-400/15 px-3 py-1 font-semibold text-violet-200">
                  Фильмы: {moviesCount}
                </span>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-200">
                  Фильмы: {tvCount}
                </span>
              </div>
            </div>
            <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">
                  Распределение оценок
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Сколько тайтлов получило каждую пользовательскую оценку.
                </p>
              </div>

              {ratingChartData.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.08)"
                      />

                      <XAxis
                        dataKey="rating"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        tickLine={false}
                      />

                      <Tooltip
                        cursor={{fill: "rgba(255,255,255,0.08)"}}
                        contentStyle={{
                          background: "#020617",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "16px",
                          color: "#fff",
                        }}
                        labelFormatter={(label) => `Оценка: ${label}`}
                      />

                      <Bar
                        dataKey="count"
                        name="Количество"
                        fill="#22d3ee"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 px-5 text-center text-sm leading-6 text-slate-500">
                  Оценки появятся после того, как ты поставишь рейтинг фильмам
                  или сериалам на детальной странице.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-white">
                Любимые жанры
              </h2>
              <p className="text-sm text-slate-400">
                Считаются по сохранённым фильмам и сериалам.
              </p>
            </div>
          </div>
          {favoriteGenres.length ? (
            <div className="space-y-4">
              {favoriteGenres.map((genre) => {
                const maxCount = favoriteGenres[0]?.count || 1;
                const width = `${Math.max((genre.count / maxCount) * 100, 12)}%`;

                return (
                  <div key={genre.id}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-slate-200">
                        {genre.name}
                      </span>
                      <span className="text-slate-200">{genre.count}</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-950/70">
                      <div
                        className="h-full rounded-full bg-cyan-400/80"
                        style={{ width }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5 text-sm leading-6 text-slate-400">
              Жанры появятся после добавления фильма или сериала в избранное или
              просмотренное
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-5 text-xl font-bold text-white">Типы контента</h2>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Фильмы</span>
                  <span className="font-semibold text-white">
                    {moviesCount}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-950/70">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{
                      width: totalItems
                        ? `${Math.max((moviesCount / totalItems) * 100, moviesCount ? 10 : 0)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Сериалы</span>
                  <span className="font-semibold text-white">{tvCount}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-950/70">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: totalItems
                        ? `${Math.max((tvCount / totalItems) * 100, tvCount ? 10 : 0)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-5 text-xl font-bold text-white">
              Последняя активность
            </h2>

            {latestActivity.length ? (
              <div className="space-y-3">
                {latestActivity.map((entry) => (
                  <Link
                    key={`${entry.mediaType}-${entry.id}`}
                    to={`/${entry.mediaType === "movie" ? "movie" : "tv"}/${entry.id}`}
                    className="block rounded-2xl bg-slate-950/60 p-4 transition hover:bg-slate-900"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 font-bold text-slate-300">
                        {entry.mediaType === "movie" ? "Фильм" : "Сериал"}
                      </span>
                      <span className="text-slate-500">
                        {formatDate(entry.updatedAt)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300">
                      {entry.rating !== null
                        ? `Оценка: ${entry.rating} / 10`
                        : "Без оценки"}{" "}
                    </p>

                    {entry.note.trim() ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {entry.note}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-5">
                Активность появится после оценок или заметок на детальной
                странице.
              </p>
            )}
          </div>
        </aside>
      </div>
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl text-white font-bold">Просмотрено</h2>
          <p className="text-sm text-slate-400">
            Фильмы и сериалы, которые пользователь отметил как просмотренные.
          </p>
        </div>

        <LibraryGrid
          items={watched}
          emptyTitle="Просмотренных пока нет"
          emptyDescription="Откройте фильм или сериал и нажмите 'Отметить просмотренным'."
          onRemove={(item) => removeFromWatched(item.id, item.mediaType)}
        />
      </div>
    </section>
  );
};
