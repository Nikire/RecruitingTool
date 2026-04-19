export interface Stage {
  uid: string;
  title: string;
  type: StageType;
  description: string;
  position: number;
  status: StageStatus;
  estimatedTime: number;
  jobPositionUid?: string;
  hiringProcessUid?: string;
  note?: StageEvalNote | null;
}

export interface CreateStageDto {
  title: string;
  type: StageType;
  description: string;
  position: number;
  estimatedTime: number;
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
  SCREENING: "SCREENING",
  PHONE_SCREEN: "PHONE_SCREEN",
  HR_INTERVIEW: "HR_INTERVIEW",
  INTERVIEW: "INTERVIEW",
  TECHNICAL_INTERVIEW: "TECHNICAL_INTERVIEW",
  PANEL_INTERVIEW: "PANEL_INTERVIEW",
  GROUP_INTERVIEW: "GROUP_INTERVIEW",
  ONSITE_INTERVIEW: "ONSITE_INTERVIEW",
  FINAL_INTERVIEW: "FINAL_INTERVIEW",
  CASE_STUDY: "CASE_STUDY",
  TAKE_HOME_ASSIGNMENT: "TAKE_HOME_ASSIGNMENT",
  SKILLS_ASSESSMENT: "SKILLS_ASSESSMENT",
  PORTFOLIO_REVIEW: "PORTFOLIO_REVIEW",
  CULTURE_FIT: "CULTURE_FIT",
  BACKGROUND_CHECK: "BACKGROUND_CHECK",
  REFERENCE_CHECK: "REFERENCE_CHECK",
  SALARY_NEGOTIATION: "SALARY_NEGOTIATION",
  OFFER: "OFFER",
} as const;

export type StageType = (typeof STAGE_TYPE)[keyof typeof STAGE_TYPE];

export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  SCREENING: "Screening",
  PHONE_SCREEN: "Phone Screen",
  HR_INTERVIEW: "HR Interview",
  INTERVIEW: "Interview",
  TECHNICAL_INTERVIEW: "Technical Interview",
  PANEL_INTERVIEW: "Panel Interview",
  GROUP_INTERVIEW: "Group Interview",
  ONSITE_INTERVIEW: "Onsite Interview",
  FINAL_INTERVIEW: "Final Interview",
  CASE_STUDY: "Case Study",
  TAKE_HOME_ASSIGNMENT: "Take-Home Assignment",
  SKILLS_ASSESSMENT: "Skills Assessment",
  PORTFOLIO_REVIEW: "Portfolio Review",
  CULTURE_FIT: "Culture Fit",
  BACKGROUND_CHECK: "Background Check",
  REFERENCE_CHECK: "Reference Check",
  SALARY_NEGOTIATION: "Salary Negotiation",
  OFFER: "Offer",
};

export const STAGE_TYPE_ICONS: Record<StageType, string> = {
  SCREENING: "filter_list",
  PHONE_SCREEN: "phone",
  HR_INTERVIEW: "people",
  INTERVIEW: "person",
  TECHNICAL_INTERVIEW: "code",
  PANEL_INTERVIEW: "groups",
  GROUP_INTERVIEW: "group",
  ONSITE_INTERVIEW: "business",
  FINAL_INTERVIEW: "group",
  CASE_STUDY: "assignment",
  TAKE_HOME_ASSIGNMENT: "home_work",
  SKILLS_ASSESSMENT: "quiz",
  PORTFOLIO_REVIEW: "collections_bookmark",
  CULTURE_FIT: "favorite",
  BACKGROUND_CHECK: "verified_user",
  REFERENCE_CHECK: "contact_page",
  SALARY_NEGOTIATION: "attach_money",
  OFFER: "check_circle",
};

export const STAGE_TYPE_COLORS: Record<StageType, string> = {
  SCREENING: "#607D8B",
  PHONE_SCREEN: "#00BCD4",
  HR_INTERVIEW: "#3F51B5",
  INTERVIEW: "#2196F3",
  TECHNICAL_INTERVIEW: "#9C27B0",
  PANEL_INTERVIEW: "#673AB7",
  GROUP_INTERVIEW: "#5C6BC0",
  ONSITE_INTERVIEW: "#1565C0",
  FINAL_INTERVIEW: "#FF9800",
  CASE_STUDY: "#795548",
  TAKE_HOME_ASSIGNMENT: "#8D6E63",
  SKILLS_ASSESSMENT: "#FF5722",
  PORTFOLIO_REVIEW: "#E91E63",
  CULTURE_FIT: "#F44336",
  BACKGROUND_CHECK: "#009688",
  REFERENCE_CHECK: "#26A69A",
  SALARY_NEGOTIATION: "#388E3C",
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

// Stage Evaluation Note (per-stage, per-hiring-process note with rating)
export interface StageEvalNote {
  uid: string;
  content: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertStageEvalNoteDto {
  content: string;
  rating: number;
}

// Candidate stage evaluation notes (all notes across hiring processes)
export interface CandidateStageNote {
  uid: string;
  content: string;
  rating: number;
  stageUid: string;
  stageTitle: string;
  hiringProcessUid: string;
  hiringProcessTitle: string;
  author: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
