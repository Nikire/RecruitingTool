import api from "./axios";
import type {
  FeatureFlagRecord,
  UpdateFeatureFlagDto,
} from "../types/featureFlags.types";

/**
 * Fetch all feature flag records (SUPER_ADMIN only)
 * @param planType - optional filter by plan type (FREE | STARTER | PROFESSIONAL | ENTERPRISE)
 */
export function getFeatureFlags(
  planType?: string,
): Promise<FeatureFlagRecord[]> {
  const params = planType ? { planType } : undefined;
  return api
    .get("/admin/feature-flags", { params })
    .then((res) => res.data.featureFlags);
}

/**
 * Toggle a feature flag enabled/disabled (SUPER_ADMIN only)
 */
export function updateFeatureFlag(
  uid: string,
  dto: UpdateFeatureFlagDto,
): Promise<FeatureFlagRecord> {
  return api.patch(`/admin/feature-flags/${uid}`, dto).then((res) => res.data);
}
