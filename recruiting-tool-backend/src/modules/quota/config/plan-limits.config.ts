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
 * THIS FILE IS THE RUNTIME SOURCE OF TRUTH.
 *
 * `QuotaService.getPlanLimits()` returns `PLAN_LIMITS` verbatim to the public
 * `GET /quota/plan-limits` endpoint, so these values drive both the pricing
 * card bullets on the landing page AND every quota enforcement check. The
 * `PlanLimit` database table seeded by `plan-limits.service.ts` backs only the
 * SUPER_ADMIN admin screen. If the two disagree, THIS FILE WINS at runtime —
 * so any tier change must be made here, and mirrored in `DEFAULT_PLAN_LIMITS`.
 *
 * Tier design (relaunch):
 *  - FREE is a permanent tier, not a trial. One active position, one seat, and
 *    a hosted careers page, so a company can publish a real job for $0. That is
 *    what feeds the indexed careers pages the SEO loop depends on. No AI
 *    scoring — that is the first thing worth paying for.
 *  - PROFESSIONAL and ENTERPRISE carry `maxUsers: -1` because the public
 *    pricing promise is "unlimited recruiters, we don't charge per seat". The
 *    landing page renders that line only for plans whose seat limit really is
 *    unlimited, so a cap here silently removes the claim from the card.
 *
 * AGENCY is deliberately absent: the Prisma `SubscriptionPlan` enum has no
 * AGENCY member, so it cannot be a key of this Record. It is sold as a
 * contact-sales card and its limits live only in `DEFAULT_PLAN_LIMITS`. Adding
 * it here requires the enum + a migration + a Dodo product first.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    maxJobPositions: 1,
    maxCandidatesPerPosition: 50,
    maxUsers: 1,
    maxStorageMB: 500,
    aiScoringEnabled: false,
    aiScoringCreditsPerMonth: 0,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    maxJobPositions: 15,
    maxCandidatesPerPosition: 200,
    maxUsers: -1,
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
