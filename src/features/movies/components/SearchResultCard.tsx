import { useNavigate } from "react-router-dom";
import { getTmdbImageUrl } from "../../../shared/config/tmdb";
import type { SearchResultItem } from "../types/movie.type";
import type { SearchPageState } from "../types/search.types";

type SearchResultCardProps = {
  item: SearchResultItem;
  searchState?: SearchPageState;
};

export const SearchResultCard = ({
  item,
  searchState,
}: SearchResultCardProps) => {
  const navigate = useNavigate();

  const title = item.title || item.name || "Без названия";
  const date = item.release_date || item.first_air_date;
  const posterUrl = getTmdbImageUrl(item.poster_path, "w500");

  const rating =
    typeof item.vote_average === "number" && item.vote_average > 0
      ? item.vote_average.toFixed(1)
      : "-";

  const mediaLabel = item.media_type === "movie" ? "Фильм" : "Сериал";

  const handleOpenDetails = () => {
    navigate(`/${item.media_type}/${item.id}`, {
      state: searchState
        ? {
            fromSearch: true,
            searchState: {
              ...searchState,
              scrollY: window.scrollY,
            },
          }
        : undefined,
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpenDetails}
      className="group grid gap-4 rounded-3xl border border-white/10  bg-white/5 p-3 transition hover:-translate-y-1 hover:bg-white/10 sm:grid-cols-[180px_1fr]"
    >
      <div className="mx-auto w-full max-w-[180px] overflow-hidden rounded-2xl bg-slate-900 sm:max-w-none">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="aspect-[2/3] w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-sm text-slate-500">
            Нет постера
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between py-1">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              {mediaLabel}
            </span>

            {date ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                {date.slice(0, 4)}
              </span>
            ) : null}

            <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200">
              Райтинг {rating}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white">{title}</h3>

          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">
            {item.overview || "Описание отсутсвует."}
          </p>
        </div>

        <p className="mt-5 text-sm font-semibold text-cyan-300">Подробнее</p>
      </div>
    </button>
  );
};
