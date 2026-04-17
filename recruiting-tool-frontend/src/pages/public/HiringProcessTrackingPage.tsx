import React, { useState } from "react";
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
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
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

const STORAGE_KEY_PREFIX = "hp_access_";

const HiringProcessTrackingPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const theme = useTheme();

  const storageKey = uid ? `${STORAGE_KEY_PREFIX}${uid}` : null;

  const [submittedCode, setSubmittedCode] = useState<string>(() => {
    if (!storageKey) return "";
    return localStorage.getItem(storageKey) ?? "";
  });

  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  const {
    data: tracking,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-hiring-process-tracking", uid, submittedCode],
    queryFn: () => getPublicHiringProcessTracking(uid!, submittedCode),
    enabled: !!uid && !!submittedCode,
    retry: false,
  });

  const isUnauthorized =
    !submittedCode ||
    (error as { response?: { status?: number } } | null)?.response?.status ===
      401;

  const handleUnlock = () => {
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized) return;
    setCodeError(false);
    if (storageKey) {
      localStorage.setItem(storageKey, normalized);
    }
    setSubmittedCode(normalized);
    refetch();
  };

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeInput(e.target.value.toUpperCase());
    setCodeError(false);
  };

  // When error changes, detect 401 and mark codeError
  React.useEffect(() => {
    if (
      (error as { response?: { status?: number } } | null)?.response?.status ===
      401
    ) {
      setCodeError(true);
      // Clear the stored code so user must re-enter
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      setSubmittedCode("");
    }
  }, [error, storageKey]);

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

  // Show access code entry form when no code has been submitted or code was invalid
  if (isUnauthorized) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Box textAlign="center" mb={4}>
          <LockIcon sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("hiring_process_tracking.access_required")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("hiring_process_tracking.enter_code")}
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("hiring_process_tracking.code_hint")}
          </Typography>

          <TextField
            fullWidth
            label={t("hiring_process_tracking.code_label")}
            value={codeInput}
            onChange={handleCodeInputChange}
            error={codeError}
            helperText={
              codeError ? t("hiring_process_tracking.invalid_code") : undefined
            }
            inputProps={{
              maxLength: 8,
              style: {
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                fontSize: "1.25rem",
                fontWeight: 600,
                textAlign: "center",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUnlock();
            }}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUnlock}
            disabled={!codeInput.trim()}
          >
            {t("hiring_process_tracking.unlock")}
          </Button>
        </Paper>
      </Container>
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

      {/* Current Stage Detail card */}
      {currentStageIndex !== -1 && !isTerminal && (
        <Paper
          elevation={2}
          sx={{ p: { xs: 3, md: 4 }, mt: 4, borderRadius: 2 }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <RadioButtonCheckedIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {t("hiring_process_tracking.current_stage_title")}
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            mb={2}
          >
            <Typography variant="h5" fontWeight={700}>
              {stages[currentStageIndex].title}
            </Typography>
            <Chip
              label={t(
                `hiring_process_tracking.stage_type_${stages[currentStageIndex].type}`,
                stages[currentStageIndex].type,
              )}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography variant="body1" color="text.secondary" mb={2}>
            {stages[currentStageIndex].description
              ? stages[currentStageIndex].description
              : t("hiring_process_tracking.no_description")}
          </Typography>

          {stages[currentStageIndex].estimatedTime != null && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t("hiring_process_tracking.estimated_duration")}:{" "}
                <strong>
                  {stages[currentStageIndex].estimatedTime}{" "}
                  {t("hiring_process_tracking.minutes")}
                </strong>
              </Typography>
            </Box>
          )}

          <Alert severity="success" icon={false} sx={{ mt: 2 }}>
            {t("hiring_process_tracking.current_stage_motivational")}
          </Alert>
        </Paper>
      )}

      {/* Process Overview */}
      {stages.length > 0 && (
        <Paper
          elevation={2}
          sx={{ p: { xs: 3, md: 4 }, mt: 4, borderRadius: 2 }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <FormatListNumberedIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              {t("hiring_process_tracking.process_overview_title")}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("hiring_process_tracking.process_overview_subtitle")}
          </Typography>

          {stages.map((stage: PublicStage, index: number) => {
            const isCompleted = stage.status === "COMPLETED";
            const isCurrent = stage.status === "CURRENT";

            const circleColor = isCompleted
              ? theme.palette.success.main
              : isCurrent
                ? theme.palette.primary.main
                : theme.palette.action.disabled;

            return (
              <React.Fragment key={stage.uid}>
                <Box display="flex" gap={2} py={2} alignItems="flex-start">
                  {/* Step number circle */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: circleColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: "#fff", lineHeight: 1 }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  {/* Stage details */}
                  <Box flex={1} minWidth={0}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                      mb={0.5}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={isCurrent ? 700 : 500}
                        color={
                          isCurrent
                            ? "primary.main"
                            : isCompleted
                              ? "success.main"
                              : "text.primary"
                        }
                      >
                        {stage.title}
                      </Typography>
                      <Chip
                        label={t(
                          `hiring_process_tracking.stage_type_${stage.type}`,
                          stage.type,
                        )}
                        size="small"
                        variant="outlined"
                        color={
                          isCurrent
                            ? "primary"
                            : isCompleted
                              ? "success"
                              : "default"
                        }
                      />
                    </Box>

                    {stage.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={0.5}
                      >
                        {stage.description}
                      </Typography>
                    )}

                    {stage.estimatedTime != null && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon
                          sx={{ fontSize: 14, color: "text.disabled" }}
                        />
                        <Typography variant="caption" color="text.disabled">
                          {t("hiring_process_tracking.estimated_duration")}:{" "}
                          {stage.estimatedTime}{" "}
                          {t("hiring_process_tracking.minutes")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {index < stages.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </Paper>
      )}

      {/* Privacy notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        {t("hiring_process_tracking.privacy_notice")}
      </Alert>
    </Container>
  );
};

export default HiringProcessTrackingPage;
