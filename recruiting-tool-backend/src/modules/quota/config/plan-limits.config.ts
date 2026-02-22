import { SubscriptionPlan } from '@prisma/client';

export interface PlanLimits {
  maxJobPositions: number; // -1 means unlimited
  maxCandidatesPerPosition: number;
  maxUsers: number;
  maxStorageMB: number;
  aiScoringEnabled: boolean;
  aiScoringCreditsPerMonth: number; // -1 = unlimited, 0 = disabled
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
}

/**
 * FREE plan uses Professional limits because it is a 14-day trial.
 * After the trial expires the subscription status becomes EXPIRED and users
 * are blocked from the app entirely, so the quota values are moot at that point.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    // Pro limits during the 14-day trial
    maxJobPositions: 25,
    maxCandidatesPerPosition: 300,
    maxUsers: 10,
    maxStorageMB: 5000,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 200,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxJobPositions: 25,
    maxCandidatesPerPosition: 300,
    maxUsers: 10,
    maxStorageMB: 5000,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 200,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxJobPositions: -1,
    maxCandidatesPerPosition: -1,
    maxUsers: -1,
    maxStorageMB: -1,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: -1,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
};

export type QuotaResource = 'jobPositions' | 'candidates' | 'users' | 'storage' | 'aiScoring' | 'aiScoringCredits' | 'emailTemplates' | 'analytics';
