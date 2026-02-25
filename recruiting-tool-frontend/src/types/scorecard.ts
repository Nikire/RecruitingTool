/**
 * Scorecard Types
 * Types for interview scorecard templates and submissions
 */

export interface ScorecardTemplate {
  uid: string;
  name: string;
  description?: string;
  categories: ScorecardCategory[];
  createdAt: string;
  updatedAt?: string;
  createdByUid?: string;
  createdByName?: string;
}

export interface ScorecardCategory {
  uid: string;
  name: string;
  weight: number; // 0-100 (percentage of total score)
  criteria: ScorecardCriterion[];
}

export interface ScorecardCriterion {
  uid: string;
  name: string;
  description?: string;
  maxScore: number; // Usually 1-5 or 1-10
}

export interface ScorecardSubmission {
  uid: string;
  templateUid: string;
  templateName?: string;
  interviewUid: string;
  evaluatorUid: string;
  evaluatorName: string;
  scores: CriterionScore[];
  overallScore: number;
  notes?: string;
  submittedAt: string;
}

export interface CriterionScore {
  criterionUid: string;
  criterionName?: string;
  categoryUid?: string;
  categoryName?: string;
  score: number;
  notes?: string;
}

// DTOs for creating/updating
export interface CreateScorecardTemplateDto {
  name: string;
  description?: string;
  categories: CreateCategoryDto[];
}

export interface CreateCategoryDto {
  name: string;
  weight: number;
  criteria: CreateCriterionDto[];
}

export interface CreateCriterionDto {
  name: string;
  description?: string;
  maxScore: number;
  /** Temporary ID used for client-side identification before persistence */
  tempId?: string;
}

export interface SubmitScorecardDto {
  templateUid: string;
  interviewUid: string;
  scores: CriterionScoreDto[];
  notes?: string;
}

export interface CriterionScoreDto {
  criterionUid: string;
  score: number;
  notes?: string;
}

export interface UpdateScorecardTemplateDto {
  name?: string;
  description?: string;
  categories?: CreateCategoryDto[];
}
