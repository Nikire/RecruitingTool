import axiosInstance from "./axios";
import {
  AsyncStageStatus,
  AsyncStageSubmissionResponse,
  AsyncStageTokenResponse,
  PublicAsyncStageInfo,
  ReviewSubmissionDto,
  SendAsyncInvitationDto,
} from "../types/asyncStage.types";

// ─── Protected (auth required) ───────────────────────────────────────────────

export const sendAsyncInvitation = async (
  dto: SendAsyncInvitationDto,
): Promise<AsyncStageTokenResponse> => {
  const response = await axiosInstance.post("/async-stage/send", dto);
  return response.data;
};

export const getAsyncStageStatus = async (
  stageUid: string,
  hiringProcessUid: string,
): Promise<AsyncStageStatus> => {
  const response = await axiosInstance.get(
    `/async-stage/stage/${stageUid}/process/${hiringProcessUid}`,
  );
  return response.data;
};

export const getAsyncSubmission = async (
  submissionUid: string,
): Promise<AsyncStageSubmissionResponse> => {
  const response = await axiosInstance.get(
    `/async-stage/submission/${submissionUid}`,
  );
  return response.data;
};

export const reviewSubmission = async (
  submissionUid: string,
  dto: ReviewSubmissionDto,
): Promise<AsyncStageSubmissionResponse> => {
  const response = await axiosInstance.patch(
    `/async-stage/submission/${submissionUid}/review`,
    dto,
  );
  return response.data;
};

export const revokeAsyncToken = async (
  tokenUid: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/async-stage/token/${tokenUid}`);
  return response.data;
};

// ─── Public (no auth) ────────────────────────────────────────────────────────

export const getPublicAsyncStageInfo = async (
  token: string,
): Promise<PublicAsyncStageInfo> => {
  const response = await axiosInstance.get(`/public/async-stage/${token}`);
  return response.data;
};

export const submitAsyncStage = async (
  token: string,
  formData: FormData,
): Promise<{ message: string }> => {
  const response = await axiosInstance.post(
    `/public/async-stage/${token}/submit`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const getPublicFileDownloadUrl = async (
  token: string,
  fileUid: string,
): Promise<string> => {
  const response = await axiosInstance.get(
    `/public/async-stage/${token}/files/${fileUid}/download`,
  );
  return response.data as string;
};
