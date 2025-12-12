/**
 * NotificationPreferences Type
 * Represents user notification preferences for email and in-app notifications
 */
export interface NotificationPreferences {
  uid: string;
  userUid: string;

  // Email preferences
  emailApplicationStatus: boolean;
  emailInterviewScheduled: boolean;
  emailNewCandidate: boolean;
  emailSystemAnnouncement: boolean;

  // In-app preferences
  inAppApplicationStatus: boolean;
  inAppInterviewScheduled: boolean;
  inAppNewCandidate: boolean;
  inAppSystemAnnouncement: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * UpdateNotificationPreferences DTO
 * Data transfer object for updating notification preferences
 * All fields are optional to allow partial updates
 */
export interface UpdateNotificationPreferencesDto {
  // Email preferences
  emailApplicationStatus?: boolean;
  emailInterviewScheduled?: boolean;
  emailNewCandidate?: boolean;
  emailSystemAnnouncement?: boolean;

  // In-app preferences
  inAppApplicationStatus?: boolean;
  inAppInterviewScheduled?: boolean;
  inAppNewCandidate?: boolean;
  inAppSystemAnnouncement?: boolean;
}
