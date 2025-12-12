import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "../services/feedbackService";
import { CreateFeedbackDto, Feedback } from "../types/feedback";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const FEEDBACK_QUERY_KEY = "feedback";

/**
 * Hook to submit feedback
 */
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: CreateFeedbackDto) => feedbackService.createFeedback(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEEDBACK_QUERY_KEY] });
      toast.success(t("feedback.messages.submitted"));
    },
    onError: (error: unknown) => {
      console.error("Failed to submit feedback:", error);
      toast.error(t("feedback.messages.submit_failed"));
    },
  });
};

/**
 * Hook to get all feedback for company (admin only)
 */
export const useAllFeedback = () => {
  return useQuery<Feedback[], Error>({
    queryKey: [FEEDBACK_QUERY_KEY, "all"],
    queryFn: () => feedbackService.getAllFeedback(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get user's own feedback
 */
export const useMyFeedback = () => {
  return useQuery<Feedback[], Error>({
    queryKey: [FEEDBACK_QUERY_KEY, "my"],
    queryFn: () => feedbackService.getMyFeedback(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
