import { Link } from "react-router-dom";
import { getTmdbImageUrl } from "../../../shared/config/tmdb";
import type { LibraryItem } from "../types/userLibrary.types";

type LibraryCardProps = {
  item: LibraryItem;
  onRemove?: () => void;
};

export const LibraryCard = ({ item, onRemove }: LibraryCardProps) => {
  const posterUrl = getTmdbImageUrl(item.posterPath, "w500");
  const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "-";
  const mediaLabel = item.mediaType === "movie" ? "Фильм" : "Сериал";

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
      <Link to={`/${item.mediaType}/${item.id}`} className="block">
        <div className="aspect-[2/3] overflow-hidden bg-slate-900">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={item.title}
              className="w-full h-full object-cover transition duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
              Нет постера
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-300">{mediaLabel}</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">{year}</span>
        </div>

        <Link to={`/${item.mediaType}/${item.id}`}>
            <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-white transition hover:text-cyan-300">{item.title}</h3>
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-sm font-semibold text-yellow-200">
                {item.voteAverage ? item.voteAverage.toFixed(1) : null}
            </span>

            {onRemove ? (
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-bold text-red-200 transition hover:bg-red-500/10"
                >
                    Удалить
                </button>
            ) : null}
        </div>
      </div>
    </article>
  );
};
