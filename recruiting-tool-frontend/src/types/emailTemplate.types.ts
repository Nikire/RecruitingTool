export interface EmailTemplate {
  uid: string;
  name: string;
  subject: string;
  body: string;
  companyUid: string | null;
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
  isDefault?: boolean;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isDefault?: boolean;
}

export interface PreviewEmailTemplateDto {
  variables?: Record<string, any>;
}

export interface PreviewEmailTemplateResponse {
  renderedSubject: string;
  renderedBody: string;
}
