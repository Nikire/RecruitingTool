/**
 * TypeScript types for custom plans — mirrors backend CustomPlanResponseDto
 */

export interface CustomPlanRecord {
  uid: string;
  name: string;
  isCustom: boolean;
  companyUid: string | null;
  companyName: string | null;
  maxUsers: number;
  maxJobPositions: number;
  maxCandidatesPerPosition: number;
  maxStorageMB: number;
  aiScoringCreditsPerMonth: number;
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  stripeAnnualPriceId: string | null;
  monthlyPaymentLink: string | null;
  annualPaymentLink: string | null;
  stripeIsTestMode: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPlanListResponse {
  customPlans: CustomPlanRecord[];
}

export interface CreateCustomPlanDto {
  name: string;
  companyUid?: string;
  maxUsers?: number;
  maxJobPositions?: number;
  maxCandidatesPerPosition?: number;
  maxStorageMB?: number;
  aiScoringCreditsPerMonth?: number;
  emailTemplatesEnabled?: boolean;
  analyticsEnabled?: boolean;
  monthlyPrice?: number;
  annualPrice?: number;
  currency?: string;
}

export interface UpdateCustomPlanDto {
  name?: string;
  maxUsers?: number;
  maxJobPositions?: number;
  maxCandidatesPerPosition?: number;
  maxStorageMB?: number;
  aiScoringCreditsPerMonth?: number;
  emailTemplatesEnabled?: boolean;
  analyticsEnabled?: boolean;
  monthlyPrice?: number;
  annualPrice?: number;
  currency?: string;
}

export interface StripeSyncResponse {
  customPlan: CustomPlanRecord;
  stripeProductId: string;
  stripePriceId: string;
  stripeAnnualPriceId: string;
  monthlyPaymentLink: string;
  annualPaymentLink: string;
  isTestMode: boolean;
}

export interface StripeConfigResponse {
  stripeEnabled: boolean;
  isTestMode: boolean;
}
