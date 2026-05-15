export type SearchMediaFilter = "all" | "movie" | "tv"

export type SearchSortType = "relevance" | "rating" | "date"

export type SearchPageState = {
    searchValue: string
    mediaFilter: SearchMediaFilter
    sortType: SearchSortType
    scrollY?: number
}