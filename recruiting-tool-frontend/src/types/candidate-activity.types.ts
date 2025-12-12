export enum CandidateActivityType {
  CREATED = "CREATED",
  STAGE_CHANGED = "STAGE_CHANGED",
  STATUS_CHANGED = "STATUS_CHANGED",
  INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
  INTERVIEW_UPDATED = "INTERVIEW_UPDATED",
  INTERVIEW_CANCELLED = "INTERVIEW_CANCELLED",
  INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
  NOTE_ADDED = "NOTE_ADDED",
  APPLICATION_RECEIVED = "APPLICATION_RECEIVED",
  EMAIL_SENT = "EMAIL_SENT",
}

export interface CandidateActivity {
  uid: string;
  candidateUid: string;
  type: CandidateActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  userUid?: string | null;
  userName?: string | null;
  createdAt: string;
}
