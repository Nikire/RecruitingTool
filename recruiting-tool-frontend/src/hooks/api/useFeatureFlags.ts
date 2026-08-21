import { featureFlagKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getFeatureFlags, updateFeatureFlag } from "../../api/featureFlags";
import type { UpdateFeatureFlagDto } from "../../types/featureFlags.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/**
 * Hook for fetching all feature flags from admin endpoint (SUPER_ADMIN only)
 * Optionally filter by planType (FREE | STARTER | PROFESSIONAL | ENTERPRISE)
 */
export function useFeatureFlags(planType?: string) {
  return useQuery({
    queryKey: featureFlagKeys.list(planType),
    queryFn: () => getFeatureFlags(planType),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for toggling a feature flag enabled state (SUPER_ADMIN only)
 * Invalidates the adminFeatureFlags query on success.
 */
export function useToggleFeatureFlag() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, dto }: { uid: string; dto: UpdateFeatureFlagDto }) =>
      updateFeatureFlag(uid, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all });
      showSuccessToast(t("feature_flags.toggle_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("feature_flags.toggle_error"));
    },
  });
}
