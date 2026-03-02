import api from "./axios";
import type {
  CustomPlanRecord,
  CreateCustomPlanDto,
  UpdateCustomPlanDto,
  StripeSyncResponse,
  StripeConfigResponse,
} from "../types/customPlans.types";

/**
 * Fetch all custom plans (SUPER_ADMIN only)
 */
export function getCustomPlans(): Promise<CustomPlanRecord[]> {
  return api.get("/admin/custom-plans").then((res) => res.data.customPlans);
}

/**
 * Fetch a single custom plan by UID (SUPER_ADMIN only)
 */
export function getCustomPlan(uid: string): Promise<CustomPlanRecord> {
  return api.get(`/admin/custom-plans/${uid}`).then((res) => res.data);
}

/**
 * Create a new custom plan (SUPER_ADMIN only)
 */
export function createCustomPlan(
  dto: CreateCustomPlanDto,
): Promise<CustomPlanRecord> {
  return api.post("/admin/custom-plans", dto).then((res) => res.data);
}

/**
 * Update a custom plan (SUPER_ADMIN only)
 */
export function updateCustomPlan(
  uid: string,
  dto: UpdateCustomPlanDto,
): Promise<CustomPlanRecord> {
  return api.patch(`/admin/custom-plans/${uid}`, dto).then((res) => res.data);
}

/**
 * Delete a custom plan (SUPER_ADMIN only)
 */
export function deleteCustomPlan(uid: string): Promise<void> {
  return api.delete(`/admin/custom-plans/${uid}`).then(() => undefined);
}

/**
 * Assign a custom plan to a company (SUPER_ADMIN only)
 */
export function assignCustomPlan(
  uid: string,
  companyUid: string,
): Promise<CustomPlanRecord> {
  return api
    .post(`/admin/custom-plans/${uid}/assign/${companyUid}`)
    .then((res) => res.data);
}

/**
 * Sync a custom plan to Stripe — creates product + prices + payment links (SUPER_ADMIN only)
 */
export function syncCustomPlanToStripe(
  uid: string,
): Promise<StripeSyncResponse> {
  return api
    .post(`/admin/custom-plans/${uid}/sync-stripe`)
    .then((res) => res.data);
}

/**
 * Get Stripe configuration — test/live mode detection (SUPER_ADMIN only)
 */
export function getStripeConfig(): Promise<StripeConfigResponse> {
  return api.get("/admin/custom-plans/stripe-config").then((res) => res.data);
}
