import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import FormDialog from "./FormDialog";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateHiringProcess } from "../../hooks/api/useHiringProcess";
import {
  HiringProcess,
  HiringProcessStatus,
} from "../../types/hiringProcess.types";
import { useEffect, useState } from "react";
import StatusBadgeEditor, { StatusOption } from "../common/StatusBadgeEditor";

interface UpdateHiringProcessDialogProps {
  open: boolean;
  onClose: () => void;
  hiringProcess: HiringProcess | null;
}

interface HiringProcessFormData {
  title: string;
}

// Hiring Process status options for StatusBadgeEditor
const HIRING_PROCESS_STATUS_OPTIONS: StatusOption[] = [
  { value: "OPEN", labelKey: "status.open", color: "success" },
  { value: "IN_PROGRESS", labelKey: "status.in_progress", color: "primary" },
  { value: "CLOSED", labelKey: "status.closed", color: "default" },
  { value: "CANCELLED", labelKey: "status.cancelled", color: "warning" },
  { value: "REJECTED", labelKey: "status.rejected", color: "error" },
];

const UpdateHiringProcessDialog: React.FC<UpdateHiringProcessDialogProps> = ({
  open,
  onClose,
  hiringProcess,
}) => {
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] =
    useState<HiringProcessStatus>("OPEN");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HiringProcessFormData>({
    defaultValues: {
      title: "",
    },
  });

  const {
    mutate: updateHiringProcess,
    isPending,
    isError,
  } = useUpdateHiringProcess();

  // Update form values when hiring process changes
  useEffect(() => {
    if (hiringProcess) {
      reset({
        title: hiringProcess.title,
      });
      setCurrentStatus(hiringProcess.status);
    }
  }, [hiringProcess, reset]);

  const onSubmit = (data: HiringProcessFormData) => {
    if (!hiringProcess) return;

    // Include status in the update data
    const updateData = {
      ...data,
      status: currentStatus,
    };

    updateHiringProcess(
      { uid: hiringProcess.uid, data: updateData },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      isDirty={isDirty}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("update_hiring_process.title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* Status Badge Editor */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
            <StatusBadgeEditor
              currentStatus={currentStatus}
              statusOptions={HIRING_PROCESS_STATUS_OPTIONS}
              onChange={(newStatus) =>
                setCurrentStatus(newStatus as HiringProcessStatus)
              }
              disabled={isPending}
              size="medium"
              label={t("update_hiring_process.status_label")}
              ariaLabel={t("status_editor.change_hiring_process_status")}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={t("update_hiring_process.title_label")}
              fullWidth
              {...register("title", {
                required: t("validation.title_required"),
                minLength: {
                  value: 3,
                  message: t("update_hiring_process.title_min_length", {
                    min: 3,
                  }),
                },
                maxLength: {
                  value: 200,
                  message: t("update_hiring_process.title_max_length", {
                    max: 200,
                  }),
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <Typography variant="caption" color="textSecondary">
              {t("update_hiring_process.note")}
            </Typography>
          </Box>

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("update_hiring_process.failed_to_update")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={20} /> : t("common.update")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default UpdateHiringProcessDialog;
