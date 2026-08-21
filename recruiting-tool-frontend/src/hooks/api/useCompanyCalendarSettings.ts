import { companyCalendarSettingsKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyCalendarSettings {
  uid: string;
  isBookingEnabled: boolean;
  /** 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat */
  workingDays: number[];
  /** "HH:mm" e.g. "09:00" */
  workingHoursStart: string;
  /** "HH:mm" e.g. "18:00" */
  workingHoursEnd: string;
  bufferMinutes: number;
  /** Array of "YYYY-MM-DD" strings */
  blockedDates: string[];
  advanceBookingDays: number;
}

export type UpdateCompanyCalendarSettings = Partial<
  Omit<CompanyCalendarSettings, "uid">
>;

// ─── Query key ────────────────────────────────────────────────────────────────

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch the company's calendar & booking settings.
 */
export function useGetCompanyCalendarSettings() {
  return useQuery<CompanyCalendarSettings>({
    queryKey: companyCalendarSettingsKeys.all,
    queryFn: async () => {
      const response = await api.get<CompanyCalendarSettings>(
        "/company-calendar-settings",
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update the company's calendar & booking settings.
 * Invalidates the cached settings on success.
 */
export function useUpdateCompanyCalendarSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<
    CompanyCalendarSettings,
    Error,
    UpdateCompanyCalendarSettings
  >({
    mutationFn: async (data) => {
      const response = await api.put<CompanyCalendarSettings>(
        "/company-calendar-settings",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: companyCalendarSettingsKeys.all,
      });
      showSuccessToast(t("calendar_settings.save_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("errors.update_failed"));
    },
  });
}
