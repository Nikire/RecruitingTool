/**
 * Centralized Store Exports
 *
 * This file provides a single import point for all Jotai atoms and hooks.
 *
 * @example
 * ```tsx
 * // Import everything you need from one place
 * import {
 *   useUserAtom,
 *   useCandidateFiltersValue,
 *   useCandidateSelection,
 *   tablePreferencesAtom,
 * } from '@/store';
 * ```
 *
 * ## Architecture
 *
 * The store is organized by concern:
 *
 * - **auth.atoms.ts** - User authentication state (in-memory, not persisted)
 * - **preferences.atoms.ts** - User preferences (persisted to localStorage)
 * - **filters.atoms.ts** - Filter/search/pagination state (in-memory)
 * - **selections.atoms.ts** - Selected items for bulk actions (in-memory)
 * - **ui.atoms.ts** - Transient UI state (dialogs, navigation, tabs)
 *
 * ## Usage Guidelines
 *
 * ### For Authentication:
 * ```tsx
 * const { user, isAuthenticated, setUser } = useUserAtom();
 * ```
 *
 * ### For User Preferences (persisted):
 * ```tsx
 * const [tablePrefs, setTablePrefs] = useAtom(tablePreferencesAtom);
 * const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
 * ```
 *
 * ### For Filters:
 * ```tsx
 * const filters = useCandidateFiltersValue();
 * const setFilters = useCandidateFiltersSetter();
 * const hasFilters = useHasCandidateFilters();
 * ```
 *
 * ### For Selections (bulk actions):
 * ```tsx
 * const { selected, toggle, selectAll, clearAll } = useCandidateSelection();
 * ```
 *
 * ### For UI State:
 * ```tsx
 * const { confirm, close } = useConfirmDialog();
 * const [activeTab, setActiveTab] = useActiveTab('page-key');
 * ```
 */

// ============================================================================
// Authentication State
// ============================================================================
export {
	// Atoms
	userAtom,
	isAuthenticatedAtom,
	// Hooks
	useUserAtom,
} from './auth.atoms';

// ============================================================================
// User Preferences (Persisted)
// ============================================================================
export {
	// Types
	type TablePreferences,
	type ColumnVisibilityPreferences,
	type ThemeMode,
	type OnboardingPreferences,
	// Atoms
	tablePreferencesAtom,
	columnVisibilityAtom,
	sidebarCollapsedAtom,
	themeModeAtom,
	onboardingPreferencesAtom,
} from './preferences.atoms';

// ============================================================================
// Filter State
// ============================================================================
export {
	// Types
	type BaseFilterState,
	type CandidateFilterState,
	type JobPositionFilterState,
	type HiringProcessFilterState,
	type ApplicationFilterState,
	// Candidate Filters
	candidateFiltersAtom,
	hasCandidateFiltersAtom,
	useCandidateFiltersValue,
	useCandidateFiltersSetter,
	useHasCandidateFilters,
	// Job Position Filters
	jobPositionFiltersAtom,
	hasJobPositionFiltersAtom,
	useJobPositionFiltersValue,
	useJobPositionFiltersSetter,
	useHasJobPositionFilters,
	// Hiring Process Filters
	hiringProcessFiltersAtom,
	hasHiringProcessFiltersAtom,
	useHiringProcessFiltersValue,
	useHiringProcessFiltersSetter,
	useHasHiringProcessFilters,
	// Application Filters
	applicationFiltersAtom,
	hasApplicationFiltersAtom,
	useApplicationFiltersValue,
	useApplicationFiltersSetter,
	useHasApplicationFilters,
	// Company Filters
	companyFiltersAtom,
	useCompanyFiltersValue,
	useCompanyFiltersSetter,
	// User Filters
	userFiltersAtom,
	useUserFiltersValue,
	useUserFiltersSetter,
	// Email Template Filters
	emailTemplateFiltersAtom,
	useEmailTemplateFiltersValue,
	useEmailTemplateFiltersSetter,
	// Legacy exports (deprecated)
	candidatesSearchAtom,
	companiesSearchAtom,
	hiringProcessesSearchAtom,
	jobPositionsSearchAtom,
	usersSearchAtom,
} from './filters.atoms';

// ============================================================================
// Selection State (for bulk actions)
// ============================================================================
export {
	// Atoms
	selectedCandidatesAtom,
	selectedJobPositionsAtom,
	selectedApplicationsAtom,
	selectedHiringProcessesAtom,
	selectedUsersAtom,
	// Derived atoms
	selectedCandidatesCountAtom,
	hasCandidatesSelectedAtom,
	selectedApplicationsCountAtom,
	hasApplicationsSelectedAtom,
	// Hooks
	useCandidateSelection,
	useApplicationSelection,
	useJobPositionSelection,
} from './selections.atoms';

// ============================================================================
// UI State
// ============================================================================
export {
	// Types
	type ConfirmDialogState,
	// Loading State
	globalLoadingAtom,
	globalLoadingMessageAtom,
	useGlobalLoading,
	useSetGlobalLoading,
	// Navigation State
	mobileNavOpenAtom,
	useMobileNavOpen,
	useSetMobileNavOpen,
	// Tab State
	activeTabsAtom,
	useActiveTab,
	// Confirmation Dialog
	confirmDialogAtom,
	useConfirmDialog,
} from './ui.atoms';
