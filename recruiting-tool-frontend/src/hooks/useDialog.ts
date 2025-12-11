import { useState, useCallback } from "react";

/**
 * Return type for the useDialog hook
 */
export interface UseDialogReturn<T> {
  /** Whether the dialog is currently open */
  isOpen: boolean;
  /** The currently selected item, or null if no item is selected */
  selectedItem: T | null;
  /** Open the dialog without selecting an item (for create operations) */
  open: () => void;
  /** Open the dialog with a specific item (for edit operations) */
  openWith: (item: T) => void;
  /** Close the dialog and clear the selected item */
  close: () => void;
}

/**
 * Custom hook for managing dialog state with optional item selection
 *
 * This hook provides a consistent pattern for managing dialog open/close state
 * along with an optional selected item. Useful for both create and edit dialogs.
 *
 * @template T - Type of the item being managed
 * @returns Object containing dialog state and control functions
 *
 * @example
 * ```tsx
 * // For edit dialog
 * const updateDialog = useDialog<Candidate>();
 *
 * return (
 *   <>
 *     <IconButton onClick={() => updateDialog.openWith(candidate)}>
 *       <EditIcon />
 *     </IconButton>
 *
 *     <UpdateCandidateDialog
 *       open={updateDialog.isOpen}
 *       onClose={updateDialog.close}
 *       candidate={updateDialog.selectedItem}
 *     />
 *   </>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // For create dialog
 * const createDialog = useDialog<never>();
 *
 * return (
 *   <>
 *     <Button onClick={createDialog.open}>
 *       Create
 *     </Button>
 *
 *     <CreateDialog
 *       open={createDialog.isOpen}
 *       onClose={createDialog.close}
 *     />
 *   </>
 * );
 * ```
 */
export const useDialog = <T>(): UseDialogReturn<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  /**
   * Open the dialog without selecting an item
   * Useful for create operations
   */
  const open = useCallback(() => {
    setIsOpen(true);
    setSelectedItem(null);
  }, []);

  /**
   * Open the dialog with a specific item
   * Useful for edit operations
   */
  const openWith = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  /**
   * Close the dialog and clear the selected item
   */
  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  return {
    isOpen,
    selectedItem,
    open,
    openWith,
    close,
  };
};
