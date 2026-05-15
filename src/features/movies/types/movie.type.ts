export type MediaType = "movie" | "tv"

export type Genre = {
    id: number
    name: string
}

export type MovieListItem = {
    id: number
    title?: string
    name?: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    release_date?: string
    first_air_date?: string
    media_type?: MediaType
}

export type MovieListResponse = {
    page: number
    results: MovieListItem[]
    total_pages: number
    total_results: number
}

export type VideoItem = {
    id: string
    key: string
    name: string
    site: string
    type: string
    official: boolean
    published_at: string
}

export type VideosResponse = {
    results: VideoItem[]
}

export type CastMember = {
    id: number
    name: string
    character?: string
    profile_path: string | null
    order?: number
}

export type CreditsResponse = {
    cast: CastMember[]
}

export type MediaExtras = {
    videos?: VideosResponse
    credits?: CreditsResponse
    recommendations?: MovieListResponse
    images?: ImagesResponse
}

export type MovieDetails = MediaExtras & {
    id: number
    title: string
    original_title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    vote_count: number
    release_date: string
    runtime: number | null
    genres: Genre[]
    tagline: string
    status: string
    belongs_to_collection: CollectionSummary | null
}

export type TvDetails = MediaExtras & {
    id: number
    name: string
    original_name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    vote_count: number
    first_air_date: string
    number_of_seasons: number
    number_of_episodes: number
    genres: Genre[]
    tagline: string
    status: string
    seasons: SeasonSummary[]
}

export type MediaDetails = MovieDetails | TvDetails

export type SearchMediaType = "movie" | "tv" | "person"

export type SearchResultItem = {
    id: number
    media_type: SearchMediaType
    title?: string
    name?: string
    overview?: string
    poster_path?: string | null
    backdrop_path?: string | null
    profile_path?: string | null
    vote_average?: number
    release_date?: string
    first_air_date?: string
}

export type SearchResponse = {
    page: number
    results: SearchResultItem[]
    total_pages: number
    total_results: number
}

export type TrendingMediaItem = {
    id: number
    media_type: MediaType | "person"
    title?: string
    name?: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    release_date?: string
    first_air_date?: string
}

export type TrendingResponse = {
    page: number
    results: TrendingMediaItem[]
    total_pages: number
    total_results: number
}

export type ImageItem = {
    aspect_ratio: number
    height: number
    iso_639_1: string | null
    file_path: string
    vote_average: number
    vote_count: number
    width: number
}

export type ImagesResponse = {
    backdrops: ImageItem[]
    posters: ImageItem[]
    logos: ImageItem[]
}

export type CollectionSummary = {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
}

export type SeasonSummary = {
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
    episode_count: number
    air_date: string | null
    vote_average: number
}




