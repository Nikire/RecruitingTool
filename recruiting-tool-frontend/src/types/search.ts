/**
 * Search and Filtering Types
 *
 * Defines interfaces for advanced search and filtering functionality
 * across candidates, job positions, and hiring processes.
 */

export interface DateRange {
  start: string;
  end: string;
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  query?: string;
  status?: string[];
  dateRange?: DateRange;
  skills?: string[];
  location?: string;
  experience?: NumberRange;
  salary?: NumberRange;
  jobType?: string[];
  department?: string;
  remote?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SavedSearch {
  uid: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface ActiveFilter {
  type: string;
  label: string;
  value: string | string[] | DateRange | NumberRange;
  displayValue: string;
}
