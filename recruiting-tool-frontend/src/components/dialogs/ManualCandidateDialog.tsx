import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateCandidate } from "../../hooks/api/useCandidates";
import { useJobPositions } from "../../hooks/api/useJobPositions";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";

interface ManualCandidateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (candidateUid: string) => void;
}

interface ManualCandidateFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  jobPositionUid?: string;
}

/**
 * ManualCandidateDialog - Create candidates manually from phone calls, referrals, or walk-ins
 *
 * Features:
 * - Manual candidate creation with required fields (name, email)
 * - Optional fields (phone, notes)
 * - Job position selector (optional - to immediately start hiring process)
 * - Source automatically marked as MANUAL
 * - Full i18n support
 * - Form validation with error handling
 */
const ManualCandidateDialog: React.FC<ManualCandidateDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ManualCandidateFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      jobPositionUid: "",
    },
  });

  const { mutate: createCandidate, isPending, isError } = useCreateCandidate();
  const { data: jobPositionsData, isLoading: jobPositionsLoading } =
    useJobPositions();
  const jobPositions = Array.isArray(jobPositionsData)
    ? jobPositionsData
    : jobPositionsData
      ? [jobPositionsData]
      : [];

  const onSubmit = (data: ManualCandidateFormData) => {
    const candidateData = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      // Notes will be handled separately after candidate creation if needed
      source: "MANUAL", // Mark source as MANUAL for tracking
    };

    createCandidate(candidateData, {
      onSuccess: (response) => {
        reset();
        onClose();

        // If response contains uid, pass it to onSuccess callback
        // This allows parent component to start hiring process if job position was selected
        if (onSuccess && response?.uid) {
          onSuccess(response.uid);
        }
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="manual-candidate-dialog-title"
      aria-describedby="manual-candidate-dialog-description"
    >
      <DialogTitle id="manual-candidate-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAddIcon />
          {t("manual_candidate.create_title")}
        </Box>
      </DialogTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label={t("aria.create_dialog", {
          entity: t("candidates.title").toLowerCase(),
        })}
      >
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("manual_candidate.description")}
          </Typography>

          {/* Source indicator chip */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={t("manual_candidate.source_manual")}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <FormErrorSummary errors={errors} />

          {/* Name field - Required */}
          <TextField
            label={t("manual_candidate.name_label")}
            fullWidth
            margin="normal"
            autoFocus
            {...register(
              "name",
              validationRules.combine(
                validationRules.required(t("manual_candidate.name_label")),
                validationRules.minLength(3),
                validationRules.maxLength(100),
              ),
            )}
            error={!!errors.name}
            helperText={errors.name?.message}
            inputProps={{
              "aria-required": "true",
              "aria-invalid": !!errors.name,
              "aria-describedby": errors.name ? "name-error" : undefined,
            }}
            InputProps={{
              endAdornment: errors.name ? (
                <InputAdornment position="end">
                  <ErrorIcon color="error" aria-label={t("aria.error_icon")} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Email field - Required */}
          <TextField
            label={t("manual_candidate.email_label")}
            type="email"
            fullWidth
            margin="normal"
            {...register("email", validationRules.email())}
            error={!!errors.email}
            helperText={errors.email?.message}
            inputProps={{
              "aria-required": "true",
              "aria-invalid": !!errors.email,
              "aria-describedby": errors.email ? "email-error" : undefined,
            }}
            InputProps={{
              endAdornment: errors.email ? (
                <InputAdornment position="end">
                  <ErrorIcon color="error" aria-label={t("aria.error_icon")} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Phone field - Optional */}
          <TextField
            label={t("manual_candidate.phone_label")}
            fullWidth
            margin="normal"
            {...register("phone", validationRules.phone())}
            error={!!errors.phone}
            helperText={
              errors.phone?.message || t("manual_candidate.phone_helper")
            }
            inputProps={{
              "aria-invalid": !!errors.phone,
              "aria-describedby": errors.phone ? "phone-error" : undefined,
            }}
            InputProps={{
              endAdornment: errors.phone ? (
                <InputAdornment position="end">
                  <ErrorIcon color="error" aria-label={t("aria.error_icon")} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Job Position selector - Optional */}
          <Controller
            name="jobPositionUid"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t("manual_candidate.job_position_label")}
                fullWidth
                margin="normal"
                helperText={t("manual_candidate.job_position_helper")}
                disabled={jobPositionsLoading}
              >
                <MenuItem value="">
                  <em>{t("manual_candidate.no_job_position")}</em>
                </MenuItem>
                {jobPositions
                  ?.filter((jp) => jp.status === "OPEN")
                  .map((position) => (
                    <MenuItem key={position.uid} value={position.uid}>
                      {position.title}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />

          {/* Notes field - Optional */}
          <TextField
            label={t("manual_candidate.notes_label")}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            {...register("notes", validationRules.maxLength(500))}
            error={!!errors.notes}
            helperText={
              errors.notes?.message || t("manual_candidate.notes_helper")
            }
            placeholder={t("manual_candidate.notes_placeholder")}
            inputProps={{
              "aria-invalid": !!errors.notes,
              "aria-describedby": errors.notes ? "notes-error" : undefined,
            }}
          />

          {isError && (
            <Typography
              color="error"
              sx={{ mt: 2 }}
              role="alert"
              aria-live="polite"
            >
              {t("errors.create_failed", {
                entity: t("candidates.title").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={isPending}
            aria-label={t("aria.cancel")}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                  aria-label={t("aria.loading")}
                />
              ) : (
                <PersonAddIcon />
              )
            }
            aria-label={
              isPending
                ? t("common.creating")
                : t("manual_candidate.create_button")
            }
          >
            {isPending
              ? t("common.creating")
              : t("manual_candidate.create_button")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ManualCandidateDialog;
