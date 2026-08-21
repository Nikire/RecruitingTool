import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";

export interface FormDialogProps extends Omit<DialogProps, "onClose"> {
  /** Called when the dialog is allowed to close (explicitly, or after the user confirms discarding). */
  onClose: () => void;
  /**
   * Whether the wrapped form currently holds unsaved user input.
   * When true, a backdrop click or Escape asks for confirmation instead of
   * silently destroying what the user typed.
   *
   * Pass `formState.isDirty` from react-hook-form.
   */
  isDirty?: boolean;
}

/**
 * Drop-in replacement for MUI's `<Dialog>` for data-entry dialogs.
 *
 * Behaviour:
 * - Untouched form (`isDirty === false`): behaves exactly like `<Dialog>` —
 *   backdrop click and Escape close it immediately.
 * - Dirty form: backdrop click / Escape open a confirmation asking whether to
 *   discard. "Keep editing" returns to the form, "Discard changes" closes it.
 *
 * Explicit close affordances (a Cancel button calling `onClose` directly) are
 * intentionally NOT intercepted — the user already expressed intent there.
 *
 * @example
 * ```tsx
 * const { formState: { isDirty } } = useForm<FormData>();
 *
 * <FormDialog open={open} onClose={handleClose} isDirty={isDirty} maxWidth="md" fullWidth>
 *   <DialogTitle>...</DialogTitle>
 * </FormDialog>
 * ```
 */
const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  isDirty = false,
  children,
  ...dialogProps
}) => {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Never leave the confirmation orphaned if the parent closes the dialog.
  useEffect(() => {
    if (!open) setConfirmOpen(false);
  }, [open]);

  const handleDialogClose = useCallback<NonNullable<DialogProps["onClose"]>>(
    (_event, reason) => {
      if (
        isDirty &&
        (reason === "backdropClick" || reason === "escapeKeyDown")
      ) {
        setConfirmOpen(true);
        return;
      }
      onClose();
    },
    [isDirty, onClose],
  );

  const handleKeepEditing = useCallback(() => setConfirmOpen(false), []);

  const handleDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} {...dialogProps}>
        {children}
      </Dialog>

      <Dialog
        open={open && confirmOpen}
        onClose={handleKeepEditing}
        maxWidth="xs"
        fullWidth
        aria-labelledby="discard-changes-dialog-title"
        aria-describedby="discard-changes-dialog-description"
      >
        <DialogTitle
          id="discard-changes-dialog-title"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WarningAmberIcon
            color="warning"
            aria-label={t("aria.warning_icon")}
          />
          {t("dialogs.discard_changes_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="discard-changes-dialog-description">
            {t("dialogs.discard_changes_message")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleKeepEditing} autoFocus>
            {t("dialogs.keep_editing")}
          </Button>
          <Button onClick={handleDiscard} color="error" variant="contained">
            {t("dialogs.discard_changes")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormDialog;
