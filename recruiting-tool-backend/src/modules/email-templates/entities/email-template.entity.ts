import { EmailTemplate, Company, User } from '@prisma/client';
import { EmailTemplateResponseDto } from '../dto/email-template.dto';

type EmailTemplateWithRelations = EmailTemplate & {
  company?: Company;
  createdBy?: User;
};

export const EmailTemplateMapper = (emailTemplate: EmailTemplateWithRelations): EmailTemplateResponseDto => {
  return {
    uid: emailTemplate.uid,
    name: emailTemplate.name,
    subject: emailTemplate.subject,
    body: emailTemplate.body,
    companyUid: emailTemplate.company?.uid || null,
    type: emailTemplate.type || null,
    createdByUid: emailTemplate.createdBy?.uid || '',
    createdByName: emailTemplate.createdBy?.name || '',
    isDefault: emailTemplate.isDefault,
    createdAt: emailTemplate.createdAt,
    updatedAt: emailTemplate.updatedAt,
  };
};
