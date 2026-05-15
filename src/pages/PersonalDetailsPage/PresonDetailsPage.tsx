import { Link, useParams } from "react-router-dom";
import { usePersonDetails } from "../../features/people/hooks/usePersonDetails";
import { useMemo } from "react";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { EmptyState } from "../../shared/ui/EmptyState";
import { getTmdbImageUrl } from "../../shared/config/tmdb";
import { ROUTES } from "../../app/router/routes";
import { MovieRail } from "../../features/movies/components/MovieRail";

const formatDate = (date: string | null) => {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("ru-Ru", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const getAge = (birthday: string | null, deathday: string | null) => {
  if (!birthday) {
    return null;
  }

  const startDate = new Date(birthday);
  const endDate = deathday ? new Date(deathday) : new Date();

  let age = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && endDate.getDate() < startDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

export const PersonDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = usePersonDetails(id);

  const movieCredits = useMemo(() => {
    return (
      data?.combined_credits?.cast
        ?.filter((item) => item.media_type === "movie" && item.poster_path)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 18) ?? []
    );
  }, [data?.combined_credits?.cast]);

  const tvCredits = useMemo(() => {
    return (
      data?.combined_credits?.cast
        ?.filter((item) => item.media_type === "tv" && item.poster_path)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 18) ?? []
    );
  }, [data?.combined_credits?.cast]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message="Не удалось загрузить информацию об актёре" />;
  }

  if (!data) {
    return (
      <EmptyState
        title="Актёр не найден"
        description="Не удалось получить данные по этому человеку"
      />
    );
  }

  const profileUrl = getTmdbImageUrl(data.profile_path, "w500");
  const age = getAge(data.birthday, data.deathday);

  return (
    <section>
      <Link
        to={ROUTES.home}
        className="mb-6 inline-flex rounded-3xl border border-white/10 px-4 py-2 text-sm "
      >
        На главную
      </Link>

      <div className="overflow-hidden">
        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            {profileUrl ? (
              <img
                src={profileUrl}
                alt={data.name}
                className="aspect-[2/3] w-full h-full object-cover"
              />
            ) : (
              <div className="flex">Нет фото</div>
            )}
          </div>

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {data.know_for_department ? (
                <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                  {data.know_for_department}
                </span>
              ) : null}

              <span className="rounded-full flex items-center justify-center bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                Popularty {data.popularity.toFixed(1)}
              </span>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {data.name}
              </h1>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Дата рождения</p>
                  <p className="mt-1 font-semibold">
                    {formatDate(data.birthday)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Возраст</p>
                  <p className="mt-1 font-semibold">
                    {age ? `${age} лет` : "-"}
                  </p>
                </div>

                {data.deathday ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Возраст</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(data.deathday)}
                    </p>
                  </div>
                ) : null}
              </div>

              {data.biography ? (
                <div className="mt-7">
                  <h2 className="text-2xl font-bold">Биография</h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-300">
                    {data.biography}
                  </p>
                </div>
              ) : (
                <div className="mt-7 rounded-2xl bg-white/5 p-5 text-slate-400">
                  Биография пока отсутсвует.
                </div>
              )}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {data.external_ids?.imdb_id ? (
                <a
                  href={`https://www.imdb.com/name/${data.external_ids.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  IMDb
                </a>
              ) : null}
              {data.external_ids?.instagram_id ? (
                <a
                  href={`https://www.instagram.com/${data.external_ids.instagram_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Instagram
                </a>
              ) : null}
              {data.homepage ? (
                <a
                  href={data.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  Официальный сайт
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {data.also_known_as.length ? (
          <div className="border-t border-white/10 p-5 sm:p-8">
            <h2 className="text-xl font-bold">Так же известен как</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {data.also_known_as.slice(0, 12).map((name) => (
                <span key={name} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ):null}
      </div>

      {movieCredits.length ? (
        <MovieRail
          title="Фильмы с участием"
          description={`Лучшие фильмы, где снимался ${data.name}`}
          items={movieCredits}
          mediaType="movie"
        />
      ):null}

      {tvCredits.length ? (
        <MovieRail
          title="Сериалы с участием"
          description={`Лучшие сериалы, где снимался ${data.name}`}
          items={tvCredits}
          mediaType="tv"
        />
      ): null}
    </section>
  );
};
