import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getPlanLimits, updatePlanLimit } from "../../api/planLimits";
import type { UpdatePlanLimitDto } from "../../types/planLimits.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const ADMIN_PLAN_LIMITS_KEY = "adminPlanLimits";

/**
 * Hook for fetching all plan limits from admin endpoint (SUPER_ADMIN only)
 */
export function useAdminPlanLimits() {
  return useQuery({
    queryKey: [ADMIN_PLAN_LIMITS_KEY],
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
      queryClient.invalidateQueries({ queryKey: [ADMIN_PLAN_LIMITS_KEY] });
      showSuccessToast(t("plan_limits.save_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("plan_limits.save_error"));
    },
  });
}
