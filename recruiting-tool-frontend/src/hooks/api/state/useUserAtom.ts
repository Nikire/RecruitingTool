/**
 * @deprecated Import from '../../../store' instead
 *
 * This file is kept for backwards compatibility.
 * All new code should import from the centralized store:
 *
 * @example
 * ```tsx
 * // Old (deprecated)
 * import { useUserAtom } from '../../hooks/api/state/useUserAtom';
 *
 * // New (preferred)
 * import { useUserAtom, userAtom, isAuthenticatedAtom } from '../store';
 * ```
 */
export { useUserAtom, userAtom, isAuthenticatedAtom } from "../../../store";
