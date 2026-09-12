import api from "../api/axios";
import {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types/notification-preferences.types";

/**
 * Get notification preferences for the current user
 */
export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const response = await api.get<NotificationPreferences>(
      "/notification-preferences",
    );
    return response.data;
  };

/**
 * Update notification preferences for the current user
 */
export const updateNotificationPreferences = async (
  data: UpdateNotificationPreferencesDto,
): Promise<NotificationPreferences> => {
  const response = await api.patch<NotificationPreferences>(
    "/notification-preferences",
    data,
  );
  return response.data;
};
