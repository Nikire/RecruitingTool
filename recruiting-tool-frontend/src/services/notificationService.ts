import api from "../api/axios";
import {
  Notification,
  CreateNotificationDto,
  GetNotificationsQuery,
} from "../types/notification";

const BASE_URL = "/notifications";

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(
    query?: GetNotificationsQuery,
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (query?.isRead !== undefined) {
      params.append("isRead", String(query.isRead));
    }
    if (query?.limit) {
      params.append("limit", String(query.limit));
    }
    if (query?.skip) {
      params.append("skip", String(query.skip));
    }

    const response = await api.get<Notification[]>(
      `${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`,
    );
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>(
      `${BASE_URL}/unread-count`,
    );
    return response.data.count;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(uid: string): Promise<Notification> {
    const response = await api.patch<Notification>(`${BASE_URL}/${uid}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await api.patch<{ count: number }>(`${BASE_URL}/read-all`);
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(uid: string): Promise<void> {
    await api.delete(`${BASE_URL}/${uid}`);
  },

  /**
   * Create a notification (admin use)
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const response = await api.post<Notification>(BASE_URL, dto);
    return response.data;
  },
};
