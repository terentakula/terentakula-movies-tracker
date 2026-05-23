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

export type UserMediaItemRow = {
    id: string
    user_id: string

    tmdb_id: number
    media_type: MediaType

    title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    release_date: string | null
    genres?: {
        id: number
        name: string
    }[]

    is_favorite: boolean
    is_watchlist: boolean
    is_watched: boolean

    rating: number | null
    note: string

    created_at: string
    updated_at:string
}

