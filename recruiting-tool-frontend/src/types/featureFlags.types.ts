/**
 * A feature flag record returned by GET /admin/feature-flags
 */
export interface FeatureFlagRecord {
  uid: string;
  key: string; // "ai_screening" | "bulk_import" | "advanced_analytics" | "custom_branding" | "api_access" | "priority_support"
  planType: string; // "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
  enabled: boolean;
  description?: string;
  updatedAt: string;
}

/**
 * DTO for PATCH /admin/feature-flags/:uid
 */
export interface UpdateFeatureFlagDto {
  enabled: boolean;
}
