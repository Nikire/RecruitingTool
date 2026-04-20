import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getAsyncStageStatus,
  getAsyncSubmission,
  getPublicAsyncStageInfo,
  reviewSubmission,
  revokeAsyncToken,
  sendAsyncInvitation,
  submitAsyncStage,
} from "../../api/asyncStage";
import {
  ReviewSubmissionDto,
  SendAsyncInvitationDto,
} from "../../types/asyncStage.types";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const ASYNC_STAGE_STATUS_KEY = "async-stage-status";
const ASYNC_SUBMISSION_KEY = "async-submission";
const PUBLIC_ASYNC_STAGE_KEY = "public-async-stage";

// ─── Protected hooks ─────────────────────────────────────────────────────────

export const useSendAsyncInvitation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: SendAsyncInvitationDto) => sendAsyncInvitation(dto),
    onSuccess: (_, variables) => {
      showSuccessToast(t("asyncStage.invitation_sent"));
      queryClient.invalidateQueries({
        queryKey: [
          ASYNC_STAGE_STATUS_KEY,
          variables.stageUid,
          variables.hiringProcessUid,
        ],
      });
    },
    onError: (error) => {
      showErrorToast(error, t("asyncStage.errors.invitation_failed"));
    },
  });
};

export const useAsyncStageStatus = (
  stageUid: string,
  hiringProcessUid: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: [ASYNC_STAGE_STATUS_KEY, stageUid, hiringProcessUid],
    queryFn: () => getAsyncStageStatus(stageUid, hiringProcessUid),
    enabled: enabled && !!stageUid && !!hiringProcessUid,
  });
};

export const useAsyncSubmission = (submissionUid: string | undefined) => {
  return useQuery({
    queryKey: [ASYNC_SUBMISSION_KEY, submissionUid],
    queryFn: () => getAsyncSubmission(submissionUid!),
    enabled: !!submissionUid,
  });
};

export const useReviewSubmission = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      submissionUid,
      dto,
    }: {
      submissionUid: string;
      dto: ReviewSubmissionDto;
    }) => reviewSubmission(submissionUid, dto),
    onSuccess: (data) => {
      showSuccessToast(t("asyncStage.review_saved"));
      queryClient.invalidateQueries({
        queryKey: [ASYNC_SUBMISSION_KEY, data.uid],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ASYNC_STAGE_STATUS_KEY,
          data.stageUid,
          data.hiringProcessUid,
        ],
      });
    },
    onError: (error) => {
      showErrorToast(error, t("asyncStage.errors.review_failed"));
    },
  });
};

export const useRevokeAsyncToken = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      tokenUid,
    }: {
      tokenUid: string;
      stageUid: string;
      hiringProcessUid: string;
    }) => revokeAsyncToken(tokenUid),
    onSuccess: (_, variables) => {
      showSuccessToast(t("asyncStage.token_revoked"));
      queryClient.invalidateQueries({
        queryKey: [
          ASYNC_STAGE_STATUS_KEY,
          variables.stageUid,
          variables.hiringProcessUid,
        ],
      });
    },
    onError: (error) => {
      showErrorToast(error, t("asyncStage.errors.revoke_failed"));
    },
  });
};

// ─── Public hooks (no auth required) ─────────────────────────────────────────

export const usePublicAsyncStageInfo = (token: string) => {
  return useQuery({
    queryKey: [PUBLIC_ASYNC_STAGE_KEY, token],
    queryFn: () => getPublicAsyncStageInfo(token),
    enabled: !!token,
  });
};

export const useSubmitAsyncStage = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ token, formData }: { token: string; formData: FormData }) =>
      submitAsyncStage(token, formData),
    onSuccess: () => {
      showSuccessToast(t("asyncStage.submission_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("asyncStage.errors.submission_failed"));
    },
  });
};
