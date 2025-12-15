import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import * as aiApi from "../../api/ai";
import {
  CompareCandidatesRequest,
  CompareCandidatesResponse,
} from "../../types/ai-ranking";

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
      toast.success(t("candidates.comparison_success"));
    },
    onError: (error) => {
      console.error("Candidate comparison failed:", error);
      toast.error(error.message || t("errors.comparison_failed"));
    },
  });
};
