import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as aiApi from "../../api/ai";
import {
  CompareCandidatesRequest,
  CompareCandidatesResponse,
  RankedCandidateDto,
  CandidateScoreResponseDto,
} from "../../types/ai-ranking";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const AI_RANKINGS_KEY = "aiRankings";

/**
 * Hook to compare multiple candidates for a job position using AI
 */
export const useCompareCandidates = () => {
  const { t } = useTranslation();

  return useMutation<
    CompareCandidatesResponse,
    Error,
    CompareCandidatesRequest
  >({
    mutationFn: aiApi.compareCandidates,
    onSuccess: () => {
      showSuccessToast(t("candidates.comparison_success"));
    },
    onError: (error) => {
      console.error("Candidate comparison failed:", error);
      showErrorToast(error, t("errors.comparison_failed"));
    },
  });
};

/**
 * Hook to get AI rankings for all candidates of a job position
 */
export const useRankings = (jobPositionUid: string | undefined) => {
  return useQuery<RankedCandidateDto[], Error>({
    queryKey: [AI_RANKINGS_KEY, jobPositionUid],
    queryFn: () => aiApi.getRankings(jobPositionUid!),
    enabled: !!jobPositionUid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to score a candidate for a job position using AI
 */
export const useScoreCandidate = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation<
    CandidateScoreResponseDto,
    Error,
    { candidateUid: string; jobPositionUid: string }
  >({
    mutationFn: aiApi.scoreCandidate,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [AI_RANKINGS_KEY, vars.jobPositionUid],
      });
      showSuccessToast(t("ai_scoring.scored_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("ai_scoring.scored_error"));
    },
  });
};
