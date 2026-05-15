import { useInfiniteQuery } from "@tanstack/react-query";
import { moviesApi } from "../api/moviesApi";

type UseSearchMediaParams = {
  query: string;
};

export const useSearchMedia = ({ query }: UseSearchMediaParams) => {
  const normalizedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: ["search-media", normalizedQuery],
    queryFn: ({ pageParam }) =>
      moviesApi.searchMulti(normalizedQuery, pageParam),
    initialPageParam: 1,
    enabled: normalizedQuery.length >= 2,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.total_pages) {
        return undefined;
      }

      return lastPage.page + 1;
    },
  });
};
