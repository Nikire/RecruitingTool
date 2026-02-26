/**
 * A plan limit record returned by GET /admin/plan-limits
 * Field names match the backend PlanLimitResponseDto exactly.
 */
export interface PlanLimitRecord {
  uid: string;
  planType: string; // "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
  maxJobPositions: number;
  maxCandidatesPerPosition: number; // -1 means unlimited
  maxUsers: number;
  maxStorageMB: number; // in MB, -1 means unlimited
  aiScoringEnabled: boolean;
  aiScoringCreditsPerMonth: number; // -1 = unlimited, 0 = disabled
  emailTemplatesEnabled: boolean;
  analyticsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for PATCH /admin/plan-limits/:uid
 * All fields are optional (partial update)
 */
export interface UpdatePlanLimitDto {
  maxJobPositions?: number;
  maxCandidatesPerPosition?: number;
  maxUsers?: number;
  maxStorageMB?: number;
  aiScoringEnabled?: boolean;
  aiScoringCreditsPerMonth?: number;
  emailTemplatesEnabled?: boolean;
  analyticsEnabled?: boolean;
}
