import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { useSearchMedia } from "../../features/movies/hooks/useSearchMedia";
import type { SearchResultItem } from "../../features/movies/types/movie.type";
import { EmptyState } from "../../shared/ui/EmptyState";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { SearchResultCard } from "../../features/movies/components/SearchResultCard";
import type {
  SearchMediaFilter,
  SearchPageState,
  SearchSortType,
} from "../../features/movies/types/search.types";
import { useLocation } from "react-router-dom";

const mediaFilters: { label: string; value: SearchMediaFilter }[] = [
  { label: "Все", value: "all" },
  { label: "Фильмы", value: "movie" },
  { label: "Сериалы", value: "tv" },
];

const sortOptions: { label: string; value: SearchSortType }[] = [
  { label: "По релевантности", value: "relevance" },
  { label: "По рейтингу", value: "rating" },
  { label: "По дате выхода", value: "date" },
];

const getItemDate = (item: SearchResultItem) => {
  return item.release_date || item.first_air_date || "";
};

export const SearchPage = () => {
  const location = useLocation();

  const restoredSearchState =
    location.state && typeof location.state === "object"
      ? (location.state as { searchState?: SearchPageState }).searchState
      : undefined;

  const [searchValue, setSearchValue] = useState(
    restoredSearchState?.searchValue ?? "",
  );
  const [mediaFilter, setMediaFilter] = useState<SearchMediaFilter>(
    restoredSearchState?.mediaFilter ?? "all",
  );
  const [sortType, setSortType] = useState<SearchSortType>(
    restoredSearchState?.sortType ?? "relevance",
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const didRestoreScrollRef = useRef(false)
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
  } = useSearchMedia({
    query: debouncedSearchValue,
  });

  const results = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    const uniqueItems = new Map<string, SearchResultItem>()

    data.pages
      .flatMap((page) => page.results)
      .filter(
        (item): item is SearchResultItem =>
          item.media_type === "movie" || item.media_type === "tv",
      )
      .forEach((item) => {
        const key = `${item.media_type}-${item.id}`

        if(!uniqueItems.has(key)) {
          uniqueItems.set(key, item)
        }
      })

      return Array.from(uniqueItems.values())
  }, [data]);

  const preparedResults = useMemo(() => {
    const filteredResults = results.filter((item) => {
      if (mediaFilter === "all") {
        return true;
      }

      return item.media_type === mediaFilter;
    });

    if (sortType === "relevance") {
      return filteredResults;
    }

    return [...filteredResults].sort((a, b) => {
      if (sortType === "rating") {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }

      const dateA = getItemDate(a);
      const dateB = getItemDate(b);

      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [results, mediaFilter, sortType]);

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (
          firstEntry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          debouncedSearchValue.trim().length >= 2
        ) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "400px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, debouncedSearchValue]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 700)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  },[])

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  

  const normalizedSearchValue = searchValue.trim();
  const normalizedDebouncedValue = debouncedSearchValue.trim();

  const totalLoadedresults = results.length;

  const isSearchTooShort =
    normalizedSearchValue.length > 0 && normalizedSearchValue.length < 2;

  const shouldShowStartState = normalizedSearchValue.length === 0;

  const shouldShowEmptyState =
    normalizedDebouncedValue.length >= 2 &&
    !isLoading &&
    !isError &&
    preparedResults.length === 0;

  const shouldShowResults =
    !isLoading && !isError && preparedResults.length > 0;

  const currentSearchState: SearchPageState = {
    searchValue,
    mediaFilter,
    sortType,
  };

  useEffect(() => {
    const scrollY = restoredSearchState?.scrollY ?? 0

    if (didRestoreScrollRef.current) {
      return
    }

    if(!scrollY || isLoading || isFetchingNextPage || !shouldShowResults) {
      return
    }

    const maxScrollY = 
    document.documentElement.scrollHeight - window.innerHeight

    const canRestoreScroll = maxScrollY >= scrollY - 100

    if(!canRestoreScroll && hasNextPage) {
      fetchNextPage()
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        const actualMaxScroll = 
        document.documentElement.scrollHeight - window.innerHeight

        window.scrollTo({
          top: Math.min(scrollY, actualMaxScroll),
          behavior: "auto",
        })

        didRestoreScrollRef.current = true
      })
    }, 100)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    restoredSearchState?.scrollY,
    isLoading,
    isFetchingNextPage,
    shouldShowResults,
    preparedResults.length,
    hasNextPage,
    fetchNextPage
  ])

  return (
    <section>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Поиск
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Поиск фильмов и сериалов
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Введите название фильма или сериала. Мы найдём результаты через TMDB и
          откроем детальную страницу с постером, рейтингом, жанрами и описанием.
        </p>
        <div className="mt-8">
          <label htmlFor="search" className="mb-2 block text-sm font-semibold">
            Название
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Например: Интерстеллар, Ведьмак, Breaking Bad..."
              className="min-h-12 flex-1 rounded-full border border-white/10 bg-slate-950 px-5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />

            {searchValue ? (
              <button
                className="min-h-12 rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                type="button"
                onClick={() => setSearchValue("")}
              >
                Очистить
              </button>
            ) : null}
          </div>

          {isSearchTooShort ? (
            <p className="mt-3 text-sm text-yellow-200">
              Введите минимум 2 символа для поиска.
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-300">
              Категория
            </p>

            <div className="flex flex-wrap gap-2">
              {mediaFilters.map((filter) => {
                const isActive = mediaFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setMediaFilter(filter.value)}
                    className={[
                      "rounded-full px-5 py-3 text-sm font-bold transition",
                      isActive
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              className="mb-3 block text-sm font-semibold text-slate-300"
              htmlFor="sort"
            >
              Сортировка
            </label>
            <select
              id="sort"
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SearchSortType)}
              className="min-h-12 w-full rounded-full border border-white/10 bg-slate-950 px-5 text-sm font-bold text-white outline-none transition focus:border-cyan-500"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-slate-950 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {shouldShowStartState ? (
          <EmptyState
            title="Начните поиск"
            description="Введите название фильма или сериала в поле выше."
          />
        ) : null}

        {isLoading ? <LoadingState /> : null}

        {isError ? (
          <ErrorState message="Не удалось выполнить поиск. Проверьте подключение или TMDB." />
        ) : null}

        {shouldShowEmptyState ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте изменить запрос или ввести оригинальное название."
          />
        ) : null}

        {shouldShowResults ? (
          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Результаты поиска</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Показано: {preparedResults.length}. Загружено из TMDB: {""}{" "}
                  {totalLoadedresults}.
                </p>
              </div>

              <p className="text-sm text-slate-500">
                Фильтр:{" "}
                <span className="font-semibold text-slate-300">
                  {
                    mediaFilters.find((filter) => filter.value === mediaFilter)
                      ?.label
                  }
                </span>
              </p>
            </div>

            <div className="grid gap-4">
              {preparedResults.map((item) => (
                <SearchResultCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  searchState={currentSearchState}
                />
              ))}
            </div>

            <div ref={loadMoreRef} className="h-10" />

            {isFetchingNextPage ? (
              <div className="mt-6">
                <LoadingState />
              </div>
            ) : null}

            {!hasNextPage && preparedResults.length > 0 ? (
              <p className="mt-6 text-center text-sm text-slate-500">
                Больше результатов нет.
              </p>
            ) : null}

            {isFetching && !isFetchingNextPage ? (
              <p className="mt-6 text-center text-sm text-slate-500">
                Обновляем результаты...
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {showScrollTopButton ? (
        <button
          type="button"
          onClick={scrollTop}
          className="fixed bottom-6 right-6 z-50 rounded-full border border-white/10 bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-2xl shadow-black/40 transition hover:bg-cyan-300"
        >
          Наверх
        </button>
      ): null}
    </section>
  );
};
