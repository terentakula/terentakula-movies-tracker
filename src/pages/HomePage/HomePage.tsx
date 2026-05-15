import { usePopularTvShows } from "../../features/movies/hooks/usePopularTvShows";
import { usePopularMovies } from "../../features/movies/hooks/usePopularMovies";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { useTrendingWeek } from "../../features/movies/hooks/useTrendingWeek";
import { useTopRatedMovies } from "../../features/movies/hooks/useTopRatedMovies";
import { useTopRatedTvShows } from "../../features/movies/hooks/useTopRatedTvShows";
import { TrendingHero } from "../../features/movies/components/TrendingHero";
import { MovieRail } from "../../features/movies/components/MovieRail";

export const HomePage = () => {
  const {
    data: trending,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
  } = useTrendingWeek();

  const {
    data: popularMovies,
    isLoading: isMoviesLoading,
    isError: isMoviesError,
  } = usePopularMovies();

  const {
    data: popularTvShows,
    isLoading: isTvLoading,
    isError: isTvError,
  } = usePopularTvShows();

  const {
    data: topRatedMovies,
    isLoading: isTopMoviesLoading,
    isError: isTopMoviesError,
  } = useTopRatedMovies();

  const {
    data: topRatedTvShows,
    isLoading: isTopTvShowsLoading,
    isError: isTopTvShowsError,
  } = useTopRatedTvShows();

    const isLoading =
    isTrendingLoading ||
    isMoviesLoading ||
    isTvLoading ||
    isTopMoviesLoading ||
    isTopTvShowsLoading;

  const isError =
    isTrendingError ||
    isMoviesError ||
    isTvError ||
    isTopMoviesError ||
    isTopTvShowsError;

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message="Не удалось загрузить фильмы и сериалы. Проверь TMDB токен в .env" />
    );
  }

  return (
    <section>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Portfolio Project
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Terentakula Movies Tracker
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Приложение для поиска фильмов и сериалов, ведения watchlist,
          избранного, просмотренного и личной статистики.
        </p>
      </div>

      <div>
        {trending?.results ? <TrendingHero items={trending?.results} /> : null}

        {popularMovies?.results ? (
          <MovieRail
            title="Популярные фильмы"
            description="Фильмы, которые сейчас чаще всего смотрят и обсуждают."
            items={popularMovies.results.slice(0, 12)}
            mediaType="movie"
          />
        ) : null}

        {popularTvShows?.results ? (
          <MovieRail
            title="Популярные сериалы"
            description="Сериалы, которые сейчас находятся в топе."
            items={popularTvShows.results.slice(0, 12)}
            mediaType="tv"
          />
        ) : null}

        {topRatedMovies?.results ? (
          <MovieRail
            title="Лучшие фильмы по рейтингу"
            description="Высоко оценённые фильмы из базы TMDB."
            items={topRatedMovies.results.slice(0, 12)}
            mediaType="movie"
          />
        ) : null}

        {topRatedTvShows?.results ? (
          <MovieRail
            title="Лучшие сериалы по рейтингу"
            description="Высоко оценённые сериалы из базы TMDB."
            items={topRatedTvShows.results.slice(0, 12)}
            mediaType="tv"
          />
        ) : null}
      </div>
    </section>
  );
};
