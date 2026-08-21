import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import FormDialog from "./FormDialog";
import ErrorIcon from "@mui/icons-material/Error";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateCandidate } from "../../hooks/api/useCandidates";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";

interface CreateCandidateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CandidateFormData {
  name: string;
  email: string;
  source?: string;
  sourceDetails?: string;
}

const APPLICATION_SOURCES = [
  "DIRECT_APPLY",
  "LINKEDIN",
  "INDEED",
  "GLASSDOOR",
  "REFERRAL",
  "JOB_FAIR",
  "UNIVERSITY",
  "RECRUITER",
  "SOCIAL_MEDIA",
  "MANUAL",
  "CSV_IMPORT",
  "WEBSITE",
  "CAREER_PAGE",
  "JOB_BOARD",
  "OTHER",
] as const;

const CreateCandidateDialog: React.FC<CreateCandidateDialogProps> = ({
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
    formState: { errors, isDirty },
  } = useForm<CandidateFormData>({
    defaultValues: {
      name: "",
      email: "",
      source: "DIRECT_APPLY",
      sourceDetails: "",
    },
  });

  const { mutate: createCandidate, isPending, isError } = useCreateCandidate();

  const onSubmit = (data: CandidateFormData) => {
    createCandidate(data, {
      onSuccess: () => {
        reset();
        onClose();
        onSuccess?.();
      },
    });
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
      aria-labelledby="create-candidate-dialog-title"
      aria-describedby="create-candidate-dialog-description"
    >
      <DialogTitle id="create-candidate-dialog-title">
        {t("candidates.create_title")}
      </DialogTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-label={t("aria.create_dialog", {
          entity: t("candidates.title").toLowerCase(),
        })}
      >
        <DialogContent>
          <FormErrorSummary errors={errors} />

          <TextField
            label={t("candidates.name_label")}
            fullWidth
            margin="normal"
            {...register(
              "name",
              validationRules.combine(
                validationRules.required(t("candidates.name_label")),
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

          <TextField
            label={t("candidates.email_label")}
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

          <FormControl fullWidth margin="normal">
            <InputLabel id="source-label">
              {t("candidates.source_label")}
            </InputLabel>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="source-label"
                  label={t("candidates.source_label")}
                >
                  {APPLICATION_SOURCES.map((source) => (
                    <MenuItem key={source} value={source}>
                      {t(`candidates.sources.${source}`)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <TextField
            label={t("candidates.source_details_label")}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            {...register("sourceDetails")}
            placeholder={t("validation.field_required", {
              field: t("candidates.source_details_label"),
            })}
            helperText={t("candidates.source_details_label")}
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
              ) : undefined
            }
            aria-label={isPending ? t("common.creating") : t("common.create")}
          >
            {isPending ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default CreateCandidateDialog;
