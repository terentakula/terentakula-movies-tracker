import type { MediaType, MovieListItem } from "../types/movie.type";
import { MovieCard } from "./MovieCard";

type MovieSectionProps = {
  title: string;
  description: string;
  items: MovieListItem[];
  mediaType: MediaType;
};

export const MovieSection = ({
  title,
  description,
  items,
  mediaType,
}: MovieSectionProps) => {
  return (
    <section className="mt-10">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard key={item.id} item={item} mediaType={mediaType} />
        ))}
      </div>
    </section>
  );
};
