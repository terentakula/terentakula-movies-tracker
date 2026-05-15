import { useQuery } from "@tanstack/react-query"
import { moviesApi } from "../api/moviesApi"


export const useTopRatedTvShows = () => {
    return useQuery({
        queryKey: ["top-rated-tv-shows"],
        queryFn: moviesApi.getTopRatedShows,
    })
}