import { useQuery } from "@tanstack/react-query"
import { moviesApi } from "../api/moviesApi"

export const usePopularMovies = () => {
    return useQuery({
        queryKey: ["popular-movies"],
        queryFn: moviesApi.getPopularMovies,
    })
}