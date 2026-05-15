import type { MediaType, MovieListItem } from "../../movies/types/movie.type";

export type PersonCombinedCredit = MovieListItem & {
    media_type: MediaType
    character?: string
    job?: string
    order?: number
}

export type PersonCombinedCreditsResponse = {
    cast: PersonCombinedCredit[]
    crew: PersonCombinedCredit[]
}

export type PersonExternalIds = {
    imdb_id: string | null
    instagram_id: string | null
    twitter_id: string | null
    facebook_id: string | null
}

export type PersonDetails = {
    id: number
    name: string
    biography: string
    birthday: string | null
    deathday: string | null
    place_of_birth: string | null
    profile_path: string | null
    know_for_department: string
    popularity: number
    homepage: string | null
    also_known_as: string[]
    combined_credits?: PersonCombinedCreditsResponse
    external_ids?: PersonExternalIds
}
