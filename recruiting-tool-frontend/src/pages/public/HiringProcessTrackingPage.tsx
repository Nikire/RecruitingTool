import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  getPublicHiringProcessTracking,
  PublicStage,
} from "../../api/hiringProcess";

// Custom stepper connector
const TrackingConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.divider,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Custom step icon
const StepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  color: theme.palette.divider,
  display: "flex",
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  ...(ownerState.completed && {
    color: theme.palette.success.main,
  }),
}));

function TrackingStepIcon(props: {
  active?: boolean;
  completed?: boolean;
  className?: string;
}) {
  const { active, completed, className } = props;
  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? (
        <CheckCircleIcon sx={{ fontSize: 32 }} />
      ) : active ? (
        <RadioButtonCheckedIcon sx={{ fontSize: 32 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 32, opacity: 0.4 }} />
      )}
    </StepIconRoot>
  );
}

function getStatusChipProps(status: string): {
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
} {
  switch (status) {
    case "OPEN":
      return { label: "open", color: "info" };
    case "IN_PROGRESS":
      return { label: "in_progress", color: "primary" };
    case "CLOSED":
      return { label: "closed", color: "success" };
    case "CANCELLED":
      return { label: "cancelled", color: "warning" };
    case "REJECTED":
      return { label: "rejected", color: "error" };
    default:
      return { label: "open", color: "default" };
  }
}

const HiringProcessTrackingPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const theme = useTheme();

  const {
    data: tracking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-hiring-process-tracking", uid],
    queryFn: () => getPublicHiringProcessTracking(uid!),
    enabled: !!uid,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">
          {t("hiring_process_tracking.loading")}
        </Typography>
      </Box>
    );
  }

  if (error || !tracking) {
    const statusCode = (error as { response?: { status?: number } } | null)
      ?.response?.status;
    const is404 = statusCode === 404;

    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box textAlign="center">
          <ErrorOutlineIcon
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {is404
              ? t("hiring_process_tracking.not_found_title")
              : t("hiring_process_tracking.error_title")}
          </Typography>
          <Typography color="text.secondary">
            {is404
              ? t("hiring_process_tracking.not_found_message")
              : t("hiring_process_tracking.error_message")}
          </Typography>
        </Box>
      </Container>
    );
  }

  const {
    candidateName,
    positionTitle,
    companyName,
    status,
    stages,
    lastUpdated,
  } = tracking;

  const currentStageIndex = stages.findIndex((s) => s.status === "CURRENT");
  const activeStep =
    currentStageIndex !== -1 ? currentStageIndex : stages.length;

  const statusChip = getStatusChipProps(status);
  const isTerminal =
    status === "CLOSED" || status === "CANCELLED" || status === "REJECTED";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
      <Box textAlign="center" mb={5}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: "1.6rem", md: "2.125rem" } }}
        >
          {t("hiring_process_tracking.page_title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("hiring_process_tracking.page_subtitle")}
        </Typography>
      </Box>

      {/* Summary card */}
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            {positionTitle}
          </Typography>
          <Chip
            label={t(`hiring_process_status.${statusChip.label}`)}
            color={statusChip.color}
            size="medium"
            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          display="flex"
          gap={4}
          flexWrap="wrap"
          sx={{ "& > *": { minWidth: 140 } }}
        >
          <Box display="flex" alignItems="flex-start" gap={1}>
            <PersonIcon
              fontSize="small"
              sx={{ mt: 0.25, color: "text.secondary" }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("hiring_process_tracking.candidate_label")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {candidateName}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="flex-start" gap={1}>
            <BusinessIcon
              fontSize="small"
              sx={{ mt: 0.25, color: "text.secondary" }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("hiring_process_tracking.company_label")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {companyName}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="flex-start" gap={1}>
            <WorkIcon
              fontSize="small"
              sx={{ mt: 0.25, color: "text.secondary" }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t("hiring_process_tracking.position_label")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {positionTitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          mt={3}
        >
          {t("hiring_process_tracking.last_updated")}{" "}
          {new Date(lastUpdated).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Paper>

      {/* Stage progress */}
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={4}>
          {t("hiring_process_tracking.recruitment_stages")}
        </Typography>

        {stages.length === 0 ? (
          <Typography color="text.secondary">
            {t("hiring_process_tracking.no_stages")}
          </Typography>
        ) : (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<TrackingConnector />}
            sx={{ overflowX: "auto", pb: 1 }}
          >
            {stages.map((stage: PublicStage) => {
              const isCompleted = stage.status === "COMPLETED";
              const isCurrent = stage.status === "CURRENT";

              return (
                <Step key={stage.uid} completed={isCompleted}>
                  <StepLabel
                    StepIconComponent={TrackingStepIcon}
                    sx={{
                      "& .MuiStepLabel-label": {
                        mt: 1,
                        fontWeight: isCurrent ? 700 : 400,
                        color: isCurrent
                          ? theme.palette.primary.main
                          : isCompleted
                            ? theme.palette.success.main
                            : "text.secondary",
                      },
                    }}
                  >
                    {stage.title}
                    {isCurrent && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="primary"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                      >
                        {t("hiring_process_tracking.current_stage_badge")}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}

        {/* Terminal state messages */}
        {isTerminal && (
          <Alert
            severity={
              status === "CLOSED"
                ? "success"
                : status === "REJECTED"
                  ? "error"
                  : "warning"
            }
            sx={{ mt: 4 }}
          >
            {status === "CLOSED" &&
              t("hiring_process_tracking.process_closed_message")}
            {status === "CANCELLED" &&
              t("hiring_process_tracking.process_cancelled_message")}
            {status === "REJECTED" &&
              t("hiring_process_tracking.process_rejected_message")}
          </Alert>
        )}
      </Paper>

      {/* Privacy notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        {t("hiring_process_tracking.privacy_notice")}
      </Alert>
    </Container>
  );
};

export default HiringProcessTrackingPage;
