import { adminPlanLimitKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getPlanLimits, updatePlanLimit } from "../../api/planLimits";
import type {
  PlanLimitRecord,
  UpdatePlanLimitDto,
} from "../../types/planLimits.types";
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
 * Applies the change optimistically so the edited field never flashes back to
 * its previous value while the PATCH + refetch round trip is in flight, then
 * rolls back on error and invalidates on success.
 */
export function useUpdatePlanLimit() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, dto }: { uid: string; dto: UpdatePlanLimitDto }) =>
      updatePlanLimit(uid, dto),
    onMutate: async ({
      uid,
      dto,
    }: {
      uid: string;
      dto: UpdatePlanLimitDto;
    }) => {
      await queryClient.cancelQueries({ queryKey: adminPlanLimitKeys.all });
      const previous = queryClient.getQueryData<PlanLimitRecord[]>(
        adminPlanLimitKeys.all,
      );
      if (previous) {
        queryClient.setQueryData<PlanLimitRecord[]>(
          adminPlanLimitKeys.all,
          previous.map((record) =>
            record.uid === uid ? { ...record, ...dto } : record,
          ),
        );
      }
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPlanLimitKeys.all });
      showSuccessToast(t("plan_limits.save_success"));
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(adminPlanLimitKeys.all, context.previous);
      }
      showErrorToast(error, t("plan_limits.save_error"));
    },
  });
}
