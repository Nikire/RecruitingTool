import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import { useCreateApplication } from "../../hooks/api/useApplications";
import { usePublicJobPosition } from "../../hooks/api/useJobPositions";
import { useAuthMe } from "../../hooks/api/useAuth";
import { CustomQuestionRenderer } from "../forms/CustomQuestionRenderer";
import { CustomAnswers } from "../../types/customQuestions";
import { uploadResumePublic } from "../../api/files";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

interface ApplyToJobDialogProps {
  open: boolean;
  onClose: () => void;
  jobUid: string;
  jobTitle: string;
}

export const ApplyToJobDialog: React.FC<ApplyToJobDialogProps> = ({
  open,
  onClose,
  jobUid,
  jobTitle,
}) => {
  const { t } = useTranslation();
  const { mutateAsync: createApplication, isPending: submitting } =
    useCreateApplication();
  const { data: jobPosition, isLoading: loadingJob } =
    usePublicJobPosition(jobUid);
  const { user, isAuthenticated } = useAuthMe();
  const [uploading, setUploading] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  const [formData, setFormData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    coverLetter: "",
  });
  const [customAnswers, setCustomAnswers] = useState<CustomAnswers>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [customAnswerErrors, setCustomAnswerErrors] = useState<
    Record<string, string>
  >({});
  const [success, setSuccess] = useState(false);

  // Initialize custom answers when job position loads
  useEffect(() => {
    if (jobPosition?.customQuestions) {
      const initialAnswers: CustomAnswers = {};
      jobPosition.customQuestions.forEach((q) => {
        initialAnswers[q.id] = "";
      });
      setCustomAnswers(initialAnswers);
    }
  }, [jobPosition]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          resume: t("apply_job.invalid_file_type"),
        }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          resume: t("apply_job.file_too_large"),
        }));
        return;
      }
      setResumeFile(file);
      setFormErrors((prev) => ({ ...prev, resume: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const customErrors: Record<string, string> = {};

    if (!formData.applicantName.trim()) {
      errors.applicantName = t("apply_job.name_required");
    }
    if (!formData.applicantEmail.trim()) {
      errors.applicantEmail = t("apply_job.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
      errors.applicantEmail = t("apply_job.email_invalid");
    }
    if (!formData.applicantPhone.trim()) {
      errors.applicantPhone = t("apply_job.phone_required");
    }

    // Validate custom questions
    if (jobPosition?.customQuestions) {
      jobPosition.customQuestions.forEach((question) => {
        if (question.required) {
          const answer = customAnswers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0)) {
            customErrors[question.id] = t("validation.required");
          }
        }
      });
    }

    setFormErrors(errors);
    setCustomAnswerErrors(customErrors);
    return (
      Object.keys(errors).length === 0 && Object.keys(customErrors).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let resumeFileUid: string | undefined;

      if (resumeFile) {
        setUploading(true);
        const uploadedFile = await uploadResumePublic(resumeFile);
        resumeFileUid = uploadedFile.uid;
        setUploading(false);
      }

      await createApplication({
        jobPositionUid: jobUid,
        applicantName: formData.applicantName,
        applicantEmail: formData.applicantEmail,
        applicantPhone: formData.applicantPhone,
        coverLetter: formData.coverLetter || undefined,
        resumeFileUid,
        customAnswers:
          Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Application submission failed:", error);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      coverLetter: "",
    });
    setCustomAnswers({});
    setResumeFile(null);
    setFormErrors({});
    setCustomAnswerErrors({});
    setSuccess(false);
    onClose();
  };

  const handleAutoFill = async () => {
    if (!isAuthenticated || !user) {
      showErrorToast(
        new Error(t("apply_job.no_profile_data")),
        t("apply_job.no_profile_data"),
      );
      return;
    }

    setAutoFilling(true);
    try {
      // Auto-fill form with user profile data
      setFormData({
        applicantName: user.name || "",
        applicantEmail: user.email || "",
        applicantPhone: user.phoneNumber || "",
        coverLetter: formData.coverLetter, // Keep existing cover letter
      });

      showSuccessToast(t("apply_job.autofill_success"));
    } catch (error) {
      console.error("Auto-fill failed:", error);
      showErrorToast(error as Error, t("apply_job.autofill_error"));
    } finally {
      setAutoFilling(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          borderRadius: { xs: 1, sm: 2 },
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: "1.15rem", sm: "1.25rem" },
          fontWeight: 600,
          pb: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {t("apply_job.title", { jobTitle })}
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t("apply_job.success_message")}
          </Alert>
        ) : (
          <Box
            sx={{
              pt: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {isAuthenticated && user && (
              <Button
                variant="outlined"
                startIcon={
                  autoFilling ? <CircularProgress size={16} /> : <PersonIcon />
                }
                onClick={handleAutoFill}
                disabled={autoFilling || submitting}
                fullWidth
                sx={{
                  justifyContent: "center",
                  py: { xs: 1.25, sm: 1 },
                  minHeight: 44,
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  textTransform: "none",
                  borderRadius: 1,
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    backgroundColor: "primary.light",
                  },
                }}
              >
                {autoFilling
                  ? t("apply_job.autofilling")
                  : t("apply_job.autofill_from_profile")}
              </Button>
            )}
            <TextField
              fullWidth
              label={t("apply_job.full_name")}
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              error={!!formErrors.applicantName}
              helperText={formErrors.applicantName}
              required
              inputProps={{
                minLength: 2,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "1rem", sm: "1rem" },
                  minHeight: { xs: 44, sm: "auto" },
                },
              }}
            />

            <TextField
              fullWidth
              label={t("apply_job.email_address")}
              name="applicantEmail"
              type="email"
              value={formData.applicantEmail}
              onChange={handleInputChange}
              error={!!formErrors.applicantEmail}
              helperText={formErrors.applicantEmail}
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "1rem", sm: "1rem" },
                  minHeight: { xs: 44, sm: "auto" },
                },
              }}
            />

            <TextField
              fullWidth
              label={t("apply_job.phone_number")}
              name="applicantPhone"
              value={formData.applicantPhone}
              onChange={handleInputChange}
              error={!!formErrors.applicantPhone}
              helperText={formErrors.applicantPhone}
              required
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "1rem", sm: "1rem" },
                  minHeight: { xs: 44, sm: "auto" },
                },
              }}
            />

            <Box sx={{ mb: 0 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  py: { xs: 1.75, sm: 1.5 },
                  minHeight: 44,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  textTransform: "none",
                  textAlign: "left",
                  paddingLeft: 2,
                  borderRadius: 1,
                }}
              >
                {resumeFile ? resumeFile.name : t("apply_job.upload_resume")}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>
              {formErrors.resume && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 1,
                    display: "block",
                    fontSize: { xs: "0.85rem", sm: "0.75rem" },
                  }}
                >
                  {formErrors.resume}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              label={t("apply_job.cover_letter")}
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder={t("apply_job.cover_letter_placeholder")}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: { xs: "1rem", sm: "1rem" },
                  minHeight: { xs: 100, sm: "auto" },
                },
              }}
            />

            {jobPosition?.customQuestions &&
              jobPosition.customQuestions.length > 0 && (
                <CustomQuestionRenderer
                  questions={jobPosition.customQuestions}
                  answers={customAnswers}
                  onAnswerChange={(questionId, answer) => {
                    setCustomAnswers((prev) => ({
                      ...prev,
                      [questionId]: answer,
                    }));
                    // Clear error for this question
                    if (customAnswerErrors[questionId]) {
                      setCustomAnswerErrors((prev) => ({
                        ...prev,
                        [questionId]: "",
                      }));
                    }
                  }}
                  errors={customAnswerErrors}
                />
              )}
          </Box>
        )}
      </DialogContent>
      {!success && (
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1 },
            flexDirection: { xs: "column-reverse", sm: "row" },
            "& button": {
              minHeight: 44,
              fontSize: { xs: "0.95rem", sm: "1rem" },
            },
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            {submitting || uploading
              ? t("apply_job.submitting")
              : t("apply_job.submit_application")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
