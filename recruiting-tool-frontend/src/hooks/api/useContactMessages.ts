import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  createContactMessage,
  getContactMessages,
  markContactMessageAsRead,
} from "../../api/contactMessages";
import { CreateContactMessageDto } from "../../types/contact-message.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const CONTACT_MESSAGES_KEY = "contactMessages";

/**
 * Hook for fetching contact messages (admin only)
 */
export function useContactMessages(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [CONTACT_MESSAGES_KEY, { page, limit }],
    queryFn: () => getContactMessages(page, limit),
  });
}

/**
 * Hook for submitting a contact message (public)
 */
export function useCreateContactMessage() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateContactMessageDto) => createContactMessage(data),
    onError: () => {
      showErrorToast(t("errors.create_failed"));
    },
  });
}

/**
 * Hook for marking a contact message as read (admin only)
 */
export function useMarkContactMessageAsRead() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => markContactMessageAsRead(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACT_MESSAGES_KEY] });
      showSuccessToast(t("admin_contact.mark_as_read_success"));
    },
    onError: () => {
      showErrorToast(t("admin_contact.mark_as_read_error"));
    },
  });
}
