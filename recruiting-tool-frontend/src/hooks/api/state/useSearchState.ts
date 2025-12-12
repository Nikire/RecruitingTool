/**
 * @deprecated Import from '../../../store' instead
 *
 * This file is kept for backwards compatibility.
 * All new code should import from the centralized store:
 *
 * @example
 * ```tsx
 * // Old (deprecated)
 * import { candidatesSearchAtom } from '../../hooks/api/state/useSearchState';
 *
 * // New (preferred)
 * import {
 *   candidateFiltersAtom,
 *   useCandidateFiltersValue,
 *   useCandidateFiltersSetter,
 * } from '../store';
 * ```
 *
 * The new atoms have additional features:
 * - Status filters (OPEN, CLOSED, etc.)
 * - Sort field and direction
 * - Derived atoms for hasActiveFilters
 *
 * @see filters.atoms.ts for the new implementation
 */

// Re-export everything from the centralized store for backwards compatibility
export type { BaseFilterState as SearchState } from "../../../store";

export {
  // Legacy atom exports (deprecated, use new filter atoms)
  candidatesSearchAtom,
  companiesSearchAtom,
  hiringProcessesSearchAtom,
  jobPositionsSearchAtom,
  usersSearchAtom,
  // New recommended atoms
  candidateFiltersAtom,
  companyFiltersAtom,
  hiringProcessFiltersAtom,
  jobPositionFiltersAtom,
  userFiltersAtom,
} from "../../../store";

import { useAtomValue, useSetAtom } from "jotai";
import {
  candidateFiltersAtom,
  companyFiltersAtom,
  hiringProcessFiltersAtom,
  jobPositionFiltersAtom,
  userFiltersAtom,
} from "../../../store";

// ============================================================================
// Legacy Hooks (for backward compatibility)
// These wrap the new filter atoms but maintain the old API
// ============================================================================

/** @deprecated Use useCandidateFiltersValue from '../../../store' instead */
export const useCandidatesSearchValue = () =>
  useAtomValue(candidateFiltersAtom);
/** @deprecated Use useCompanyFiltersValue from '../../../store' instead */
export const useCompaniesSearchValue = () => useAtomValue(companyFiltersAtom);
/** @deprecated Use useHiringProcessFiltersValue from '../../../store' instead */
export const useHiringProcessesSearchValue = () =>
  useAtomValue(hiringProcessFiltersAtom);
/** @deprecated Use useJobPositionFiltersValue from '../../../store' instead */
export const useJobPositionsSearchValue = () =>
  useAtomValue(jobPositionFiltersAtom);
/** @deprecated Use useUserFiltersValue from '../../../store' instead */
export const useUsersSearchValue = () => useAtomValue(userFiltersAtom);

/** @deprecated Use useCandidateFiltersSetter from '../../../store' instead */
export const useCandidatesSearchSetter = () => useSetAtom(candidateFiltersAtom);
/** @deprecated Use useCompanyFiltersSetter from '../../../store' instead */
export const useCompaniesSearchSetter = () => useSetAtom(companyFiltersAtom);
/** @deprecated Use useHiringProcessFiltersSetter from '../../../store' instead */
export const useHiringProcessesSearchSetter = () =>
  useSetAtom(hiringProcessFiltersAtom);
/** @deprecated Use useJobPositionFiltersSetter from '../../../store' instead */
export const useJobPositionsSearchSetter = () =>
  useSetAtom(jobPositionFiltersAtom);
/** @deprecated Use useUserFiltersSetter from '../../../store' instead */
export const useUsersSearchSetter = () => useSetAtom(userFiltersAtom);

/** @deprecated Use separate hooks from '../../../store' instead */
export const useCandidatesSearch = () =>
  [
    useAtomValue(candidateFiltersAtom),
    useSetAtom(candidateFiltersAtom),
  ] as const;
/** @deprecated Use separate hooks from '../../../store' instead */
export const useCompaniesSearch = () =>
  [useAtomValue(companyFiltersAtom), useSetAtom(companyFiltersAtom)] as const;
/** @deprecated Use separate hooks from '../../../store' instead */
export const useHiringProcessesSearch = () =>
  [
    useAtomValue(hiringProcessFiltersAtom),
    useSetAtom(hiringProcessFiltersAtom),
  ] as const;
/** @deprecated Use separate hooks from '../../../store' instead */
export const useJobPositionsSearch = () =>
  [
    useAtomValue(jobPositionFiltersAtom),
    useSetAtom(jobPositionFiltersAtom),
  ] as const;
/** @deprecated Use separate hooks from '../../../store' instead */
export const useUsersSearch = () =>
  [useAtomValue(userFiltersAtom), useSetAtom(userFiltersAtom)] as const;
