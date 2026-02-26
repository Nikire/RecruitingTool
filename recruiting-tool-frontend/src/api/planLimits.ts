import api from "./axios";
import type { PlanLimitRecord, UpdatePlanLimitDto } from "../types/planLimits.types";

/**
 * Fetch all plan limit records (SUPER_ADMIN only)
 */
export function getPlanLimits(): Promise<PlanLimitRecord[]> {
  return api.get("/admin/plan-limits").then((res) => res.data);
}

/**
 * Partially update a plan limit record (SUPER_ADMIN only)
 */
export function updatePlanLimit(
  uid: string,
  dto: UpdatePlanLimitDto,
): Promise<PlanLimitRecord> {
  return api.patch(`/admin/plan-limits/${uid}`, dto).then((res) => res.data);
}
