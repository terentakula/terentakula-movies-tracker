import { useQuery } from "@tanstack/react-query"
import { moviesApi } from "../api/moviesApi"


export const useTrendingWeek = () => {
    return useQuery({
        queryKey: ["trending-week"],
        queryFn: moviesApi.getTrendingWeek,
    })
}