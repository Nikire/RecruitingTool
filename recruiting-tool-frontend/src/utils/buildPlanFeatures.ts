import { TFunction } from "i18next";
import { PlanLimits } from "../types/subscription.types";

/**
 * Converts raw PlanLimits data into translated feature bullet strings.
 *
 * Uses -1 to denote unlimited values for numeric fields.
 * All returned strings use i18n keys from the `plan_features` namespace,
 * which supports {{count}} interpolation for dynamic plan limits.
 *
 * @param limits - The plan limits object from the subscription API.
 * @param t - The i18next translation function (from useTranslation()).
 * @returns An array of translated feature bullet strings.
 *
 * @example
 * const { t } = useTranslation();
 * const bullets = buildPlanFeatures({ maxJobPositions: 15, ... }, t);
 * // => ["Up to 15 active job positions", ...]
 */
export function buildPlanFeatures(limits: PlanLimits, t: TFunction): string[] {
  const features: string[] = [];

  // Job positions
  features.push(
    limits.maxJobPositions === -1
      ? t("plan_features.job_positions_unlimited")
      : t("plan_features.job_positions", { count: limits.maxJobPositions }),
  );

  // Candidates per position
  features.push(
    limits.maxCandidatesPerPosition === -1
      ? t("plan_features.candidates_unlimited")
      : t("plan_features.candidates_per_position", {
          count: limits.maxCandidatesPerPosition,
        }),
  );

  // Team members
  features.push(
    limits.maxUsers === -1
      ? t("plan_features.users_unlimited")
      : t("plan_features.users", { count: limits.maxUsers }),
  );

  // Storage
  if (limits.maxStorageMB === -1) {
    features.push(t("plan_features.storage_unlimited"));
  } else if (limits.maxStorageMB >= 1000) {
    features.push(
      t("plan_features.storage_gb", {
        count: Math.round(limits.maxStorageMB / 1000),
      }),
    );
  } else {
    features.push(t("plan_features.storage", { count: limits.maxStorageMB }));
  }

  // AI credits
  features.push(
    limits.aiScoringCreditsPerMonth === -1
      ? t("plan_features.ai_credits_unlimited")
      : t("plan_features.ai_credits", {
          count: limits.aiScoringCreditsPerMonth,
        }),
  );

  // Analytics
  features.push(
    limits.analyticsEnabled
      ? t("plan_features.analytics_enabled")
      : t("plan_features.analytics_disabled"),
  );

  // Email templates (optional — only shown if enabled)
  if (limits.emailTemplatesEnabled) {
    features.push(t("plan_features.email_templates"));
  }

  return features;
}
