export interface Interview {
  uid: string;
  stageUid: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  duration: number | null;
  status: InterviewStatus;
  meetingLink: string | null;
  notes: string | null;
  scheduledByUid: string;
  scheduledByName: string;
  createdAt: string;
  updatedAt: string;
}

export enum InterviewStatus {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CreateInterviewDto {
  stageUid: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateInterviewDto {
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  meetingLink?: string;
  notes?: string;
  status?: InterviewStatus;
}
