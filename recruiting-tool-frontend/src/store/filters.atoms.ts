/**
 * Filter and Search State Atoms
 *
 * Manages search, filter, and pagination state for list pages.
 * These are in-memory only (reset on page refresh) because
 * filter state is typically session-specific.
 *
 * For persistent filters, consider using atomWithStorage.
 *
 * @example
 * ```tsx
 * // Reading filter state
 * const filters = useAtomValue(candidateFiltersAtom);
 *
 * // Updating filter state
 * const setFilters = useSetAtom(candidateFiltersAtom);
 * setFilters(prev => ({ ...prev, search: 'John' }));
 * ```
 */
import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Base filter state interface
 * All list pages share these common fields
 */
export interface BaseFilterState {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Search query string */
  search: string;
  /** Sort field name */
  sortBy: string;
  /** Sort direction */
  sortOrder: "asc" | "desc";
}

/**
 * Candidate-specific filter state
 */
export interface CandidateFilterState extends BaseFilterState {
  /** Filter by candidate source */
  source?: string;
}

/**
 * Job Position-specific filter state
 */
export interface JobPositionFilterState extends BaseFilterState {
  /** Filter by status: OPEN, CLOSED, CANCELLED */
  status?: "OPEN" | "CLOSED" | "CANCELLED" | "all";
  /** Filter by company UID */
  companyUid?: string;
}

/**
 * Hiring Process-specific filter state
 */
export interface HiringProcessFilterState extends BaseFilterState {
  /** Filter by status */
  status?: "OPEN" | "CLOSED" | "IN_PROGRESS" | "CANCELLED" | "REJECTED" | "all";
}

/**
 * Application-specific filter state
 */
export interface ApplicationFilterState extends BaseFilterState {
  /** Filter by status */
  status?: "PENDING" | "REVIEWED" | "REJECTED" | "ACCEPTED" | "all";
  /** Filter by job position UID */
  jobPositionUid?: string;
}

// ============================================================================
// Default States
// ============================================================================

const createDefaultFilterState = (sortBy = "createdAt"): BaseFilterState => ({
  page: 1,
  limit: 25,
  search: "",
  sortBy,
  sortOrder: "desc",
});

// ============================================================================
// Candidate Filters
// ============================================================================

export const candidateFiltersAtom = atom<CandidateFilterState>({
  ...createDefaultFilterState(),
});

/** Derived: Check if any filters are active */
export const hasCandidateFiltersAtom = atom((get) => {
  const filters = get(candidateFiltersAtom);
  return filters.search !== "" || filters.source !== undefined;
});

// Hooks
export const useCandidateFiltersValue = () =>
  useAtomValue(candidateFiltersAtom);
export const useCandidateFiltersSetter = () => useSetAtom(candidateFiltersAtom);
export const useHasCandidateFilters = () =>
  useAtomValue(hasCandidateFiltersAtom);

// ============================================================================
// Job Position Filters
// ============================================================================

export const jobPositionFiltersAtom = atom<JobPositionFilterState>({
  ...createDefaultFilterState(),
  status: "all",
});

/** Derived: Check if any filters are active */
export const hasJobPositionFiltersAtom = atom((get) => {
  const filters = get(jobPositionFiltersAtom);
  return (
    filters.search !== "" ||
    (filters.status !== undefined && filters.status !== "all") ||
    filters.companyUid !== undefined
  );
});

// Hooks
export const useJobPositionFiltersValue = () =>
  useAtomValue(jobPositionFiltersAtom);
export const useJobPositionFiltersSetter = () =>
  useSetAtom(jobPositionFiltersAtom);
export const useHasJobPositionFilters = () =>
  useAtomValue(hasJobPositionFiltersAtom);

// ============================================================================
// Hiring Process Filters
// ============================================================================

export const hiringProcessFiltersAtom = atom<HiringProcessFilterState>({
  ...createDefaultFilterState(),
  status: "all",
});

/** Derived: Check if any filters are active */
export const hasHiringProcessFiltersAtom = atom((get) => {
  const filters = get(hiringProcessFiltersAtom);
  return (
    filters.search !== "" ||
    (filters.status !== undefined && filters.status !== "all")
  );
});

// Hooks
export const useHiringProcessFiltersValue = () =>
  useAtomValue(hiringProcessFiltersAtom);
export const useHiringProcessFiltersSetter = () =>
  useSetAtom(hiringProcessFiltersAtom);
export const useHasHiringProcessFilters = () =>
  useAtomValue(hasHiringProcessFiltersAtom);

// ============================================================================
// Application Filters
// ============================================================================

export const applicationFiltersAtom = atom<ApplicationFilterState>({
  ...createDefaultFilterState("appliedAt"),
  status: "all",
});

/** Derived: Check if any filters are active */
export const hasApplicationFiltersAtom = atom((get) => {
  const filters = get(applicationFiltersAtom);
  return (
    filters.search !== "" ||
    (filters.status !== undefined && filters.status !== "all") ||
    filters.jobPositionUid !== undefined
  );
});

// Hooks
export const useApplicationFiltersValue = () =>
  useAtomValue(applicationFiltersAtom);
export const useApplicationFiltersSetter = () =>
  useSetAtom(applicationFiltersAtom);
export const useHasApplicationFilters = () =>
  useAtomValue(hasApplicationFiltersAtom);

// ============================================================================
// Company Filters (simple, no status)
// ============================================================================

export const companyFiltersAtom = atom<BaseFilterState>(
  createDefaultFilterState("name"),
);

// Hooks
export const useCompanyFiltersValue = () => useAtomValue(companyFiltersAtom);
export const useCompanyFiltersSetter = () => useSetAtom(companyFiltersAtom);

// ============================================================================
// User Filters (simple, no status)
// ============================================================================

export const userFiltersAtom = atom<BaseFilterState>(
  createDefaultFilterState("name"),
);

// Hooks
export const useUserFiltersValue = () => useAtomValue(userFiltersAtom);
export const useUserFiltersSetter = () => useSetAtom(userFiltersAtom);

// ============================================================================
// Email Template Filters
// ============================================================================

export const emailTemplateFiltersAtom = atom<BaseFilterState>(
  createDefaultFilterState("name"),
);

// Hooks
export const useEmailTemplateFiltersValue = () =>
  useAtomValue(emailTemplateFiltersAtom);
export const useEmailTemplateFiltersSetter = () =>
  useSetAtom(emailTemplateFiltersAtom);

// ============================================================================
// Legacy Compatibility Exports
// Maintains backward compatibility with existing useSearchState imports
// ============================================================================

/** @deprecated Use candidateFiltersAtom instead */
export const candidatesSearchAtom = candidateFiltersAtom;
/** @deprecated Use companyFiltersAtom instead */
export const companiesSearchAtom = companyFiltersAtom;
/** @deprecated Use hiringProcessFiltersAtom instead */
export const hiringProcessesSearchAtom = hiringProcessFiltersAtom;
/** @deprecated Use jobPositionFiltersAtom instead */
export const jobPositionsSearchAtom = jobPositionFiltersAtom;
/** @deprecated Use userFiltersAtom instead */
export const usersSearchAtom = userFiltersAtom;
