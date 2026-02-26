/**
 * A plan limit record returned by GET /admin/plan-limits
 */
export interface PlanLimitRecord {
  uid: string;
  planType: string; // "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
  maxJobPositions: number;
  maxCandidates: number; // maxCandidatesPerPosition in DB
  maxUsers: number;
  maxStorage: number; // in MB
  maxEmailsPerMonth: number;
  aiEnabled: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for PATCH /admin/plan-limits/:uid
 * All fields are optional (partial update)
 */
export interface UpdatePlanLimitDto {
  maxJobPositions?: number;
  maxCandidates?: number;
  maxUsers?: number;
  maxStorage?: number;
  maxEmailsPerMonth?: number;
  aiEnabled?: boolean;
  customBranding?: boolean;
  apiAccess?: boolean;
}
