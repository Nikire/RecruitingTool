import { emailTemplateKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
  createDefaultEmailTemplates,
} from "../../api/emailTemplates";
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  PreviewEmailTemplateDto,
  EmailTemplate,
} from "../../types/emailTemplate.types";
import i18n from "i18next";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export function useEmailTemplates(companyUid?: string) {
  return useQuery({
    queryKey: emailTemplateKeys.byCompany(companyUid),
    queryFn: () => getEmailTemplates(companyUid),
  });
}

export function useEmailTemplate(uid: string) {
  return useQuery({
    queryKey: emailTemplateKeys.detail(uid),
    queryFn: () => getEmailTemplate(uid),
    enabled: !!uid,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailTemplateDto) => createEmailTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      showSuccessToast(i18n.t("email_templates.toast.created"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("email_templates.toast.create_failed"));
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
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      showSuccessToast(i18n.t("email_templates.toast.updated"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("email_templates.toast.update_failed"));
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteEmailTemplate(uid),
    onSuccess: (_, uid) => {
      // Lists only. Keyed on `all` this updater also matched the single-template
      // detail queries and called .filter() on a non-array.
      queryClient.setQueriesData(
        { queryKey: emailTemplateKeys.lists() },
        (old: EmailTemplate[] | undefined) =>
          old?.filter((t) => t.uid !== uid) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      showSuccessToast(i18n.t("email_templates.toast.deleted"));
    },
    onError: (error) => {
      showErrorToast(error, i18n.t("email_templates.toast.delete_failed"));
    },
  });
}

export function useCreateDefaultEmailTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createDefaultEmailTemplates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
      showSuccessToast(i18n.t("email_templates.toast.defaults_created"));
    },
    onError: (error) => {
      showErrorToast(
        error,
        i18n.t("email_templates.toast.defaults_create_failed"),
      );
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
      showErrorToast(error, i18n.t("email_templates.toast.preview_failed"));
    },
  });
}
