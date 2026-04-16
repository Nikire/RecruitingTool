import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
} from "../../api/emailTemplates";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  PreviewEmailTemplateDto,
  EmailTemplate,
} from "../../types/emailTemplate.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const EMAIL_TEMPLATES_KEY = "email-templates";

export function useEmailTemplates(companyUid?: string) {
  return useQuery({
    queryKey: [EMAIL_TEMPLATES_KEY, companyUid],
    queryFn: () => getEmailTemplates(companyUid),
  });
}

export function useEmailTemplate(uid: string) {
  return useQuery({
    queryKey: [EMAIL_TEMPLATES_KEY, uid],
    queryFn: () => getEmailTemplate(uid),
    enabled: !!uid,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailTemplateDto) => createEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMAIL_TEMPLATES_KEY] });
      showSuccessToast("Email template created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create email template");
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      data,
    }: {
      uid: string;
      data: UpdateEmailTemplateDto;
    }) => updateEmailTemplate(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMAIL_TEMPLATES_KEY] });
      showSuccessToast("Email template updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update email template");
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteEmailTemplate(uid),
    onSuccess: (_, uid) => {
      queryClient.setQueriesData(
        { queryKey: [EMAIL_TEMPLATES_KEY] },
        (old: EmailTemplate[] | undefined) =>
          old?.filter((t) => t.uid !== uid) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: [EMAIL_TEMPLATES_KEY] });
      showSuccessToast("Email template deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete email template");
    },
  });
}

export function usePreviewEmailTemplate() {
  return useMutation({
    mutationFn: ({
      uid,
      data,
    }: {
      uid: string;
      data?: PreviewEmailTemplateDto;
    }) => previewEmailTemplate(uid, data),
    onError: (error) => {
      showErrorToast(error, "Failed to preview email template");
    },
  });
}
