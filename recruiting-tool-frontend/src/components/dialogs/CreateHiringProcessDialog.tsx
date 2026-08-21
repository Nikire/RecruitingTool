import { useState, useRef } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  InputAdornment,
} from "@mui/material";
import FormDialog from "./FormDialog";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ErrorIcon from "@mui/icons-material/Error";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCreateHiringProcess } from "../../hooks/api/useHiringProcess";
import {
  useCandidates,
  useCreateCandidate,
} from "../../hooks/api/useCandidates";
import { useJobPositions } from "../../hooks/api/useJobPositions";
import { useUploadFile } from "../../hooks/api/useFiles";
import { JobPosition } from "../../types/jobPosition.types";
import { Candidate } from "../../types/candidate";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";

interface CreateHiringProcessDialogProps {
  open: boolean;
  onClose: () => void;
}

type CandidateMode = "existing" | "new";

interface HiringProcessFormData {
  candidateUid: string;
  jobPositionUid: string;
  // New candidate fields
  candidateName: string;
  candidateEmail: string;
}

const ACCEPTED_CV_TYPES = ".pdf,.doc,.docx";
const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const CreateHiringProcessDialog: React.FC<CreateHiringProcessDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const [candidateMode, setCandidateMode] = useState<CandidateMode>("existing");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors, isDirty },
  } = useForm<HiringProcessFormData>({
    defaultValues: {
      candidateUid: "",
      jobPositionUid: "",
      candidateName: "",
      candidateEmail: "",
    },
  });

  const {
    mutate: createHiringProcess,
    isPending,
    isError,
  } = useCreateHiringProcess();
  const { mutate: createCandidate, isPending: isCreatingCandidate } =
    useCreateCandidate();
  const { data: candidates, isLoading: loadingCandidates } = useCandidates();
  const { data: jobPositionsData, isLoading: loadingJobPositions } =
    useJobPositions();
  const { mutateAsync: uploadFile, isPending: isUploadingCv } = useUploadFile();

  const jobPositions = jobPositionsData as JobPosition[] | undefined;

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCvError(null);
    if (!file) {
      setCvFile(null);
      return;
    }
    if (file.size > MAX_CV_SIZE_BYTES) {
      setCvError(t("hiring_processes.cv_too_large"));
      setCvFile(null);
      return;
    }
    setCvFile(file);
  };

  const onSubmit = (data: HiringProcessFormData) => {
    if (candidateMode === "new") {
      // Step 1: create candidate
      createCandidate(
        {
          name: data.candidateName,
          email: data.candidateEmail,
        },
        {
          onSuccess: (newCandidate) => {
            // Step 2: optionally upload CV and associate with new candidate
            const afterUpload = () => {
              // Step 3: create hiring process
              createHiringProcess(
                {
                  candidateUid: newCandidate.uid,
                  jobPositionUid: data.jobPositionUid,
                },
                {
                  onSuccess: () => {
                    handleClose();
                  },
                },
              );
            };

            if (cvFile) {
              uploadFile({ file: cvFile, candidateUid: newCandidate.uid })
                .then(afterUpload)
                .catch(afterUpload); // proceed even if upload fails
            } else {
              afterUpload();
            }
          },
        },
      );
    } else {
      // Use existing candidate
      createHiringProcess(
        {
          candidateUid: data.candidateUid,
          jobPositionUid: data.jobPositionUid,
        },
        {
          onSuccess: () => {
            handleClose();
          },
        },
      );
    }
  };

  const handleClose = () => {
    reset();
    setCandidateMode("existing");
    setCvFile(null);
    setCvError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const isLoading = loadingCandidates || loadingJobPositions;
  const isSubmitting = isPending || isCreatingCandidate || isUploadingCv;

  // The attached CV is not part of react-hook-form state.
  const hasUnsavedChanges = isDirty || cvFile !== null;

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      isDirty={hasUnsavedChanges}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("hiring_processes.create_title")}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormErrorSummary errors={errors} />

              {/* Job Position — searchable Autocomplete */}
              <Controller
                name="jobPositionUid"
                control={control}
                rules={{ required: t("validation.job_position_required") }}
                render={({ field: { onChange, value, ref } }) => (
                  <Autocomplete<JobPosition>
                    options={jobPositions ?? []}
                    getOptionLabel={(option) =>
                      `${option.title} (${t(`status.${option.status.toLowerCase()}`)})`
                    }
                    isOptionEqualToValue={(option, val) =>
                      option.uid === val.uid
                    }
                    value={jobPositions?.find((jp) => jp.uid === value) ?? null}
                    onChange={(_, selected) =>
                      onChange(selected ? selected.uid : "")
                    }
                    noOptionsText={t("job_positions.no_positions")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputRef={ref}
                        label={t("job_positions.title")}
                        margin="normal"
                        error={!!errors.jobPositionUid}
                        helperText={errors.jobPositionUid?.message}
                      />
                    )}
                  />
                )}
              />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("hiring_processes.candidate_selection")}
                </Typography>
                <ToggleButtonGroup
                  value={candidateMode}
                  exclusive
                  onChange={(_, value) => value && setCandidateMode(value)}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="existing">
                    <PersonIcon sx={{ mr: 1 }} />
                    {t("hiring_processes.select_existing")}
                  </ToggleButton>
                  <ToggleButton value="new">
                    <AddIcon sx={{ mr: 1 }} />
                    {t("hiring_processes.create_new")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {candidateMode === "existing" ? (
                /* Existing Candidate — searchable Autocomplete */
                <Controller
                  name="candidateUid"
                  control={control}
                  rules={{
                    required:
                      candidateMode === "existing"
                        ? t("validation.candidate_required")
                        : false,
                  }}
                  render={({ field: { onChange, value, ref } }) => (
                    <Autocomplete<Candidate>
                      options={candidates ?? []}
                      getOptionLabel={(option) =>
                        `${option.name} (${option.email})`
                      }
                      isOptionEqualToValue={(option, val) =>
                        option.uid === val.uid
                      }
                      value={candidates?.find((c) => c.uid === value) ?? null}
                      onChange={(_, selected) =>
                        onChange(selected ? selected.uid : "")
                      }
                      noOptionsText={t("candidates.no_candidates")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          inputRef={ref}
                          label={t("candidates.title")}
                          margin="normal"
                          error={!!errors.candidateUid}
                          helperText={errors.candidateUid?.message}
                        />
                      )}
                    />
                  )}
                />
              ) : (
                <Box>
                  <TextField
                    label={t("candidates.name_label")}
                    fullWidth
                    margin="normal"
                    {...register(
                      "candidateName",
                      candidateMode === "new"
                        ? validationRules.combine(
                            validationRules.required(
                              t("candidates.name_label"),
                            ),
                            validationRules.minLength(3),
                          )
                        : {},
                    )}
                    error={!!errors.candidateName}
                    helperText={errors.candidateName?.message}
                    InputProps={{
                      endAdornment: errors.candidateName ? (
                        <InputAdornment position="end">
                          <ErrorIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <TextField
                    label={t("candidates.email_label")}
                    type="email"
                    fullWidth
                    margin="normal"
                    {...register(
                      "candidateEmail",
                      candidateMode === "new" ? validationRules.email() : {},
                    )}
                    error={!!errors.candidateEmail}
                    helperText={errors.candidateEmail?.message}
                    InputProps={{
                      endAdornment: errors.candidateEmail ? (
                        <InputAdornment position="end">
                          <ErrorIcon color="error" />
                        </InputAdornment>
                      ) : null,
                    }}
                  />

                  {/* CV upload */}
                  <Box sx={{ mt: 2 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_CV_TYPES}
                      style={{ display: "none" }}
                      onChange={handleCvFileChange}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("hiring_processes.attach_cv")}
                    </Button>
                    {cvFile && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, verticalAlign: "middle" }}
                      >
                        {cvFile.name}
                      </Typography>
                    )}
                    {cvError && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {cvError}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      {t("hiring_processes.cv_hint")}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 2, display: "block" }}
              >
                {t("hiring_processes.title_auto_generated")}
                <br />
                {t("hiring_processes.title_format")}
              </Typography>
            </>
          )}

          {isError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("errors.create_failed", {
                entity: t("hiring_processes.title").toLowerCase(),
              })}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isLoading}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {isSubmitting ? t("common.creating") : t("common.create")}
          </Button>
        </DialogActions>
      </form>
    </FormDialog>
  );
};

export default CreateHiringProcessDialog;
