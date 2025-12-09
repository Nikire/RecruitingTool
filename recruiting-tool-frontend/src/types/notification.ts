export enum NotificationType {
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_UPDATED = 'INTERVIEW_UPDATED',
  INTERVIEW_CANCELLED = 'INTERVIEW_CANCELLED',
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_STATUS = 'APPLICATION_STATUS',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  uid: string;
  userUid: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
  readAt?: string | null;
}

export interface CreateNotificationDto {
  userUid: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface GetNotificationsQuery {
  isRead?: boolean;
  limit?: number;
  skip?: number;
}
