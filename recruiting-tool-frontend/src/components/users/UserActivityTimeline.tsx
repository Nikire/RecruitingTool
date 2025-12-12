import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import { Typography, Paper, Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useUserActivity } from "../../hooks/api/useUsers";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LoginIcon from "@mui/icons-material/Login";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface UserActivityTimelineProps {
  userUid: string;
}

interface ActivityLog {
  uid: string;
  action: string;
  timestamp: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

const getActivityIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case "user_created":
      return <PersonIcon />;
    case "user_updated":
      return <EditIcon />;
    case "user_login":
      return <LoginIcon />;
    case "user_deactivated":
      return <BlockIcon />;
    case "user_reactivated":
      return <CheckCircleIcon />;
    default:
      return <PersonIcon />;
  }
};

const getActivityColor = (
  action: string,
): "primary" | "secondary" | "error" | "warning" | "info" | "success" => {
  switch (action.toLowerCase()) {
    case "user_created":
      return "success";
    case "user_updated":
      return "info";
    case "user_login":
      return "primary";
    case "user_deactivated":
      return "error";
    case "user_reactivated":
      return "success";
    default:
      return "primary";
  }
};

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
  userUid,
}) => {
  const { t } = useTranslation();
  const { data: activities, isLoading, error } = useUserActivity(userUid);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage message="users.activity_error" />;
  }

  if (!activities || activities.length === 0) {
    return <EmptyState message="users.no_activity" />;
  }

  return (
    <Timeline position="right">
      {activities.map((activity: ActivityLog, index: number) => (
        <TimelineItem key={activity.uid}>
          <TimelineOppositeContent
            sx={{ m: "auto 0", display: { xs: "none", sm: "block" } }}
            align="right"
            variant="body2"
            color="textSecondary"
          >
            {new Date(activity.timestamp).toLocaleString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={getActivityColor(activity.action)}>
              {getActivityIcon(activity.action)}
            </TimelineDot>
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent sx={{ py: "12px", px: 2 }}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{ fontSize: "1rem" }}
              >
                {t(`users.activity_${activity.action.toLowerCase()}`)}
              </Typography>
              {activity.details && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  {activity.details}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: { xs: "block", sm: "none" }, mt: 1 }}
              >
                {new Date(activity.timestamp).toLocaleString()}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default UserActivityTimeline;
