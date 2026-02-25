import { useCallback } from "react";

/**
 * Search state interface used across the application
 */
export interface SearchState {
  search: string;
  page: number;
  limit: number;
}

/**
 * Handlers returned by the useSearchPaginationHandlers hook
 */
export interface SearchPaginationHandlers {
  handleSearch: (value: string) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
}

/**
 * Custom hook that provides consistent search and pagination handlers
 *
 * This hook encapsulates the common pattern of updating search state
 * with proper page reset logic when search terms or limits change.
 *
 * @param setSearchState - State setter function for updating search state
 * @returns Object containing handleSearch, handlePageChange, and handleLimitChange functions
 *
 * @example
 * ```tsx
 * const [searchState, setSearchState] = useJobPositionsSearch();
 * const { handleSearch, handlePageChange, handleLimitChange } =
 *   useSearchPaginationHandlers(setSearchState);
 *
 * return (
 *   <>
 *     <SearchBar onSearch={handleSearch} value={searchState.search} />
 *     <List
 *       page={searchState.page}
 *       limit={searchState.limit}
 *       onPageChange={handlePageChange}
 *       onLimitChange={handleLimitChange}
 *     />
 *   </>
 * );
 * ```
 */
export const useSearchPaginationHandlers = <T extends SearchState>(
  setSearchState: React.Dispatch<React.SetStateAction<T>>,
): SearchPaginationHandlers => {
  /**
   * Handle search input changes
   * Resets to page 1 when search term changes
   */
  const handleSearch = useCallback(
    (value: string) => {
      setSearchState((prev) => ({ ...prev, search: value, page: 1 }));
    },
    [setSearchState],
  );

  /**
   * Handle page navigation
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchState((prev) => ({ ...prev, page: newPage }));
    },
    [setSearchState],
  );

  /**
   * Handle items per page changes
   * Resets to page 1 when limit changes
   */
  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setSearchState((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    },
    [setSearchState],
  );

  return {
    handleSearch,
    handlePageChange,
    handleLimitChange,
  };
};
