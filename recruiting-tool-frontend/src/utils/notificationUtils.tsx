import { type ReactElement } from "react";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WorkIcon from "@mui/icons-material/Work";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { NotificationType, Notification } from "../types/notification";

/**
 * Get icon for notification type
 */
export const getNotificationIcon = (type: NotificationType): ReactElement => {
  switch (type) {
    // Interview notifications
    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_BOOKED_BY_CANDIDATE:
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_CANCELLED:
    case NotificationType.INTERVIEW_REMINDER_24H:
    case NotificationType.INTERVIEW_REMINDER_1H:
    case NotificationType.INTERVIEW_RESCHEDULED:
    case NotificationType.INTERVIEW_COMPLETED:
    case NotificationType.INTERVIEW_FEEDBACK_SUBMITTED:
      return <EventIcon />;

    // Application notifications
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_SUBMITTED:
    case NotificationType.APPLICATION_REVIEWED:
    case NotificationType.APPLICATION_STATUS:
      return <DescriptionIcon />;
    case NotificationType.APPLICATION_ACCEPTED:
      return <CheckCircleIcon />;
    case NotificationType.APPLICATION_REJECTED:
      return <CancelIcon />;

    // Hiring process notifications
    case NotificationType.HIRING_PROCESS_STARTED:
    case NotificationType.HIRING_PROCESS_STAGE_CHANGED:
    case NotificationType.HIRING_PROCESS_COMPLETED:
    case NotificationType.HIRING_PROCESS_OFFER_EXTENDED:
    case NotificationType.HIRING_PROCESS_OFFER_ACCEPTED:
    case NotificationType.HIRING_PROCESS_OFFER_REJECTED:
      return <WorkIcon />;

    // Candidate notifications
    case NotificationType.CANDIDATE_STAGE_ADVANCED:
    case NotificationType.CANDIDATE_STAGE_REJECTED:
    case NotificationType.CANDIDATE_ADDED_TO_PROCESS:
    case NotificationType.CANDIDATE_NOTE_ADDED:
    case NotificationType.CANDIDATE_SCORE_UPDATED:
      return <AssessmentIcon />;

    // Team management notifications
    case NotificationType.TEAM_INVITATION_SENT:
    case NotificationType.TEAM_INVITATION_REJECTED:
    case NotificationType.TEAM_INVITATION_EXPIRED:
      return <GroupAddIcon />;
    case NotificationType.TEAM_INVITATION_ACCEPTED:
    case NotificationType.TEAM_MEMBER_ADDED:
      return <PersonAddIcon />;
    case NotificationType.TEAM_MEMBER_REMOVED:
      return <CancelIcon />;

    // System notifications
    case NotificationType.SYSTEM:
    case NotificationType.SYSTEM_ANNOUNCEMENT:
    case NotificationType.SYSTEM_MAINTENANCE:
    default:
      return <InfoIcon />;
  }
};

/**
 * Get color for notification type
 */
export const getNotificationColor = (
  type: NotificationType,
): "primary" | "secondary" | "error" | "warning" | "info" | "success" => {
  switch (type) {
    // Interview notifications - success/info
    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_BOOKED_BY_CANDIDATE:
    case NotificationType.INTERVIEW_REMINDER_24H:
    case NotificationType.INTERVIEW_REMINDER_1H:
    case NotificationType.INTERVIEW_COMPLETED:
      return "success";
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_RESCHEDULED:
    case NotificationType.INTERVIEW_FEEDBACK_SUBMITTED:
      return "info";
    case NotificationType.INTERVIEW_CANCELLED:
      return "error";

    // Application notifications
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_SUBMITTED:
      return "primary";
    case NotificationType.APPLICATION_REVIEWED:
    case NotificationType.APPLICATION_STATUS:
      return "secondary";
    case NotificationType.APPLICATION_ACCEPTED:
      return "success";
    case NotificationType.APPLICATION_REJECTED:
      return "error";

    // Hiring process notifications
    case NotificationType.HIRING_PROCESS_STARTED:
    case NotificationType.HIRING_PROCESS_COMPLETED:
      return "success";
    case NotificationType.HIRING_PROCESS_STAGE_CHANGED:
      return "info";
    case NotificationType.HIRING_PROCESS_OFFER_EXTENDED:
    case NotificationType.HIRING_PROCESS_OFFER_ACCEPTED:
      return "success";
    case NotificationType.HIRING_PROCESS_OFFER_REJECTED:
      return "warning";

    // Candidate notifications
    case NotificationType.CANDIDATE_STAGE_ADVANCED:
    case NotificationType.CANDIDATE_ADDED_TO_PROCESS:
      return "success";
    case NotificationType.CANDIDATE_STAGE_REJECTED:
      return "error";
    case NotificationType.CANDIDATE_NOTE_ADDED:
    case NotificationType.CANDIDATE_SCORE_UPDATED:
      return "info";

    // Team management notifications
    case NotificationType.TEAM_INVITATION_SENT:
      return "primary";
    case NotificationType.TEAM_INVITATION_ACCEPTED:
    case NotificationType.TEAM_MEMBER_ADDED:
      return "success";
    case NotificationType.TEAM_INVITATION_REJECTED:
    case NotificationType.TEAM_MEMBER_REMOVED:
      return "warning";
    case NotificationType.TEAM_INVITATION_EXPIRED:
      return "error";

    // System notifications
    case NotificationType.SYSTEM:
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return "info";
    case NotificationType.SYSTEM_MAINTENANCE:
      return "warning";
    default:
      return "info";
  }
};

