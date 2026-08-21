import { adminPlanLimitKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getPlanLimits, updatePlanLimit } from "../../api/planLimits";
import type { UpdatePlanLimitDto } from "../../types/planLimits.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/**
 * Hook for fetching all plan limits from admin endpoint (SUPER_ADMIN only)
 */
export function useAdminPlanLimits() {
  return useQuery({
    queryKey: adminPlanLimitKeys.all,
    queryFn: getPlanLimits,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for partially updating a plan limit record (SUPER_ADMIN only)
 * Invalidates the adminPlanLimits query on success.
 */
export function useUpdatePlanLimit() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, dto }: { uid: string; dto: UpdatePlanLimitDto }) =>
      updatePlanLimit(uid, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanLimitKeys.all });
      showSuccessToast(t("plan_limits.save_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("plan_limits.save_error"));
    },
  });
}
