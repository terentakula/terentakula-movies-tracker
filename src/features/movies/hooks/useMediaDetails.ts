import { useQuery } from "@tanstack/react-query"
import type { MediaDetails, MediaType } from "../types/movie.type"
import { moviesApi } from "../api/moviesApi"

type UseMediaDetailsParams = {
    id: string | undefined
    mediaType: MediaType
}

export const useMediaDetails = ({ id, mediaType}: UseMediaDetailsParams) => {
    return useQuery<MediaDetails>({
        queryKey: ["media-details", mediaType,id],
        queryFn:() => {
            if (!id) {
                throw new Error("Не передан id")
            }

            if (mediaType === "movie") {
                return moviesApi.getMovieDetails(id)
            }

            return moviesApi.getTvDetails(id)
        },
        enabled: Boolean(id)
    })
}