/**
 * Get navigation path for notification based on type and metadata
 */
export const getNotificationNavigationPath = (
  notification: Notification,
): string | null => {
  const { type, metadata } = notification;

  // If no metadata or no navigation data, return null
  if (!metadata) {
    return null;
  }

  switch (type) {
    // Application notifications
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_SUBMITTED:
    case NotificationType.APPLICATION_REVIEWED:
    case NotificationType.APPLICATION_ACCEPTED:
    case NotificationType.APPLICATION_REJECTED:
    case NotificationType.APPLICATION_STATUS:
      if (metadata.applicationUid) {
        return `/hr/applications?highlight=${metadata.applicationUid}`;
      }
      return "/hr/applications";

    // Candidate self-scheduled interview — navigate to the hiring process
    case NotificationType.INTERVIEW_BOOKED_BY_CANDIDATE:
      if (metadata.relatedEntityId) {
        return `/hiring-process/${metadata.relatedEntityId}`;
      }
      return "/hr/hiring-processes";

    // Interview notifications
    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_CANCELLED:
    case NotificationType.INTERVIEW_REMINDER_24H:
    case NotificationType.INTERVIEW_REMINDER_1H:
    case NotificationType.INTERVIEW_RESCHEDULED:
    case NotificationType.INTERVIEW_COMPLETED:
    case NotificationType.INTERVIEW_FEEDBACK_SUBMITTED:
      if (metadata.interviewUid) {
        return `/hr/interviews?highlight=${metadata.interviewUid}`;
      }
      return "/hr/interviews";

    // Hiring process notifications
    case NotificationType.HIRING_PROCESS_STARTED:
    case NotificationType.HIRING_PROCESS_STAGE_CHANGED:
    case NotificationType.HIRING_PROCESS_COMPLETED:
    case NotificationType.HIRING_PROCESS_OFFER_EXTENDED:
    case NotificationType.HIRING_PROCESS_OFFER_ACCEPTED:
    case NotificationType.HIRING_PROCESS_OFFER_REJECTED:
      if (metadata.hiringProcessUid) {
        return `/hr/hiring-processes?highlight=${metadata.hiringProcessUid}`;
      }
      return "/hr/hiring-processes";

    // Candidate notifications
    case NotificationType.CANDIDATE_STAGE_ADVANCED:
    case NotificationType.CANDIDATE_STAGE_REJECTED:
    case NotificationType.CANDIDATE_ADDED_TO_PROCESS:
    case NotificationType.CANDIDATE_NOTE_ADDED:
    case NotificationType.CANDIDATE_SCORE_UPDATED:
      if (metadata.candidateUid) {
        return `/hr/candidates?highlight=${metadata.candidateUid}`;
      }
      return "/hr/candidates";

    // Team invitation notifications - handled separately (no default navigation)
    case NotificationType.TEAM_INVITATION_SENT:
    case NotificationType.TEAM_INVITATION_ACCEPTED:
    case NotificationType.TEAM_INVITATION_REJECTED:
    case NotificationType.TEAM_INVITATION_EXPIRED:
    case NotificationType.TEAM_MEMBER_ADDED:
    case NotificationType.TEAM_MEMBER_REMOVED:
      // Team invitations are handled inline in NotificationsPage
      return null;

    // System notifications
    case NotificationType.SYSTEM:
    case NotificationType.SYSTEM_ANNOUNCEMENT:
    case NotificationType.SYSTEM_MAINTENANCE:
    default:
      if (metadata.navigationPath) {
        return metadata.navigationPath as string;
      }
      return null;
  }
};

/**
 * Check if notification is an actionable invitation
 */
export const isInvitationNotification = (
  notification: Notification,
): boolean => {
  return notification.type === NotificationType.TEAM_INVITATION_SENT;
};

/**
 * Get invitation token from notification metadata
 */
export const getInvitationToken = (
  notification: Notification,
): string | null => {
  if (!isInvitationNotification(notification)) {
    return null;
  }
  return (notification.metadata?.invitationToken as string) || null;
};

/**
 * Check if notification is actionable (has navigation)
 */
export const isNotificationActionable = (
  notification: Notification,
): boolean => {
  return getNotificationNavigationPath(notification) !== null;
};
