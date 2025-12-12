import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateJobPosition } from "../../hooks/api/useJobPositions";
import { JobPosition, JobPositionStatus } from "../../types/jobPosition.types";
import StatusBadgeEditor, { StatusOption } from "../common/StatusBadgeEditor";
import { CustomQuestionBuilder } from "../forms/CustomQuestionBuilder";
import { CustomQuestion } from "../../types/customQuestions";

interface UpdateJobPositionDialogProps {
  open: boolean;
  onClose: () => void;
  jobPosition: JobPosition | null;
}

interface JobPositionFormData {
  title: string;
  description?: string;
}

// Job Position status options for StatusBadgeEditor
const JOB_POSITION_STATUS_OPTIONS: StatusOption[] = [
  { value: "OPEN", labelKey: "status.open", color: "success" },
  { value: "CLOSED", labelKey: "status.closed", color: "default" },
  { value: "CANCELLED", labelKey: "status.cancelled", color: "error" },
];

const UpdateJobPositionDialog: React.FC<UpdateJobPositionDialogProps> = ({
  open,
  onClose,
  jobPosition,
}) => {
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState<JobPositionStatus>("OPEN");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobPositionFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const {
    mutate: updateJobPosition,
    isPending,
    isError,
  } = useUpdateJobPosition();

  // Update form values when job position changes
  useEffect(() => {
    if (jobPosition) {
      reset({
        title: jobPosition.title,
        description: jobPosition.description || "",
      });
      setCurrentStatus(jobPosition.status);
      setCustomQuestions(jobPosition.customQuestions || []);
    }
  }, [jobPosition, reset]);

  const onSubmit = (data: JobPositionFormData) => {
    if (!jobPosition) return;

    // Include status and custom questions in the update data
    const updateData = {
      ...data,
      status: currentStatus,
      customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
    };

    updateJobPosition(
      { uid: jobPosition.uid, data: updateData },
      {
        onSuccess: () => {
          reset();
          setCustomQuestions([]);
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    setCustomQuestions([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("update_job_position.title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {/* Status Badge Editor */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
            <StatusBadgeEditor
              currentStatus={currentStatus}
              statusOptions={JOB_POSITION_STATUS_OPTIONS}
              onChange={(newStatus) =>
                setCurrentStatus(newStatus as JobPositionStatus)
              }
              disabled={isPending}
              size="medium"
              label={t("update_job_position.status")}
              ariaLabel={t("status_editor.change_job_position_status")}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("update_job_position.details")}
            </Typography>

            <TextField
              label={t("update_job_position.job_title")}
              fullWidth
              margin="normal"
              {...register("title", {
                required: t("update_job_position.job_title_required"),
                minLength: {
                  value: 3,
                  message: t("update_job_position.job_title_min_length", {
                    min: 3,
                  }),
                },
              })}
              error={!!errors.title}
              helperText={errors.title?.message}
              placeholder={t("update_job_position.job_title_placeholder")}
            />

            <TextField
              label={t("update_job_position.description")}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: t("update_job_position.description_max_length", {
                    max: 1000,
                  }),
                },
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
              placeholder={t("update_job_position.description_placeholder")}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Stage Management Info */}
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">
              {t("update_job_position.stages_info", {
                count: jobPosition?.stages?.length || 0,
              })}{" "}
              {t("update_job_position.stages_manage_help")}
            </Alert>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Custom Questions Builder */}
          <Box sx={{ mb: 2 }}>
            <CustomQuestionBuilder
              questions={customQuestions}
              onQuestionsChange={setCustomQuestions}
            />
          </Box>

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("update_job_position.failed_to_update")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? (
              <CircularProgress size={20} />
            ) : (
              t("update_job_position.update_button")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateJobPositionDialog;
