import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Application,
  ApplicationStatus,
  UpdateApplicationDto,
} from "../../types/application.types";
import {
  useUpdateApplication,
  useDeleteApplication,
  useAcceptApplication,
} from "../../hooks/api/useApplications";
import { useDownloadFile } from "../../hooks/api/useFiles";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ApplicationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}

interface FormData {
  status: ApplicationStatus;
  notes: string;
}

const ApplicationDetailDialog: React.FC<ApplicationDetailDialogProps> = ({
  open,
  onClose,
  application,
}) => {
  const { t } = useTranslation();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      status: ApplicationStatus.PENDING,
      notes: "",
    },
  });

  const { mutate: updateApplication, isPending: isUpdating } =
    useUpdateApplication();
  const { mutate: deleteApplication, isPending: isDeleting } =
    useDeleteApplication();
  const { mutate: acceptApp, isPending: isAccepting } = useAcceptApplication();
  const { mutate: downloadFile } = useDownloadFile();

  const currentStatus = watch("status");

  // Update form values when application changes
  useEffect(() => {
    if (application) {
      reset({
        status: application.status,
        notes: application.notes || "",
      });
    }
  }, [application, reset]);

  const onSubmit = (data: FormData) => {
    if (!application) return;

    const updateData: UpdateApplicationDto = {
      status: data.status,
      notes: data.notes || undefined,
    };

    updateApplication(
      { uid: application.uid, data: updateData },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDownloadResume = () => {
    if (application?.resumeFileUid && application?.resumeFileName) {
      downloadFile({
        uid: application.resumeFileUid,
        filename: application.resumeFileName,
      });
    }
  };

  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (application) {
      deleteApplication(application.uid, {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
          onClose();
        },
      });
    }
  };

  const handleAcceptApplication = () => {
    if (application) {
      acceptApp(application.uid, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "warning";
      case ApplicationStatus.REVIEWED:
        return "info";
      case ApplicationStatus.ACCEPTED:
        return "success";
      case ApplicationStatus.REJECTED:
        return "error";
      case ApplicationStatus.ARCHIVED:
        return "default";
      default:
        return "default";
    }
  };

  if (!application) return null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {t("application_detail.title")}
            </Typography>
            <Chip
              label={t(`status.${application.status.toLowerCase()}`)}
              color={getStatusColor(application.status)}
              size="small"
            />
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {/* Applicant Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t("application_detail.applicant_info")}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("application_detail.name")}
                  </Typography>
                  <Typography variant="body1">
                    {application.applicantName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("application_detail.email")}
                  </Typography>
                  <Typography variant="body1">
                    {application.applicantEmail}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("application_detail.phone")}
                  </Typography>
                  <Typography variant="body1">
                    {application.applicantPhone}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("application_detail.applied_date")}
                  </Typography>
                  <Typography variant="body1">
                    {format(
                      new Date(application.appliedAt),
                      "MMM d, yyyy h:mm a",
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Job Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t("application_detail.job_position")}
              </Typography>
              <Typography variant="body1">
                {application.jobPositionTitle}
              </Typography>
              {application.companyName && (
                <Typography variant="body2" color="text.secondary">
                  {application.companyName}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Resume */}
            {application.resumeFileUid && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("application_detail.resume")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">
                      {application.resumeFileName}
                    </Typography>
                    <Tooltip title={t("application_detail.download_resume")}>
                      <IconButton
                        onClick={handleDownloadResume}
                        size="small"
                        color="primary"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("application_detail.cover_letter")}
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    <Typography variant="body2" whiteSpace="pre-wrap">
                      {application.coverLetter}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            {/* HR Section - Editable */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {t("application_detail.hr_review")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">
                    {t("application_detail.status")}
                  </InputLabel>
                  <Select
                    labelId="status-label"
                    label={t("application_detail.status")}
                    value={currentStatus}
                    {...register("status", {
                      required: t("validation.status_required"),
                    })}
                    error={!!errors.status}
                  >
                    <MenuItem value={ApplicationStatus.PENDING}>
                      {t("status.pending")}
                    </MenuItem>
                    <MenuItem value={ApplicationStatus.REVIEWED}>
                      {t("status.reviewed")}
                    </MenuItem>
                    <MenuItem value={ApplicationStatus.ACCEPTED}>
                      {t("status.accepted")}
                    </MenuItem>
                    <MenuItem value={ApplicationStatus.REJECTED}>
                      {t("status.rejected")}
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label={t("applications.internal_notes")}
                  multiline
                  rows={6}
                  sx={{ flexGrow: 1 }}
                  fullWidth
                  placeholder={t("application_detail.add_notes")}
                  {...register("notes")}
                />
              </Box>

              {application.reviewedAt && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("application_detail.reviewed_on")}{" "}
                    {format(
                      new Date(application.reviewedAt),
                      "MMM d, yyyy h:mm a",
                    )}
                    {application.reviewedByName &&
                      ` ${t("application_detail.reviewed_by")} ${application.reviewedByName}`}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
            <Button
              onClick={handleDeleteClick}
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
              disabled={isDeleting || isUpdating || isAccepting}
            >
              {t("common.delete")}
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={handleClose}
                disabled={isUpdating || isAccepting}
              >
                {t("common.cancel")}
              </Button>
              {application.status !== ApplicationStatus.ACCEPTED && (
                <Button
                  onClick={handleAcceptApplication}
                  variant="contained"
                  color="success"
                  startIcon={
                    isAccepting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CheckCircleIcon />
                    )
                  }
                  disabled={isAccepting || isUpdating}
                >
                  {isAccepting
                    ? t("application_detail.accepting")
                    : t("application_detail.accept_and_create")}
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={isUpdating || !isDirty || isAccepting}
              >
                {isUpdating
                  ? t("common.saving")
                  : t("application_detail.save_changes")}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("application_detail.delete_application")}
        message={t("application_detail.delete_confirmation", {
          name: application.applicantName,
        })}
      />
    </>
  );
};

export default ApplicationDetailDialog;
