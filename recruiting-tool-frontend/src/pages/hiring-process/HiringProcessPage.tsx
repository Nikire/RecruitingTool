import {
  Divider,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StagesTimeline from "../../components/stages/StagesTimeline/StagesTimeline";
import {
  useHiringProcesses,
  useUpdateHiringProcess,
} from "../../hooks/api/useHiringProcess";
import {
  HiringProcess,
  HiringProcessStatus,
} from "../../types/hiringProcess.types";
import { useState } from "react";
import StageProgressionDialog from "../../components/dialogs/StageProgressionDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import StatusBadgeEditor, {
  StatusOption,
} from "../../components/common/StatusBadgeEditor";
import { toast } from "react-hot-toast";
import { wrapLongText } from "../../utils/textOverflow";

const HIRING_PROCESS_STATUS_OPTIONS: StatusOption[] = [
  { value: "OPEN", labelKey: "hiring_process_status.open", color: "success" },
  {
    value: "IN_PROGRESS",
    labelKey: "hiring_process_status.in_progress",
    color: "primary",
  },
  {
    value: "CLOSED",
    labelKey: "hiring_process_status.closed",
    color: "default",
  },
  {
    value: "CANCELLED",
    labelKey: "hiring_process_status.cancelled",
    color: "warning",
  },
  {
    value: "REJECTED",
    labelKey: "hiring_process_status.rejected",
    color: "error",
  },
];

const HiringProcessPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [stageProgressionOpen, setStageProgressionOpen] = useState(false);
  const [markAsHiredOpen, setMarkAsHiredOpen] = useState(false);
  // This page toasts its own, more specific messages per action, so the hook's
  // generic update toast is suppressed to avoid two stacked notifications.
  const updateMutation = useUpdateHiringProcess({ showToast: false });
  const {
    data: hiringProcessData,
    isLoading: isHiringProcessLoading,
    error,
  } = useHiringProcesses(uid);

  const handleStatusChange = (newStatus: string) => {
    if (!uid) return;
    updateMutation.mutate(
      { uid, data: { status: newStatus as HiringProcessStatus } },
      {
        onSuccess: () => {
          toast.success(t("hiring_process_page.status_updated"));
        },
        onError: () => {
          toast.error(t("hiring_process_page.status_update_failed"));
        },
      },
    );
  };

  const handleMarkAsHired = () => {
    if (!uid) return;
    updateMutation.mutate(
      { uid, data: { status: "CLOSED" as HiringProcessStatus } },
      {
        onSuccess: () => {
          toast.success(t("hiring_process_page.marked_as_hired_success"));
          setMarkAsHiredOpen(false);
        },
        onError: () => {
          toast.error(t("hiring_process_page.status_update_failed"));
          setMarkAsHiredOpen(false);
        },
      },
    );
  };

  if (isHiringProcessLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="errors.fetch_failed" />;
  }

  if (!hiringProcessData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>{t("hiring_process_page.no_data_found")}</Typography>
      </Box>
    );
  }

  const hiringProcess = hiringProcessData as HiringProcess;
  const sortedStages = hiringProcess.stages
    ? [...hiringProcess.stages].sort((a, b) => a.position - b.position)
    : [];

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        {t("common.back")}
      </Button>

      <Paper sx={{ p: 4, mb: 4 }} elevation={2}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ minWidth: 0, flex: "1 1 240px" }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              {t("hiring_process_page.hiring_process")}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500, ...wrapLongText }}>
              {hiringProcess.title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              flexShrink: 0,
              gap: 1,
            }}
          >
            {hiringProcess.candidate &&
              hiringProcess.status !== "CLOSED" &&
              hiringProcess.status !== "CANCELLED" &&
              hiringProcess.status !== "REJECTED" && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setMarkAsHiredOpen(true)}
                  disabled={updateMutation.isPending}
                  size="small"
                >
                  {t("hiring_process_page.mark_as_hired")}
                </Button>
              )}
            <StatusBadgeEditor
              currentStatus={hiringProcess.status}
              statusOptions={HIRING_PROCESS_STATUS_OPTIONS}
              onChange={handleStatusChange}
              disabled={updateMutation.isPending}
              size="medium"
              label={t("hiring_process_page.change_status")}
              ariaLabel={t("status_editor.change_hiring_process_status")}
            />
          </Box>
        </Box>

        {!hiringProcess.candidate && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t("hiring_process_page.no_candidate_assigned_title")}
              </Typography>
              <Typography variant="body2">
                {t("hiring_process_page.no_candidate_assigned_message")}
              </Typography>
            </Box>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 2, sm: 6 },
            mb: 3,
          }}
        >
          {hiringProcess.company && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                {t("hiring_process_page.company")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, ...wrapLongText }}
              >
                {hiringProcess.company.name}
              </Typography>
            </Box>
          )}
          {hiringProcess.jobPosition?.createdBy && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                {t("hiring_process_page.hr_manager")}
              </Typography>
              <Typography variant="body1" sx={wrapLongText}>
                {hiringProcess.jobPosition.createdBy.name}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block", ...wrapLongText }}
              >
                {hiringProcess.jobPosition.createdBy.email}
              </Typography>
            </Box>
          )}
        </Box>

        {hiringProcess.candidate && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {t("hiring_process_page.candidate_information")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 2, sm: 6 },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    {t("hiring_process_page.name")}
                  </Typography>
                  <Typography variant="body1" sx={wrapLongText}>
                    {hiringProcess.candidate.name}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    {t("hiring_process_page.email")}
                  </Typography>
                  <Typography variant="body1" sx={wrapLongText}>
                    {hiringProcess.candidate.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          {t("hiring_process_page.recruitment_stages")}
        </Typography>
        {hiringProcess.status !== "CLOSED" && (
          <Button
            startIcon={<SkipNextIcon />}
            variant="contained"
            onClick={() => setStageProgressionOpen(true)}
          >
            {t("hiring_process_page.progress_stage")}
          </Button>
        )}
      </Box>

      {sortedStages.length > 0 && (
        <StagesTimeline
          stages={sortedStages}
          hiringProcessUid={uid!}
          candidate={hiringProcess.candidate}
        />
      )}

      {uid && (
        <StageProgressionDialog
          open={stageProgressionOpen}
          onClose={() => setStageProgressionOpen(false)}
          hiringProcessUid={uid}
          stages={sortedStages}
          currentStageUid={
            sortedStages.find((s) => s.status === "CURRENT")?.uid
          }
        />
      )}

      {/* Mark as Hired confirmation dialog */}
      <Dialog
        open={markAsHiredOpen}
        onClose={() => setMarkAsHiredOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("hiring_process_page.mark_as_hired")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("hiring_process_page.mark_as_hired_confirm")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMarkAsHiredOpen(false)}
            disabled={updateMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleMarkAsHired}
            variant="contained"
            color="success"
            disabled={updateMutation.isPending}
          >
            {t("hiring_process_page.mark_as_hired")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HiringProcessPage;
