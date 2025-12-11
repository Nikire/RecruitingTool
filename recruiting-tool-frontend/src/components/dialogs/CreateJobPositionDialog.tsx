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
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateJobPosition } from "../../hooks/api/useJobPositions";
import { Stage } from "../../types/stage.types";
import StageBuilder from "../job-positions/StageBuilder";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";
import { CustomQuestionBuilder } from "../forms/CustomQuestionBuilder";
import { CustomQuestion } from "../../types/customQuestions";

interface CreateJobPositionDialogProps {
  open: boolean;
  onClose: () => void;
}

interface JobPositionFormData {
  title: string;
  description?: string;
}

const CreateJobPositionDialog: React.FC<CreateJobPositionDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const [stages, setStages] = useState<Omit<Stage, "uid" | "status">[]>([]);
  const [stageError, setStageError] = useState<string>("");
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
    mutate: createJobPosition,
    isPending,
    isError,
  } = useCreateJobPosition();

  const onSubmit = (data: JobPositionFormData) => {
    // Validate stages
    if (stages.length === 0) {
      setStageError(t("validation.stage_required"));
      return;
    }

    // Prepare data with stages, custom questions, and default status
    const jobPositionData = {
      ...data,
      status: "OPEN" as const, // Default to OPEN for new positions
      stages: stages.map((stage) => ({
        title: stage.title,
        type: stage.type,
        description: stage.description,
        position: stage.position,
        estimatedTime: stage.estimatedTime,
      })),
      customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
    };

    createJobPosition(jobPositionData, {
      onSuccess: () => {
        reset();
        setStages([]);
        setCustomQuestions([]);
        setStageError("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    setStages([]);
    setCustomQuestions([]);
    setStageError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("job_positions.create_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("job_positions.details")}
            </Typography>

            <TextField
              label={t("job_positions.job_title_label")}
              fullWidth
              margin="normal"
              {...register(
                "title",
                validationRules.combine(
                  validationRules.required(t("job_positions.job_title_label")),
                  validationRules.minLength(3),
                ),
              )}
              error={!!errors.title}
              helperText={errors.title?.message}
              placeholder={t("job_positions.title_placeholder")}
              InputProps={{
                endAdornment: errors.title ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" />
                  </InputAdornment>
                ) : null,
              }}
            />

            <TextField
              label={t("job_positions.description_label")}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              {...register("description", validationRules.maxLength(1000))}
              error={!!errors.description}
              helperText={errors.description?.message}
              placeholder={t("job_positions.description_placeholder")}
              InputProps={{
                endAdornment: errors.description ? (
                  <InputAdornment position="end">
                    <ErrorIcon color="error" />
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Stage Builder */}
          <Box sx={{ mb: 2 }}>
            <StageBuilder
              stages={stages}
              onChange={(newStages) => {
                setStages(newStages);
                if (newStages.length > 0) {
                  setStageError("");
                }
              }}
              minStages={1}
              error={stageError}
            />
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
              {t("errors.create_failed", {
                entity: t("job_positions.title").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || stages.length === 0}
            startIcon={
              isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {isPending ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateJobPositionDialog;
