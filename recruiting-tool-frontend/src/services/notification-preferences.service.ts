import axios from "axios";
import {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types/notification-preferences.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Get notification preferences for the current user
 */
export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const response = await axios.get<NotificationPreferences>(
      `${API_BASE_URL}/notification-preferences`,
    );
    return response.data;
  };

/**
 * Update notification preferences for the current user
 */
export const updateNotificationPreferences = async (
  data: UpdateNotificationPreferencesDto,
): Promise<NotificationPreferences> => {
  const response = await axios.patch<NotificationPreferences>(
    `${API_BASE_URL}/notification-preferences`,
    data,
  );
  return response.data;
};
