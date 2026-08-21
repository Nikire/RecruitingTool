import { interviewKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  createInterview,
  getInterview,
  getInterviewsByStage,
  updateInterview,
  cancelInterview,
  deleteInterview,
} from "../../api/interview";
import {
  CreateInterviewDto,
  UpdateInterviewDto,
} from "../../types/interview.types";

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateInterviewDto) => createInterview(data),
    onSuccess: () => {
      toast.success(t("success.interview_scheduled"));
      // Whole interviews root: the stage list, the company calendar and any
      // open interview detail all have to see the new interview.
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_schedule_failed"),
      );
    },
  });
};

export const useInterview = (uid: string) => {
  return useQuery({
    queryKey: interviewKeys.detail(uid),
    queryFn: () => getInterview(uid),
    enabled: !!uid,
  });
};

export const useInterviewsByStage = (stageUid: string) => {
  return useQuery({
    queryKey: interviewKeys.byStage(stageUid),
    queryFn: () => getInterviewsByStage(stageUid),
    enabled: !!stageUid,
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateInterviewDto }) =>
      updateInterview(uid, data),
    onSuccess: () => {
      toast.success(t("success.interview_updated"));
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_update_failed"),
      );
    },
  });
};

export const useCancelInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => cancelInterview(uid),
    onSuccess: () => {
      toast.success(t("success.interview_cancelled"));
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_cancel_failed"),
      );
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid }: { uid: string; stageUid: string }) =>
      deleteInterview(uid),
    onSuccess: () => {
      toast.success(t("success.interview_deleted"));
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_delete_failed"),
      );
    },
  });
};
