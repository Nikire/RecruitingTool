import React from 'react';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import { NotificationType, Notification } from '../types/notification';

/**
 * Get icon for notification type
 */
export const getNotificationIcon = (type: NotificationType): JSX.Element => {
  switch (type) {
    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_CANCELLED:
      return <EventIcon />;
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_STATUS:
      return <DescriptionIcon />;
    case NotificationType.SYSTEM:
    default:
      return <InfoIcon />;
  }
};

/**
 * Get color for notification type
 */
export const getNotificationColor = (
  type: NotificationType
): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  switch (type) {
    case NotificationType.INTERVIEW_SCHEDULED:
      return 'success';
    case NotificationType.INTERVIEW_UPDATED:
      return 'info';
    case NotificationType.INTERVIEW_CANCELLED:
      return 'error';
    case NotificationType.APPLICATION_RECEIVED:
      return 'primary';
    case NotificationType.APPLICATION_STATUS:
      return 'secondary';
    case NotificationType.SYSTEM:
    default:
      return 'info';
  }
};

/**
 * Get navigation path for notification based on type and metadata
 */
export const getNotificationNavigationPath = (notification: Notification): string | null => {
  const { type, metadata } = notification;

  // If no metadata or no navigation data, return null
  if (!metadata) {
    return null;
  }

  switch (type) {
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_STATUS:
      // Navigate to applications page or specific application
      if (metadata.applicationUid) {
        return `/hr/applications?highlight=${metadata.applicationUid}`;
      }
      return '/hr/applications';

    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_CANCELLED:
      // Navigate to interviews page or specific interview
      if (metadata.interviewUid) {
        return `/hr/interviews?highlight=${metadata.interviewUid}`;
      }
      return '/hr/interviews';

    case NotificationType.SYSTEM:
    default:
      // Check for specific navigation hints in metadata
      if (metadata.navigationPath) {
        return metadata.navigationPath as string;
      }
      return null;
  }
};

/**
 * Check if notification is actionable (has navigation)
 */
export const isNotificationActionable = (notification: Notification): boolean => {
  return getNotificationNavigationPath(notification) !== null;
};
