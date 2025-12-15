/**
 * AI Ranking Types
 *
 * Type definitions for AI-powered candidate scoring and ranking functionality.
 * This feature uses AI to evaluate candidates based on multiple factors.
 */

/**
 * Score tier classification based on overall score
 */
export type ScoreTier = "excellent" | "good" | "fair" | "poor";

/**
 * Breakdown of individual scoring factors
 * Each factor is scored from 0-100
 */
export interface ScoreBreakdown {
  skillsMatch: number; // How well candidate's skills match job requirements
  experienceMatch: number; // Relevance of work experience to position
  educationMatch: number; // Education level and field match
  locationMatch: number; // Proximity to job location or remote readiness
  availability: number; // Start date and schedule availability match
}

/**
 * Complete AI-generated candidate score for a specific job position
 */
export interface CandidateScore {
  candidateUid: string; // Unique identifier for candidate
  candidateName: string; // Candidate's full name
  candidateEmail: string; // Candidate's email address
  jobPositionUid: string; // Job position being evaluated for
  overallScore: number; // Aggregate score (0-100)
  scoreTier: ScoreTier; // Classification tier
  breakdown: ScoreBreakdown; // Detailed factor breakdown
  scoredAt: string; // ISO timestamp of when score was generated
}

/**
 * Helper function to determine score tier from overall score
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

/**
 * Helper function to get color for score tier
 */
export function getScoreTierColor(
  tier: ScoreTier,
): "success" | "primary" | "warning" | "error" {
  switch (tier) {
    case "excellent":
      return "success";
    case "good":
      return "primary";
    case "fair":
      return "warning";
    case "poor":
      return "error";
  }
}

/**
 * Candidate Comparison Types (AI Feature #243)
 */

/**
 * Request to compare multiple candidates
 */
export interface CompareCandidatesRequest {
  candidateUids: string[]; // 2-5 candidate UIDs to compare
  jobPositionUid: string; // Job position to compare against
}

/**
 * Individual candidate comparison summary
 */
export interface CandidateComparison {
  candidateUid: string;
  candidateName: string;
  overallScore: number; // 0-100
  skillsScore: number; // 0-100
  experienceScore: number; // 0-100
  educationScore: number; // 0-100
  strengths: string[]; // Key strengths identified by AI
  weaknesses: string[]; // Gaps or concerns identified by AI
  rank: number; // 1-based ranking (1 = best)
}

/**
 * AI-generated comparative analysis
 */
export interface ComparisonAnalysis {
  summary: string; // Overall comparison summary
  topCandidateUid: string; // UID of top-ranked candidate
  topCandidateName: string; // Name of top candidate
  recommendationReason: string; // Why top candidate is recommended
  keyDifferentiators: string[]; // Factors distinguishing candidates
  finalRecommendation: string; // Final hiring recommendation
}

/**
 * Complete comparison response from API
 */
export interface CompareCandidatesResponse {
  jobPositionUid: string;
  jobPositionTitle: string;
  totalCandidates: number;
  candidates: CandidateComparison[]; // Sorted by rank
  comparisonAnalysis: ComparisonAnalysis;
  comparedAt: string; // ISO timestamp
}
