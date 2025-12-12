/**
 * Barrel export file for shared types
 * Makes importing types easier: import { SearchableListProps } from '@/types';
 */

// Search and pagination types
export type {
  PaginationState,
  SearchState,
  SortState,
  SearchPaginationProps,
  BasicListProps,
  SearchableListProps,
} from "./search-pagination.types";

// Existing pagination types (for backward compatibility)
export type {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
} from "./pagination.types";
