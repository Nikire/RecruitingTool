import api from "./axios";
import {
  ContactMessage,
  CreateContactMessageDto,
  ContactMessagesListResponse,
} from "../types/contact-message.types";

/**
 * Submit a contact message (public endpoint)
 */
export function createContactMessage(
  data: CreateContactMessageDto,
): Promise<ContactMessage> {
  return api.post("/contact", data).then((res) => res.data);
}

/**
 * Get all contact messages (admin only) with pagination
 */
export function getContactMessages(
  page: number = 1,
  limit: number = 20,
): Promise<ContactMessagesListResponse> {
  return api
    .get("/contact/messages", { params: { page, limit } })
    .then((res) => res.data);
}

/**
 * Mark a contact message as read (admin only)
 */
export function markContactMessageAsRead(uid: string): Promise<ContactMessage> {
  return api.patch(`/contact/messages/${uid}/read`).then((res) => res.data);
}
