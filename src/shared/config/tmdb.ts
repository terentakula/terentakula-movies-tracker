export const TMDB_CONFIG = {
    baseUrl: "https://api.themoviedb.org/3",
    imageBaseUrl: "https://image.tmdb.org/t/p",
    accessToken: import.meta.env.VITE_TMDB_ACCESS_TOKEN as string
} as const

export const getTmdbImageUrl = (
    path: string | null | undefined,
    size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
) => {
    if(!path) {
        return null
    }

    return `${TMDB_CONFIG.imageBaseUrl}/${size}${path}`
}