export enum FeedbackCategory {
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
  GENERAL = "GENERAL",
}

export interface Feedback {
  uid: string;
  content: string;
  category: FeedbackCategory;
  rating?: number;
  userUid: string;
  userName: string;
  companyUid: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  content: string;
  category: FeedbackCategory;
  rating?: number;
}
