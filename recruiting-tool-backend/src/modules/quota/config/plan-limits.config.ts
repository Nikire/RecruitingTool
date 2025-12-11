import { SubscriptionPlan } from '@prisma/client';

export interface PlanLimits {
  maxJobPositions: number; // -1 means unlimited
  maxCandidatesPerPosition: number;
  maxUsers: number;
  maxStorageMB: number;
  aiScoringEnabled: boolean;
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    maxJobPositions: 3,
    maxCandidatesPerPosition: 50,
    maxUsers: 2,
    maxStorageMB: 100,
    aiScoringEnabled: false,
    emailTemplatesEnabled: false,
    analyticsEnabled: false,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxJobPositions: 25,
    maxCandidatesPerPosition: 500,
    maxUsers: 10,
    maxStorageMB: 5000,
    aiScoringEnabled: true,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxJobPositions: -1, // unlimited
    maxCandidatesPerPosition: -1,
    maxUsers: -1,
    maxStorageMB: -1,
    aiScoringEnabled: true,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
};

export type QuotaResource = 'jobPositions' | 'candidates' | 'users' | 'storage' | 'aiScoring' | 'emailTemplates' | 'analytics';
