import { useQuery } from "@tanstack/react-query"
import { moviesApi } from "../api/moviesApi"


export const useTopRatedMovies = () => {
    return useQuery({
        queryKey: ["top-rated-movies"],
        queryFn: moviesApi.getTopRatedMovies,
    })
}