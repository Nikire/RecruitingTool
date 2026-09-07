import React from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  timelineItemClasses,
} from "@mui/lab";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  SwapHoriz as SwapHorizIcon,
  Flag as FlagIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Note as NoteIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useCandidateActivities } from "../../hooks/api/useCandidateActivities";
import { CandidateActivityType } from "../../types/candidate-activity.types";
import { formatDate } from "../../utils/dateFormatters";

interface CandidateActivityTimelineProps {
  candidateUid: string;
}

/**
 * Backend metadata keys we know how to present, mapped to their translated
 * label. Anything not listed here is internal plumbing and is not rendered,
 * so raw camelCase field names never leak into the timeline.
 */
const METADATA_LABEL_KEYS: Record<string, string> = {
  source: "candidates.source_label",
  email: "candidates.email_label",
};

/** Metadata entries that have both a known label and a displayable value. */
const getDisplayableMetadata = (
  metadata: Record<string, unknown> | undefined,
): [string, unknown][] =>
  Object.entries(metadata ?? {}).filter(
    ([key, value]) =>
      key in METADATA_LABEL_KEYS &&
      value !== null &&
      value !== undefined &&
      value !== "",
  );

/** Renders a metadata value as text, translating known enums. */
const formatMetadataValue = (
  key: string,
  value: unknown,
  t: TFunction,
): string => {
  if (key === "source" && typeof value === "string") {
    return t(`candidates.sources.${value}`, { defaultValue: value });
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const CandidateActivityTimeline: React.FC<CandidateActivityTimelineProps> = ({
  candidateUid,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    data: activities,
    isLoading,
    isError,
  } = useCandidateActivities(candidateUid);

  const getActivityIcon = (type: CandidateActivityType) => {
    switch (type) {
      case CandidateActivityType.CREATED:
        return <PersonAddIcon />;
      case CandidateActivityType.STAGE_CHANGED:
        return <SwapHorizIcon />;
      case CandidateActivityType.STATUS_CHANGED:
        return <FlagIcon />;
      case CandidateActivityType.INTERVIEW_SCHEDULED:
        return <EventIcon />;
      case CandidateActivityType.INTERVIEW_UPDATED:
        return <EditIcon />;
      case CandidateActivityType.INTERVIEW_CANCELLED:
        return <CancelIcon />;
      case CandidateActivityType.INTERVIEW_COMPLETED:
        return <CheckCircleIcon />;
      case CandidateActivityType.NOTE_ADDED:
        return <NoteIcon />;
      case CandidateActivityType.APPLICATION_RECEIVED:
        return <DescriptionIcon />;
      case CandidateActivityType.EMAIL_SENT:
        return <EmailIcon />;
      default:
        return <FlagIcon />;
    }
  };

  const getActivityColor = (
    type: CandidateActivityType,
  ):
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "grey" => {
    switch (type) {
      case CandidateActivityType.CREATED:
      case CandidateActivityType.APPLICATION_RECEIVED:
        return "success";
      case CandidateActivityType.INTERVIEW_SCHEDULED:
      case CandidateActivityType.INTERVIEW_COMPLETED:
        return "primary";
      case CandidateActivityType.INTERVIEW_CANCELLED:
        return "error";
      case CandidateActivityType.STAGE_CHANGED:
      case CandidateActivityType.STATUS_CHANGED:
        return "info";
      case CandidateActivityType.NOTE_ADDED:
      case CandidateActivityType.EMAIL_SENT:
        return "secondary";
      default:
        return "grey";
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t("candidate_activity.load_error")}
      </Alert>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography color="textSecondary">
          {t("candidate_activity.no_activities")}
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline
      position={isMobile ? "right" : "alternate"}
      sx={
        isMobile
          ? {
              px: 0,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }
          : undefined
      }
    >
      {activities.map((activity, index) => {
        const metadataEntries = getDisplayableMetadata(activity.metadata);
        const formattedDate = formatDate(
          activity.createdAt,
          "PPp",
          i18n.language,
        );

        return (
          <TimelineItem key={activity.uid}>
            {!isMobile && (
              <TimelineOppositeContent>
                <Typography variant="body2" color="textSecondary">
                  {formattedDate}
                </Typography>
                {activity.userName && (
                  <Typography variant="caption" color="textSecondary">
                    {activity.userName}
                  </Typography>
                )}
              </TimelineOppositeContent>
            )}

            <TimelineSeparator>
              <TimelineDot color={getActivityColor(activity.type)}>
                {getActivityIcon(activity.type)}
              </TimelineDot>
              {index < activities.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              {isMobile && (
                <Box sx={{ mb: 0.5 }}>
                  <Typography
                    variant="caption"
                    display="block"
                    color="textSecondary"
                  >
                    {formattedDate}
                  </Typography>
                  {activity.userName && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="textSecondary"
                    >
                      {activity.userName}
                    </Typography>
                  )}
                </Box>
              )}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t(`candidate_activity.type.${activity.type.toLowerCase()}`)}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 0.5 }}
                >
                  {activity.description}
                </Typography>
                {metadataEntries.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {metadataEntries.map(([key, value]) => (
                      <Typography
                        key={key}
                        variant="caption"
                        display="block"
                        color="textSecondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        <strong>{t(METADATA_LABEL_KEYS[key])}:</strong>{" "}
                        {formatMetadataValue(key, value, t)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default CandidateActivityTimeline;
