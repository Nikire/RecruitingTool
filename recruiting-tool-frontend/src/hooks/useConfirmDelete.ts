import {useCallback} from 'react';
import {UseMutationResult} from '@tanstack/react-query';
import {useDialog} from './useDialog';

/**
 * Return type for the useConfirmDelete hook
 */
export interface UseConfirmDeleteReturn<T> {
	/** Trigger delete confirmation for an item */
	confirmDelete: (item: T) => void;
	/** Execute the delete operation */
	handleConfirm: () => void;
	/** Cancel the delete operation */
	handleCancel: () => void;
	/** Whether the delete confirmation dialog is open */
	isOpen: boolean;
	/** The item being deleted */
	selectedItem: T | null;
	/** Whether the delete mutation is in progress */
	isDeleting: boolean;
}

/**
 * Custom hook for managing delete confirmation dialogs
 *
 * This hook combines dialog management with delete mutation logic,
 * providing a complete solution for confirming and executing delete operations.
 *
 * @template T - Type of the item being deleted (must have a uid property)
 * @param deleteMutation - React Query mutation result for the delete operation
 * @returns Object containing delete confirmation state and handlers
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteCandidate();
 * const deleteConfirm = useConfirmDelete(deleteMutation);
 *
 * return (
 *   <>
 *     <IconButton onClick={() => deleteConfirm.confirmDelete(candidate)}>
 *       <DeleteIcon />
 *     </IconButton>
 *
 *     <ConfirmDeleteDialog
 *       open={deleteConfirm.isOpen}
 *       onClose={deleteConfirm.handleCancel}
 *       onConfirm={deleteConfirm.handleConfirm}
 *       title="Delete Candidate"
 *       message="Are you sure you want to delete this candidate?"
 *       itemName={deleteConfirm.selectedItem?.name}
 *       isDeleting={deleteConfirm.isDeleting}
 *     />
 *   </>
 * );
 * ```
 */
export const useConfirmDelete = <T extends {uid: string}>(
	deleteMutation: UseMutationResult<void, Error, string, unknown>
): UseConfirmDeleteReturn<T> => {
	const dialog = useDialog<T>();

	/**
	 * Trigger delete confirmation for a specific item
	 */
	const confirmDelete = useCallback(
		(item: T) => {
			dialog.openWith(item);
		},
		[dialog]
	);

	/**
	 * Execute the delete operation
	 * Closes the dialog on success
	 */
	const handleConfirm = useCallback(() => {
		if (dialog.selectedItem) {
			deleteMutation.mutate(dialog.selectedItem.uid, {
				onSuccess: () => {
					dialog.close();
				},
			});
		}
	}, [dialog, deleteMutation]);

	/**
	 * Cancel the delete operation and close the dialog
	 */
	const handleCancel = useCallback(() => {
		dialog.close();
	}, [dialog]);

	return {
		confirmDelete,
		handleConfirm,
		handleCancel,
		isOpen: dialog.isOpen,
		selectedItem: dialog.selectedItem,
		isDeleting: deleteMutation.isPending,
	};
};
