import api from "./axios";
import { PlanLimitsMap } from "../types/subscription.types";

/**
 * Fetch plan limits for all subscription tiers (public endpoint, no auth required)
 */
export function getPlanLimits(): Promise<{ plans: PlanLimitsMap }> {
  return api.get("/quota/plan-limits").then((res) => res.data);
}
