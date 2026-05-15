import { tmdbClient } from "../../../shared/api/tmdbClient";
import type { CollectionDetails } from "../types/collection.types";
import type {
  MovieDetails,
  MovieListResponse,
  SearchResponse,
  TrendingResponse,
  TvDetails,
} from "../types/movie.type";

const DETAIL_APPEND_TO_RESPONSE = "videos,credits,recommendations,images";

export const moviesApi = {
  getPopularMovies: async () => {
    const response = await tmdbClient.get<MovieListResponse>("/movie/popular");

    return response.data;
  },
  getPopularTvShows: async () => {
    const response = await tmdbClient.get<MovieListResponse>("/tv/popular");

    return response.data;
  },

  getTopRatedMovies: async () => {
    const response =
      await tmdbClient.get<MovieListResponse>("/movie/top_rated");

    return response.data;
  },
  getTopRatedShows: async () => {
    const response = await tmdbClient.get<MovieListResponse>("/tv/top_rated");

    return response.data;
  },

  getTrendingWeek: async () => {
    const response =
      await tmdbClient.get<TrendingResponse>("/trending/all/week");

    return response.data;
  },

  getMovieDetails: async (id: string) => {
    const response = await tmdbClient.get<MovieDetails>(`/movie/${id}`, {
      params: {
        append_to_response: DETAIL_APPEND_TO_RESPONSE,
      },
    });

    return response.data;
  },
  getTvDetails: async (id: string) => {
    const response = await tmdbClient.get<TvDetails>(`/tv/${id}`, {
      params: {
        append_to_response: DETAIL_APPEND_TO_RESPONSE,
      },
    });

    return response.data;
  },
  searchMulti: async (query: string, page = 1) => {
    const response = await tmdbClient.get<SearchResponse>("/search/multi", {
      params: {
        query,
        page,
        include_adult: false,
      },
    });

    return response.data;
  },

  getCollectionDetails: async (collectionId: string) => {
    const response = await tmdbClient.get<CollectionDetails>(
      `/collection/${collectionId}`,
    )

    return response.data
  }
};
