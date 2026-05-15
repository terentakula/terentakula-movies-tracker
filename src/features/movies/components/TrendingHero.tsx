import { Link } from "react-router-dom";
import { getTmdbImageUrl } from "../../../shared/config/tmdb";
import type { TrendingMediaItem } from "../types/movie.type";
import { useEffect, useMemo, useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

type TrendingHeroProps = {
  items: TrendingMediaItem[];
};

export const TrendingHero = ({ items }: TrendingHeroProps) => {
  const slides = useMemo(() => {
    return items
      .filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          item.backdrop_path &&
          item.poster_path,
      )
      .slice(0, 6);
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [manumalChangeCount, setManualChangeCount] = useState(0);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) =>
        current === slides.length - 1 ? 0 : current + 1,
      );
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [slides.length, isPaused, manumalChangeCount]);

  if (!slides.length) {
    return null;
  }

  const safeActiveIndex = activeIndex >= slides.length ? 0 : activeIndex;
  const activeItem = slides[safeActiveIndex];

  const title = activeItem.title || activeItem.name || "Без названия";
  const date = activeItem.release_date || activeItem.first_air_date;
  const year = date ? date.slice(0, 4) : null;
  const backdropUrl = getTmdbImageUrl(activeItem.backdrop_path, "original");
  const posterUrl = getTmdbImageUrl(activeItem.poster_path, "w500");
  const rating = activeItem.vote_average
    ? activeItem.vote_average.toFixed(1)
    : "-";

  const mediaLabel = activeItem.media_type === "movie" ? "Фильм" : "Сериал";

  const changesSlideManually = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    setManualChangeCount((count) => count + 1);
  };

  const goPrev = () => {
    const nextIndex =
      safeActiveIndex === 0 ? slides.length - 1 : safeActiveIndex - 1;

    changesSlideManually(nextIndex);
  };
  const goNext = () => {
    const nextIndex =
      safeActiveIndex >= slides.length - 1 ? 0 : safeActiveIndex + 1;

    changesSlideManually(nextIndex);
  };

  return (
    <section
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[460px]">
        {backdropUrl ? (
          <img
            key={backdropUrl}
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />

        <div className="relative grid min-h-[460px] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_260px] lg:items-end">
          <div className="flex flex-col justify-end">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Топ этой недели
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                {mediaLabel}
              </span>

              {year ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {year}
                </span>
              ) : null}

              <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-200">
                Рейтинг: {rating}
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              {title}
            </h1>

            <p className="mt-5 line-clamp-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
              {activeItem.overview || "Описание пока отсутствует."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/${activeItem.media_type}/${activeItem.id}`}
                className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Подробнее
              </Link>

              <Link
                to="/search"
                className="rounded-full px-5 py-3 text-sm font-bold border border-white/15 text-white transition hover:bg-white/10"
              >
                Найти другое
              </Link>
            </div>

            {slides.length > 1 ? (
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                  aria-label="Назад"
                >
                  <GrFormPrevious size={50}/>
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                  aria-label="Вперед"
                >
                  <GrFormNext size={50} />
                </button>

                <div className="ml-2 flex items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => changesSlideManually(index)}
                      className={[
                        "h-2 rounded-full transition",
                        index === safeActiveIndex
                          ? "w-8 bg-cyan-300"
                          : "w-2 bg-white/30 hover:bg-white/60",
                      ].join(" ")}
                      aria-label={`Перейти к слайду ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 lg:block">
            {posterUrl ? (
              <img
                key={posterUrl}
                src={posterUrl}
                alt={title}
                className="aspect-[2/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm text-slate-400">
                Нет постера
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
