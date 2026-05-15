import { useQuery } from "@tanstack/react-query"
import { moviesApi } from "../api/moviesApi"

export const usePopularTvShows= () => {
    return useQuery({
        queryKey: ["popular-tv-shows"],
        queryFn: moviesApi.getPopularTvShows,
    })
}