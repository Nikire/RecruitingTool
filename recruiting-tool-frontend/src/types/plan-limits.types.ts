/**
 * Re-exports PlanLimits from subscription.types for backward compatibility.
 *
 * The canonical PlanLimits definition lives in subscription.types.ts (issue #302).
 * Import directly from subscription.types.ts in new code.
 */
export type { PlanLimits, PlanLimitsMap } from "./subscription.types";
