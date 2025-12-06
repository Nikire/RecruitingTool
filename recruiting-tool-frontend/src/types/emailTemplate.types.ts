export enum EmailTemplateType {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_SHORTLISTED = 'APPLICATION_SHORTLISTED',
  INTERVIEW_INVITATION = 'INTERVIEW_INVITATION',
  INTERVIEW_REMINDER = 'INTERVIEW_REMINDER',
  OFFER_LETTER = 'OFFER_LETTER',
  CUSTOM = 'CUSTOM',
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
  variables?: Record<string, any>;
}

export interface PreviewEmailTemplateResponse {
  renderedSubject: string;
  renderedBody: string;
}
