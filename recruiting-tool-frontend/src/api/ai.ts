import api from "./axios";
import {
  CompareCandidatesRequest,
  CompareCandidatesResponse,
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
