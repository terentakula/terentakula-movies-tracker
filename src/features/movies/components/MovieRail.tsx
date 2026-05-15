import type { MediaType, MovieListItem } from "../types/movie.type";
import { MovieCard } from "./MovieCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";

type MovieRailProps = {
  title: string;
  description: string;
  items: MovieListItem[];
  mediaType: MediaType;
};

export const MovieRail = ({
  title,
  description,
  items,
  mediaType,
}: MovieRailProps) => {
  if (!items.length) {
    return null;
  }
  return (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>

      <div className="movie-rail-swiper">
        <Swiper
            modules={[Navigation, FreeMode]}
            navigation
            freeMode
            grabCursor
            spaceBetween={16}
            slidesPerView={2.3}
            breakpoints={{
              480: {
                slidesPerView: 2.5,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 3.2,
                spaceBetween: 18,
              },
              768: {
                slidesPerView: 4.5,
                spaceBetween: 18,
              },
              1024: {
                slidesPerView: 5.5,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 20,
              },
            }}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className="pb-2">
              <MovieCard item={item} mediaType={mediaType} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
