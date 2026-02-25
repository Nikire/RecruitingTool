import { useQuery } from "@tanstack/react-query";
import { getPlanLimits } from "../../api/quota";
import { PlanLimitsMap } from "../../types/subscription.types";

const PLAN_LIMITS_KEY = "planLimits";

/**
 * Hook to fetch plan limits for all subscription tiers.
 *
 * Calls the public endpoint GET /quota/plan-limits — no authentication required.
 * Plan limits rarely change so data is considered fresh for 1 hour.
 *
 * @returns React Query result with data typed as PlanLimitsMap | undefined
 */
export function usePlanLimits(): ReturnType<
  typeof useQuery<PlanLimitsMap | undefined>
> {
  return useQuery<PlanLimitsMap | undefined>({
    queryKey: [PLAN_LIMITS_KEY],
    queryFn: async () => {
      const response = await getPlanLimits();
      return response.plans;
    },
    staleTime: 1000 * 60 * 60, // 1 hour — plan limits rarely change
  });
}
