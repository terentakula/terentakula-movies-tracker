export type CollectionPart = {
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    release_date: string
    vote_average: number
    vote_count: number
    media_type?: "movie"
}

export type CollectionDetails = {
    id: number
    name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    parts: CollectionPart[]
}