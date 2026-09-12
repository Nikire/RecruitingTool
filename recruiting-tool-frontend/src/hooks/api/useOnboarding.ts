import { authKeys, onboardingKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import i18n from "i18next";

export interface HROnboardingStatus {
  isOnboardingComplete: boolean;
  isProfileComplete: boolean;
  hasCompany: boolean;
  wasInvited: boolean;
  invitedByName?: string;
  nextStep: "complete_profile" | "dashboard";
}

export interface CompleteHROnboardingData {
  position?: string;
  department?: string;
  phoneNumber?: string;
  timezone?: string;
  bio?: string;
}

export interface HROnboardingCompleteResponse {
  message: string;
  isOnboardingComplete: boolean;
  redirectTo: string;
}

/**
 * Get HR onboarding status for current user
 */
export function useHROnboardingStatus() {
  return useQuery<HROnboardingStatus>({
    queryKey: onboardingKeys.hrStatus(),
    queryFn: async () => {
      const response = await axios.get("/users/onboarding/hr/status");
      return response.data;
    },
    retry: 1,
  });
}

/**
 * Complete HR onboarding
 */
export function useCompleteHROnboarding() {
  const queryClient = useQueryClient();

  return useMutation<
    HROnboardingCompleteResponse,
    Error,
    CompleteHROnboardingData
  >({
    mutationFn: async (data) => {
      const response = await axios.post("/users/onboarding/hr/complete", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate onboarding status
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.hrStatus(),
      });
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });

      // `data.message` is untranslated English prose from the API; the toast
      // must follow the UI language like every other user-facing string.
      showSuccessToast(i18n.t("hr_onboarding.toast.complete_success"));
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || i18n.t("hr_onboarding.toast.complete_failed");
      showErrorToast(message);
    },
  });
}
