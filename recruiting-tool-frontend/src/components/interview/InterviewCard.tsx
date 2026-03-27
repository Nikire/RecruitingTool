import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Schedule as DurationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Interview, InterviewStatus } from "../../types/interview.types";
import { useState } from "react";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import {
  useCancelInterview,
  useDeleteInterview,
  useUpdateInterview,
} from "../../hooks/api/useInterview";

interface InterviewCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onEdit }) => {
  const { t } = useTranslation();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const cancelMutation = useCancelInterview();
  const deleteMutation = useDeleteInterview();
  const updateMutation = useUpdateInterview();

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.PENDING:
        return "default";
      case InterviewStatus.SCHEDULED:
        return "primary";
      case InterviewStatus.COMPLETED:
        return "success";
      case InterviewStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const getCardBorderColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        return "#1976d2";
      case InterviewStatus.COMPLETED:
        return "#2e7d32";
      case InterviewStatus.CANCELLED:
        return "#d32f2f";
      default:
        return "#e0e0e0";
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await updateMutation.mutateAsync({
        uid: interview.uid,
        data: { status: InterviewStatus.COMPLETED },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(interview.uid);
      setConfirmCancelOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        uid: interview.uid,
        stageUid: interview.stageUid,
      });
      setConfirmDeleteOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("interview.not_scheduled");
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return t("interview.invalid_date");
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return t("interview.not_set");
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours} ${t(`interview.${hours > 1 ? "hours" : "hour"}`)}`;
    } else {
      return `${mins} ${t(`interview.${mins > 1 ? "minutes" : "minute"}`)}`;
    }
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          borderLeft: 4,
          borderColor: getCardBorderColor(interview.status),
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="h6" component="div">
                  {t("interview.title")}
                </Typography>
                <Chip
                  label={interview.status}
                  color={getStatusColor(interview.status)}
                  size="small"
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 0.5 }}>
              {interview.status === InterviewStatus.SCHEDULED && (
                <Tooltip title={t("interview.mark_completed_tooltip")}>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={handleMarkCompleted}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              {interview.status !== InterviewStatus.CANCELLED &&
                interview.status !== InterviewStatus.COMPLETED && (
                  <>
                    <Tooltip title={t("interview.edit_tooltip")}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(interview)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("interview.cancel_tooltip")}>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => setConfirmCancelOpen(true)}
                        disabled={cancelMutation.isPending}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              <Tooltip title={t("interview.delete_tooltip")}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>{t("interview.date_label")}</strong>{" "}
                {formatDate(interview.scheduledDate)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>{t("interview.time_label")}</strong>{" "}
                {interview.scheduledTime || t("interview.not_set")}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DurationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>{t("interview.duration_label")}</strong>{" "}
                {formatDuration(interview.duration)}
              </Typography>
            </Box>

            {interview.meetingLink && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LinkIcon />}
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    {t("interview.join_meeting")}
                  </Button>
                </Box>
              </>
            )}

            {interview.notes && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                    gutterBottom
                  >
                    {t("interview.notes_label")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {interview.notes}
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t("interview.scheduled_by", {
                  name: interview.scheduledByName,
                })}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t("interview.delete_title")}
        message={t("interview.delete_confirmation")}
      />

      <ConfirmDeleteDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title={t("interview.cancel_title")}
        message={t("interview.cancel_confirmation")}
      />
    </>
  );
};

export default InterviewCard;
