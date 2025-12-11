import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/notification-preferences.service";
import {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
} from "../types/notification-preferences.types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/**
 * Hook to fetch notification preferences for the current user
 */
export const useNotificationPreferences = () => {
  return useQuery<NotificationPreferences>({
    queryKey: ["notificationPreferences"],
    queryFn: getNotificationPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<
    NotificationPreferences,
    Error,
    UpdateNotificationPreferencesDto
  >({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      // Update cache with new preferences
      queryClient.setQueryData(["notificationPreferences"], data);
      toast.success(t("notificationPreferences.updated"));
    },
    onError: (error) => {
      console.error("Failed to update notification preferences:", error);
      toast.error(t("notificationPreferences.updateFailed"));
    },
  });
};
