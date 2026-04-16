import api from "./axios";
import {
  CompareCandidatesRequest,
  CompareCandidatesResponse,
  RankedCandidateDto,
  RankingsResponseDto,
  CandidateScoreResponseDto,
  ScoringWeightsResponse,
  UpdateScoringWeightsPayload,
} from "../types/ai-ranking";

/**
 * AI API endpoints for candidate comparison and analysis
 */

/**
 * Compare multiple candidates (2-5) for a job position using AI
 */
export const compareCandidates = async (
  data: CompareCandidatesRequest,
): Promise<CompareCandidatesResponse> => {
  const response = await api.post<CompareCandidatesResponse>(
    "/ai/compare-candidates",
    data,
  );
  return response.data;
};

/**
 * Get AI rankings for all candidates of a job position.
 * The backend returns a wrapper object; we extract the rankedCandidates array.
 */
export const getRankings = async (
  jobPositionUid: string,
): Promise<RankedCandidateDto[]> => {
  const response = await api.get<RankingsResponseDto>(
    `/ai/rankings/${jobPositionUid}`,
  );
  return response.data.rankedCandidates;
};

/**
 * Score a candidate for a job position using AI
 */
export const scoreCandidate = async (data: {
  candidateUid: string;
  jobPositionUid: string;
}): Promise<CandidateScoreResponseDto> => {
  const response = await api.post<CandidateScoreResponseDto>(
    "/ai/score-candidate",
    data,
  );
  return response.data;
};

/**
 * Get the company AI scoring weights
 */
export const getScoringWeights = (): Promise<ScoringWeightsResponse> =>
  api.get<ScoringWeightsResponse>("/ai/scoring-weights").then((r) => r.data);

/**
 * Update the company AI scoring weights (must sum to 100)
 */
export const updateScoringWeights = (
  data: UpdateScoringWeightsPayload,
): Promise<ScoringWeightsResponse> =>
  api
    .put<ScoringWeightsResponse>("/ai/scoring-weights", data)
    .then((r) => r.data);
