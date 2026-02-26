import {
  Divider,
  Typography,
  Box,
  Chip,
  Paper,
  Button,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import WarningIcon from "@mui/icons-material/Warning";
import StagesTimeline from "../../components/stages/StagesTimeline/StagesTimeline";
import { useHiringProcesses } from "../../hooks/api/useHiringProcess";
import { HiringProcess } from "../../types/hiringProcess.types";
import { useState } from "react";
import StageProgressionDialog from "../../components/dialogs/StageProgressionDialog";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getHiringProcessStatusColor } from "../../utils/statusColors";

const HiringProcessPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [stageProgressionOpen, setStageProgressionOpen] = useState(false);
  const {
    data: hiringProcessData,
    isLoading: isHiringProcessLoading,
    error,
  } = useHiringProcesses(uid);

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
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
              {t("hiring_process_page.hiring_process")}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500 }}>
              {hiringProcess.title}
            </Typography>
          </Box>
          <Chip
            label={hiringProcess.status}
            color={getHiringProcessStatusColor(hiringProcess.status)}
            size="medium"
          />
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

        <Box sx={{ display: "flex", gap: 8, mb: 3 }}>
          {hiringProcess.company && (
            <Box>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                {t("hiring_process_page.company")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {hiringProcess.company.name}
              </Typography>
            </Box>
          )}
          {hiringProcess.jobPosition?.createdBy && (
            <Box>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 0.5 }}
              >
                {t("hiring_process_page.hr_manager")}
              </Typography>
              <Typography variant="body1">
                {hiringProcess.jobPosition.createdBy.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
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
              <Box sx={{ display: "flex", gap: 6 }}>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    {t("hiring_process_page.name")}
                  </Typography>
                  <Typography variant="body1">
                    {hiringProcess.candidate.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    {t("hiring_process_page.email")}
                  </Typography>
                  <Typography variant="body1">
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

      {hiringProcess.stages && (
        <StagesTimeline
          stages={hiringProcess.stages}
          hiringProcessUid={uid!}
        />
      )}

      {uid && (
        <StageProgressionDialog
          open={stageProgressionOpen}
          onClose={() => setStageProgressionOpen(false)}
          hiringProcessUid={uid}
          stages={hiringProcess.stages || []}
          currentStageUid={
            hiringProcess.stages?.find((s) => s.status === "CURRENT")?.uid
          }
        />
      )}
    </Box>
  );
};

export default HiringProcessPage;
