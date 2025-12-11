import React from "react";
import { useTranslation } from "react-i18next";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";
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
import { format } from "date-fns";
import { useCandidateActivities } from "../../hooks/api/useCandidateActivities";
import { CandidateActivityType } from "../../types/candidate-activity.types";

interface CandidateActivityTimelineProps {
  candidateUid: string;
}

const CandidateActivityTimeline: React.FC<CandidateActivityTimelineProps> = ({
  candidateUid,
}) => {
  const { t } = useTranslation();
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
    <Timeline position="alternate">
      {activities.map((activity, index) => (
        <TimelineItem key={activity.uid}>
          <TimelineOppositeContent color="textSecondary">
            <Typography variant="body2">
              {format(new Date(activity.createdAt), "PPp")}
            </Typography>
            {activity.userName && (
              <Typography variant="caption" color="textSecondary">
                {activity.userName}
              </Typography>
            )}
          </TimelineOppositeContent>

          <TimelineSeparator>
            <TimelineDot color={getActivityColor(activity.type)}>
              {getActivityIcon(activity.type)}
            </TimelineDot>
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          <TimelineContent>
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
              {activity.metadata &&
                Object.keys(activity.metadata).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <Typography
                        key={key}
                        variant="caption"
                        display="block"
                        color="textSecondary"
                      >
                        <strong>{key}:</strong> {String(value)}
                      </Typography>
                    ))}
                  </Box>
                )}
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default CandidateActivityTimeline;
