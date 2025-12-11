import axiosInstance from "./axios";
import {
  EmailTemplate,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  PreviewEmailTemplateDto,
  PreviewEmailTemplateResponse,
} from "../types/emailTemplate.types";

export const getEmailTemplates = async (
  companyUid?: string,
): Promise<EmailTemplate[]> => {
  const response = await axiosInstance.get("/email-templates", {
    params: companyUid ? { companyUid } : {},
  });
  return response.data;
};

export const getEmailTemplate = async (uid: string): Promise<EmailTemplate> => {
  const response = await axiosInstance.get(`/email-templates/${uid}`);
  return response.data;
};

export const createEmailTemplate = async (
  data: CreateEmailTemplateDto,
): Promise<EmailTemplate> => {
  const response = await axiosInstance.post("/email-templates", data);
  return response.data;
};

export const updateEmailTemplate = async (
  uid: string,
  data: UpdateEmailTemplateDto,
): Promise<EmailTemplate> => {
  const response = await axiosInstance.put(`/email-templates/${uid}`, data);
  return response.data;
};

export const deleteEmailTemplate = async (uid: string): Promise<void> => {
  await axiosInstance.delete(`/email-templates/${uid}`);
};

export const previewEmailTemplate = async (
  uid: string,
  data?: PreviewEmailTemplateDto,
): Promise<PreviewEmailTemplateResponse> => {
  const response = await axiosInstance.post(
    `/email-templates/${uid}/preview`,
    data || {},
  );
  return response.data;
};
