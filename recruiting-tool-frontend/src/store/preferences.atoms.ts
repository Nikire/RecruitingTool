/**
 * User Preferences Atoms
 *
 * Persistent user preferences using atomWithStorage.
 * These survive browser refresh and are stored in localStorage.
 *
 * NOTE: Language preference is NOT stored here because i18next
 * already handles it with its own localStorage key ('i18nextLng').
 *
 * @example
 * ```tsx
 * const [tablePrefs, setTablePrefs] = useAtom(tablePreferencesAtom);
 * const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
 * ```
 */
import { atomWithStorage } from "jotai/utils";

/**
 * Table display preferences
 * Persisted to localStorage under 'recruiting_table_prefs'
 */
export interface TablePreferences {
  /** Number of rows per page (default: 25) */
  rowsPerPage: number;
  /** Table density: 'compact' | 'standard' | 'comfortable' */
  density: "compact" | "standard" | "comfortable";
}

/**
 * Column visibility preferences per table
 * Keys are table identifiers (e.g., 'candidates', 'jobPositions')
 * Values are objects mapping column field names to visibility boolean
 *
 * @example
 * { candidates: { email: false, phone: false } }
 */
export interface ColumnVisibilityPreferences {
  [tableKey: string]: {
    [columnField: string]: boolean;
  };
}

/**
 * Default table preferences
 */
const defaultTablePreferences: TablePreferences = {
  rowsPerPage: 25,
  density: "standard",
};

/**
 * Default column visibility (all visible)
 */
const defaultColumnVisibility: ColumnVisibilityPreferences = {};

/**
 * Global table preferences atom
 * Affects all tables in the application
 */
export const tablePreferencesAtom = atomWithStorage<TablePreferences>(
  "recruiting_table_prefs",
  defaultTablePreferences,
);

/**
 * Column visibility preferences atom
 * Per-table column visibility settings
 */
export const columnVisibilityAtom =
  atomWithStorage<ColumnVisibilityPreferences>(
    "recruiting_column_visibility",
    defaultColumnVisibility,
  );

/**
 * Sidebar collapsed state atom
 * Remembers if user collapsed the sidebar
 */
export const sidebarCollapsedAtom = atomWithStorage<boolean>(
  "recruiting_sidebar_collapsed",
  false,
);

/**
 * Theme preference atom (for future dark mode support)
 * Currently defaults to 'light', ready for dark mode implementation
 */
export type ThemeMode = "light" | "dark" | "system";

export const themeModeAtom = atomWithStorage<ThemeMode>(
  "recruiting_theme_mode",
  "light",
);

/**
 * Onboarding preferences atom
 * Tracks which onboarding tips have been dismissed
 * This consolidates the scattered localStorage keys into one atom
 */
export interface OnboardingPreferences {
  /** Global dismissal - if true, no onboarding shows anywhere */
  globalDismissed: boolean;
  /** Per-table dismissal tracking */
  dismissedTables: string[];
}

export const onboardingPreferencesAtom = atomWithStorage<OnboardingPreferences>(
  "recruiting_onboarding_prefs",
  {
    globalDismissed: false,
    dismissedTables: [],
  },
);
