/**
 * AI Ranking Service
 *
 * Mock service for AI-powered candidate scoring and ranking.
 * In production, this would connect to a real AI backend service.
 */

import {
  CandidateScore,
  getScoreTier,
  ScoreBreakdown,
} from "../types/ai-ranking";

/**
 * Generate mock score breakdown with realistic variation
 */
function generateMockBreakdown(): ScoreBreakdown {
  return {
    skillsMatch: Math.floor(Math.random() * 40) + 60, // 60-100
    experienceMatch: Math.floor(Math.random() * 40) + 55, // 55-95
    educationMatch: Math.floor(Math.random() * 40) + 50, // 50-90
    locationMatch: Math.floor(Math.random() * 50) + 40, // 40-90
    availability: Math.floor(Math.random() * 40) + 60, // 60-100
  };
}

/**
 * Calculate overall score from breakdown (weighted average)
 */
function calculateOverallScore(breakdown: ScoreBreakdown): number {
  // Weighted scoring: skills and experience are more important
  const weights = {
    skillsMatch: 0.35,
    experienceMatch: 0.3,
    educationMatch: 0.15,
    locationMatch: 0.1,
    availability: 0.1,
  };

  const weighted =
    breakdown.skillsMatch * weights.skillsMatch +
    breakdown.experienceMatch * weights.experienceMatch +
    breakdown.educationMatch * weights.educationMatch +
    breakdown.locationMatch * weights.locationMatch +
    breakdown.availability * weights.availability;

  return Math.round(weighted);
}

/**
 * Generate mock candidate score
 */
function generateMockScore(
  candidateUid: string,
  candidateName: string,
  candidateEmail: string,
  jobPositionUid: string,
): CandidateScore {
  const breakdown = generateMockBreakdown();
  const overallScore = calculateOverallScore(breakdown);
  const scoreTier = getScoreTier(overallScore);

  return {
    candidateUid,
    candidateName,
    candidateEmail,
    jobPositionUid,
    overallScore,
    scoreTier,
    breakdown,
    scoredAt: new Date().toISOString(),
  };
}

/**
 * Mock database of candidate scores
 * In production, this would be fetched from backend API
 */
const mockScoresCache: Map<string, CandidateScore[]> = new Map();

/**
 * Get AI scores for all candidates for a specific job position
 *
 * @param jobPositionUid - Job position UID
 * @returns Promise resolving to array of candidate scores, sorted by overall score (descending)
 */
export async function getCandidateScores(
  jobPositionUid: string,
): Promise<CandidateScore[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check cache
  if (mockScoresCache.has(jobPositionUid)) {
    return mockScoresCache.get(jobPositionUid)!;
  }

  // Generate mock scores (in production, fetch from API)
  const mockCandidates = [
    { uid: "cand-001", name: "Sarah Johnson", email: "sarah.j@example.com" },
    { uid: "cand-002", name: "Michael Chen", email: "michael.c@example.com" },
    { uid: "cand-003", name: "Emily Rodriguez", email: "emily.r@example.com" },
    { uid: "cand-004", name: "James Anderson", email: "james.a@example.com" },
    { uid: "cand-005", name: "Lisa Thompson", email: "lisa.t@example.com" },
    { uid: "cand-006", name: "David Martinez", email: "david.m@example.com" },
    { uid: "cand-007", name: "Jessica Lee", email: "jessica.l@example.com" },
    { uid: "cand-008", name: "Robert Wilson", email: "robert.w@example.com" },
  ];

  const scores = mockCandidates
    .map((candidate) =>
      generateMockScore(
        candidate.uid,
        candidate.name,
        candidate.email,
        jobPositionUid,
      ),
    )
    .sort((a, b) => b.overallScore - a.overallScore); // Sort by score descending

  // Cache results
  mockScoresCache.set(jobPositionUid, scores);

  return scores;
}

/**
 * Get AI score for a specific candidate and job position
 *
 * @param candidateUid - Candidate UID
 * @param jobPositionUid - Job position UID
 * @returns Promise resolving to candidate score or null if not found
 */
export async function getCandidateScore(
  candidateUid: string,
  jobPositionUid: string,
): Promise<CandidateScore | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Get all scores for job position
  const scores = await getCandidateScores(jobPositionUid);

  // Find specific candidate score
  return scores.find((score) => score.candidateUid === candidateUid) || null;
}

/**
 * Clear mock cache (for testing purposes)
 */
export function clearMockCache(): void {
  mockScoresCache.clear();
}
