export enum EmailTemplateType {
  APPLICATION_RECEIVED = "APPLICATION_RECEIVED",
  APPLICATION_UNDER_REVIEW = "APPLICATION_UNDER_REVIEW",
  APPLICATION_REJECTED = "APPLICATION_REJECTED",
  APPLICATION_SHORTLISTED = "APPLICATION_SHORTLISTED",
  APPLICATION_STATUS_UPDATE = "APPLICATION_STATUS_UPDATE",
  INTERVIEW_INVITATION = "INTERVIEW_INVITATION",
  INTERVIEW_REMINDER = "INTERVIEW_REMINDER",
  OFFER_LETTER = "OFFER_LETTER",
  ASYNC_STAGE_INVITATION = "ASYNC_STAGE_INVITATION",
  ASYNC_STAGE_SUBMISSION_RECEIVED = "ASYNC_STAGE_SUBMISSION_RECEIVED",
  CUSTOM = "CUSTOM",
  OUTREACH = "OUTREACH",
}

export interface EmailTemplate {
  uid: string;
  name: string;
  subject: string;
  body: string;
  companyUid: string | null;
  type: EmailTemplateType | null;
  createdByUid: string;
  createdByName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  subject: string;
  body: string;
  companyUid?: string; // Optional for system-wide templates
  type?: EmailTemplateType;
  isDefault?: boolean;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  type?: EmailTemplateType;
  isDefault?: boolean;
}

export interface PreviewEmailTemplateDto {
  variables?: Record<string, unknown>;
}

export interface PreviewEmailTemplateResponse {
  renderedSubject: string;
  renderedBody: string;
}
