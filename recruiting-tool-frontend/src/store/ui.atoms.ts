/**
 * UI State Atoms
 *
 * Manages transient UI state that doesn't need persistence.
 * For persistent UI preferences, see preferences.atoms.ts.
 *
 * @example
 * ```tsx
 * const isLoading = useAtomValue(globalLoadingAtom);
 * const setLoading = useSetAtom(globalLoadingAtom);
 * ```
 */
import { atom, useAtomValue, useSetAtom } from "jotai";

// ============================================================================
// Global UI State
// ============================================================================

/**
 * Global loading indicator state
 * Use for operations that should show a global loading overlay
 */
export const globalLoadingAtom = atom<boolean>(false);

/**
 * Global loading message (optional)
 */
export const globalLoadingMessageAtom = atom<string | null>(null);

// Hooks
export const useGlobalLoading = () => useAtomValue(globalLoadingAtom);
export const useSetGlobalLoading = () => useSetAtom(globalLoadingAtom);

// ============================================================================
// Navigation State
// ============================================================================

/**
 * Mobile navigation drawer open state
 */
export const mobileNavOpenAtom = atom<boolean>(false);

// Hooks
export const useMobileNavOpen = () => useAtomValue(mobileNavOpenAtom);
export const useSetMobileNavOpen = () => useSetAtom(mobileNavOpenAtom);

// ============================================================================
// Active Tab State
// Useful for remembering which tab was active when returning to a page
// ============================================================================

/**
 * Active tab state per page
 * Keys are page identifiers, values are tab indices
 */
export const activeTabsAtom = atom<Record<string, number>>({});

/**
 * Hook for managing tab state for a specific page
 *
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useActiveTab('candidates-detail');
 *
 * <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
 *   <Tab label="Overview" />
 *   <Tab label="History" />
 * </Tabs>
 * ```
 */
export function useActiveTab(pageKey: string): [number, (tab: number) => void] {
  const tabs = useAtomValue(activeTabsAtom);
  const setTabs = useSetAtom(activeTabsAtom);

  const activeTab = tabs[pageKey] ?? 0;

  const setActiveTab = (tab: number) => {
    setTabs((prev) => ({ ...prev, [pageKey]: tab }));
  };

  return [activeTab, setActiveTab];
}

// ============================================================================
// Confirmation Dialog State
// For global confirmation dialogs that can be triggered from anywhere
// ============================================================================

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isDestructive?: boolean;
}

const defaultConfirmState: ConfirmDialogState = {
  open: false,
  title: "",
  message: "",
};

export const confirmDialogAtom = atom<ConfirmDialogState>(defaultConfirmState);

/**
 * Hook for managing a global confirmation dialog
 *
 * @example
 * ```tsx
 * const { confirm, close } = useConfirmDialog();
 *
 * // Trigger confirmation
 * const handleDelete = async () => {
 *   confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     isDestructive: true,
 *     onConfirm: async () => {
 *       await deleteItem(id);
 *     },
 *   });
 * };
 * ```
 */
export function useConfirmDialog() {
  const state = useAtomValue(confirmDialogAtom);
  const setState = useSetAtom(confirmDialogAtom);

  const confirm = (options: Omit<ConfirmDialogState, "open">) => {
    setState({
      ...options,
      open: true,
    });
  };

  const close = () => {
    setState(defaultConfirmState);
  };

  return {
    ...state,
    confirm,
    close,
  };
}
