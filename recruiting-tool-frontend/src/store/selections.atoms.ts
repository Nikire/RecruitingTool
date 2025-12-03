/**
 * Selection State Atoms
 *
 * Manages selected items for bulk actions across tables.
 * These are in-memory only (reset on navigation/refresh).
 *
 * @example
 * ```tsx
 * // In a table component
 * const [selected, setSelected] = useAtom(selectedCandidatesAtom);
 *
 * // Toggle selection
 * const toggleSelect = (uid: string) => {
 *   setSelected(prev =>
 *     prev.includes(uid)
 *       ? prev.filter(id => id !== uid)
 *       : [...prev, uid]
 *   );
 * };
 *
 * // Clear all selections
 * setSelected([]);
 * ```
 */
import {atom, useAtom, useAtomValue, useSetAtom} from 'jotai';

// ============================================================================
// Selection Atoms
// ============================================================================

/**
 * Selected candidate UIDs for bulk actions
 */
export const selectedCandidatesAtom = atom<string[]>([]);

/**
 * Selected job position UIDs for bulk actions
 */
export const selectedJobPositionsAtom = atom<string[]>([]);

/**
 * Selected application UIDs for bulk actions
 */
export const selectedApplicationsAtom = atom<string[]>([]);

/**
 * Selected hiring process UIDs for bulk actions
 */
export const selectedHiringProcessesAtom = atom<string[]>([]);

/**
 * Selected user UIDs for bulk actions
 */
export const selectedUsersAtom = atom<string[]>([]);

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Count of selected candidates
 */
export const selectedCandidatesCountAtom = atom((get) => get(selectedCandidatesAtom).length);

/**
 * Whether any candidates are selected
 */
export const hasCandidatesSelectedAtom = atom((get) => get(selectedCandidatesAtom).length > 0);

/**
 * Count of selected applications
 */
export const selectedApplicationsCountAtom = atom((get) => get(selectedApplicationsAtom).length);

/**
 * Whether any applications are selected
 */
export const hasApplicationsSelectedAtom = atom((get) => get(selectedApplicationsAtom).length > 0);

// ============================================================================
// Custom Hooks for Selection Management
// ============================================================================

/**
 * Hook for managing candidate selection
 *
 * @example
 * ```tsx
 * const { selected, toggle, selectAll, clearAll, isSelected } = useCandidateSelection();
 *
 * // Check if a candidate is selected
 * const checked = isSelected(candidate.uid);
 *
 * // Toggle selection
 * <Checkbox checked={checked} onChange={() => toggle(candidate.uid)} />
 *
 * // Select all visible candidates
 * selectAll(visibleCandidates.map(c => c.uid));
 *
 * // Clear all selections
 * clearAll();
 * ```
 */
export function useCandidateSelection() {
	const [selected, setSelected] = useAtom(selectedCandidatesAtom);

	const toggle = (uid: string) => {
		setSelected((prev) =>
			prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
		);
	};

	const selectAll = (uids: string[]) => {
		setSelected(uids);
	};

	const clearAll = () => {
		setSelected([]);
	};

	const isSelected = (uid: string) => selected.includes(uid);

	return {
		selected,
		toggle,
		selectAll,
		clearAll,
		isSelected,
		count: selected.length,
		hasSelection: selected.length > 0,
	};
}

/**
 * Hook for managing application selection
 */
export function useApplicationSelection() {
	const [selected, setSelected] = useAtom(selectedApplicationsAtom);

	const toggle = (uid: string) => {
		setSelected((prev) =>
			prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
		);
	};

	const selectAll = (uids: string[]) => {
		setSelected(uids);
	};

	const clearAll = () => {
		setSelected([]);
	};

	const isSelected = (uid: string) => selected.includes(uid);

	return {
		selected,
		toggle,
		selectAll,
		clearAll,
		isSelected,
		count: selected.length,
		hasSelection: selected.length > 0,
	};
}

/**
 * Hook for managing job position selection
 */
export function useJobPositionSelection() {
	const [selected, setSelected] = useAtom(selectedJobPositionsAtom);

	const toggle = (uid: string) => {
		setSelected((prev) =>
			prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
		);
	};

	const selectAll = (uids: string[]) => {
		setSelected(uids);
	};

	const clearAll = () => {
		setSelected([]);
	};

	const isSelected = (uid: string) => selected.includes(uid);

	return {
		selected,
		toggle,
		selectAll,
		clearAll,
		isSelected,
		count: selected.length,
		hasSelection: selected.length > 0,
	};
}
