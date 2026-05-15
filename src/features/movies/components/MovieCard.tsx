import { Link } from "react-router-dom";
import { getTmdbImageUrl } from "../../../shared/config/tmdb";
import type { MediaType, MovieListItem } from "../types/movie.type";

type MovieCardProps = {
  item: MovieListItem;
  mediaType: MediaType;
};

export const MovieCard = ({ item, mediaType }: MovieCardProps) => {
  const title = item.title || item.name || "Без названия";
  const date = item.release_date || item.first_air_date;
  const posterUrl = getTmdbImageUrl(item.poster_path, "w500");

  return (
    <Link to={`/${mediaType}/${item.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg shadow-black/20 transition duration-300 group-hover:shadow-cyan-950/20">
        <div className="aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
              Нет постера
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-white">
            {title}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">
              {date ? date.slice(0, 4) : "-"}
            </span>

            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 font-semibold text-cyan-300">
              {item.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
