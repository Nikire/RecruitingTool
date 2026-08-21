import { systemSettingsKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getSystemSettings,
  updateSystemSettings,
  testEmailConnection,
  getEmailStats,
  getEmailLogs,
} from "../../api/systemSettings";
import { UpdateSystemSettingsDto } from "../../types/systemSettings.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/**
 * Hook for fetching system settings (SUPER_ADMIN only)
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: systemSettingsKeys.all,
    queryFn: getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes — settings don't change often
  });
}

/**
 * Hook for updating mutable system settings (SUPER_ADMIN only)
 * Invalidates the systemSettings query on success.
 */
export function useUpdateSystemSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateSystemSettingsDto) => updateSystemSettings(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.all });
      showSuccessToast(t("settings.update_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("settings.update_error"));
    },
  });
}

/**
 * Hook for fetching email sending statistics (SUPER_ADMIN only)
 */
export function useEmailStats() {
  return useQuery({
    queryKey: systemSettingsKeys.emailStats(),
    queryFn: getEmailStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching paginated email logs (SUPER_ADMIN only)
 */
export function useEmailLogs(params: {
  page?: number;
  limit?: number;
  status?: string;
  emailType?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: systemSettingsKeys.emailLogs(params),
    queryFn: () => getEmailLogs(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for sending a test email to the current SUPER_ADMIN user (SUPER_ADMIN only)
 */
export function useTestEmailConnection() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: testEmailConnection,
    onSuccess: (data) => {
      if (data.success) {
        showSuccessToast(t("settings.email_test_success"));
      } else {
        showErrorToast(data.message, t("settings.email_test_failed"));
      }
    },
    onError: (error) => {
      showErrorToast(error, t("settings.email_test_failed"));
    },
  });
}
