import { Link, useParams } from "react-router-dom";
import { useCollectionDetails } from "../../features/movies/hooks/useCollectionDetails";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { EmptyState } from "../../shared/ui/EmptyState";
import { getTmdbImageUrl } from "../../shared/config/tmdb";
import { ROUTES } from "../../app/router/routes";

const getReleaseYear = (date?: string) => {
  if (!date) {
    return "Дата неизвестна";
  }
  return date.slice(0, 4);
};

export const CollectionPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useCollectionDetails(id);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message="Не удалось загрузить коллекцию." />;
  }

  if (!data) {
    return (
      <EmptyState
        title="Коллекция не найдена"
        description="Не удалось получить данные по этой коллекции."
      />
    );
  }

  const backdropUrl = getTmdbImageUrl(data.backdrop_path, "original");
  const posterUrl = getTmdbImageUrl(data.poster_path, "w500");

  const sortedParts = [...data.parts].sort((a, b) => {
    const firstDate = a.release_date || "";
    const secondDate = b.release_date || "";

    return firstDate.localeCompare(secondDate);
  });

  return (
    <section>
      <Link
        to={ROUTES.home}
        className="mb-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        На главную
      </Link>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30">
        <div className="relative min-h-[420px]">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={data.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/20" />

          <div className="relative flex min-h-[380px] items-end p-5 sm:p-8">
            <div className="grid w-full gap-6 md:grid-cols-[220px_1fr] md:items-end">
              <div className="mx-auto w-44 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 md:mx-0 md:w-full">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={data.name}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm text-slate-500">
                    Нет постера
                  </div>
                )}
              </div>

              <div>
                <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                  Коллекция
                </span>

                <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {data.name}
                </h1>

                <p className="mt-5 max-w-4xl text-base leading-7 text-slate-200">
                  {data.overview || "Описание коллекции пок аотсутствует."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Фильмы в коллекции
              </h2>

              <p className="mt-2 text-sm font-bold text-white">
                {sortedParts.length} частей в хронологии выхода
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sortedParts.map((movie) => {
              const moviePosterUrl = getTmdbImageUrl(movie.poster_path, "w342");
              const year = getReleaseYear(movie.release_date);

              return (
                <Link
                  to={`/movie/${movie.id}`}
                  key={movie.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-950/50"
                >
                  <div className="aspect-[2/3] bg-white/5">
                    {moviePosterUrl ? (
                      <img
                        src={moviePosterUrl}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                        Нет постера
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-slate-300">
                        {year}
                      </span>
                      <span className="rounded-full bg-yellow-400/10 px-2 py-1 font-semibold text-yellow-200">
                        {movie.vote_average 
                          ? movie.vote_average.toFixed(1)
                          : "-"
                        }
                      </span>
                    </div>

                    <h3 className="line-clamp-2 font-bold text-white">
                      {movie.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 leading-5 text-slate-400">
                      {movie.overview || "Описание отсутствует."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
