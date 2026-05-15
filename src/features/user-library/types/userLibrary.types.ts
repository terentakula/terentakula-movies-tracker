import type { MediaType } from "../../movies/types/movie.type"


export type LibraryItem = {
    id: number
    mediaType: MediaType
    title: string
    overview: string
    posterPath: string | null
    backdropPath: string | null
    voteAverage: number
    releaseDate: string | null
    genres?: {
        id: number
        name: string
    }[]
}

export type LibraryStatus = "favorite" | "watchlist" | "watched"

export type UserMediaEntry = {
    id: number
    mediaType: MediaType
    rating: number | null
    note: string
    updatedAt: string
}

