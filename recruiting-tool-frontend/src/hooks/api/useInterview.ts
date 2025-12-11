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
    onSuccess: (data) => {
      toast.success(t("success.interview_scheduled"));
      // Invalidate interviews for this stage
      queryClient.invalidateQueries({
        queryKey: ["interviews", "stage", data.stageUid],
      });
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
    queryKey: ["interview", uid],
    queryFn: () => getInterview(uid),
    enabled: !!uid,
  });
};

export const useInterviewsByStage = (stageUid: string) => {
  return useQuery({
    queryKey: ["interviews", "stage", stageUid],
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
    onSuccess: (data) => {
      toast.success(t("success.interview_updated"));
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["interview", data.uid] });
      queryClient.invalidateQueries({
        queryKey: ["interviews", "stage", data.stageUid],
      });
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
    onSuccess: (data) => {
      toast.success(t("success.interview_cancelled"));
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["interview", data.uid] });
      queryClient.invalidateQueries({
        queryKey: ["interviews", "stage", data.stageUid],
      });
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
    onSuccess: (_, variables) => {
      toast.success(t("success.interview_deleted"));
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["interviews", "stage", variables.stageUid],
      });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_delete_failed"),
      );
    },
  });
};
