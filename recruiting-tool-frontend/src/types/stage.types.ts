export interface Stage {
  uid: string;
  title: string;
  type: StageType;
  description: string;
  position: number;
  status: StageStatus;
  estimatedTime?: number;
  jobPositionUid?: string;
  hiringProcessUid?: string;
}

export interface CreateStageDto {
  title: string;
  type: StageType;
  description: string;
  position: number;
  estimatedTime?: number;
  jobPositionUid?: string;
  hiringProcessUid?: string;
}

export interface UpdateStageDto {
  title?: string;
  type?: StageType;
  description?: string;
  position?: number;
  status?: StageStatus;
  estimatedTime?: number;
}

export const STAGE_STATUS = {
  OPEN: "OPEN",
  CURRENT: "CURRENT",
  CANCELLED: "CANCELLED",
  DONE: "DONE",
} as const;

export type StageStatus = (typeof STAGE_STATUS)[keyof typeof STAGE_STATUS];

export const STAGE_TYPE = {
  INTERVIEW: "INTERVIEW",
  TECHNICAL_INTERVIEW: "TECHNICAL_INTERVIEW",
  FINAL_INTERVIEW: "FINAL_INTERVIEW",
  OFFER: "OFFER",
} as const;

export type StageType = (typeof STAGE_TYPE)[keyof typeof STAGE_TYPE];

export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  INTERVIEW: "Interview",
  TECHNICAL_INTERVIEW: "Technical Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer",
};

export const STAGE_TYPE_ICONS: Record<StageType, string> = {
  INTERVIEW: "person",
  TECHNICAL_INTERVIEW: "code",
  FINAL_INTERVIEW: "group",
  OFFER: "check_circle",
};

export const STAGE_TYPE_COLORS: Record<StageType, string> = {
  INTERVIEW: "#2196F3",
  TECHNICAL_INTERVIEW: "#9C27B0",
  FINAL_INTERVIEW: "#FF9800",
  OFFER: "#4CAF50",
};

// Stage Notes Types
export interface StageNoteAuthor {
  uid: string;
  name: string;
  email: string;
}

export interface StageNote {
  uid: string;
  content: string;
  stageUid: string;
  author: StageNoteAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStageNoteDto {
  content: string;
}

export interface UpdateStageNoteDto {
  content: string;
}
