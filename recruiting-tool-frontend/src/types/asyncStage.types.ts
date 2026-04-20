export interface AsyncStageTokenResponse {
  uid: string;
  stageUid: string;
  hiringProcessUid: string;
  candidateEmail: string;
  candidateName: string;
  expiresAt: string | null;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  submissionUrl: string;
}

export interface AsyncSubmissionFile {
  uid: string;
  originalName: string;
  size: number;
  mimetype: string;
  downloadUrl: string;
}

export interface AsyncStageSubmissionResponse {
  uid: string;
  stageUid: string;
  hiringProcessUid: string;
  textContent: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  hrNote: string | null;
  files: AsyncSubmissionFile[];
}

export interface AsyncStageStatus {
  token: AsyncStageTokenResponse | null;
  submission: AsyncStageSubmissionResponse | null;
}

export interface PublicAsyncStageInfo {
  stageTitle: string;
  stageDescription: string | null;
  jobTitle: string;
  companyName: string;
  expiresAt: string | null;
  alreadySubmitted: boolean;
}

export interface SendAsyncInvitationDto {
  stageUid: string;
  hiringProcessUid: string;
  deadline?: string; // ISO8601
}

export interface ReviewSubmissionDto {
  hrNote?: string;
}
