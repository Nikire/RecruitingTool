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

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    maxJobPositions: 3,
    maxCandidatesPerPosition: 50,
    maxUsers: 3,
    maxStorageMB: 500,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 20,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxJobPositions: 15,
    maxCandidatesPerPosition: 200,
    maxUsers: 10,
    maxStorageMB: 10000,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 200,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxJobPositions: -1,
    maxCandidatesPerPosition: -1,
    maxUsers: -1,
    maxStorageMB: -1,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: -1,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
};

export type QuotaResource = 'jobPositions' | 'candidates' | 'users' | 'storage' | 'aiScoring' | 'aiScoringCredits' | 'emailTemplates' | 'analytics';
