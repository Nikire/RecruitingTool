/**
 * Shared types for search, pagination, and filtering across list components
 * Used by CandidatesList, JobPositionsList, ApplicationsList, etc.
 */

/**
 * Pagination state for list components
 */
export interface PaginationState {
	page: number;
	pageSize: number;
	total: number;
}

/**
 * Search state for list components
 */
export interface SearchState {
	query: string;
	filters?: Record<string, unknown>;
}

/**
 * Sort state for list components
 */
export interface SortState {
	field: string;
	direction: 'asc' | 'desc';
}

/**
 * Comprehensive props interface for list components with search, pagination, and sorting
 * Used to reduce duplicate prop definitions across similar list components
 */
export interface SearchPaginationProps {
	// Pagination
	pagination: PaginationState;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;

	// Search (optional)
	search?: SearchState;
	onSearchChange?: (query: string) => void;

	// Sort (optional)
	sort?: SortState;
	onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

/**
 * Simplified props for basic list components that only need pagination
 * Example: Simple lists without search or filtering
 */
export interface BasicListProps {
	page: number;
	limit: number;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

/**
 * Extended props for list components that also support search
 * Example: CandidatesList, JobPositionsList
 */
export interface SearchableListProps extends BasicListProps {
	search: string;
}
