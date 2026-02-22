export interface ContactMessage {
  uid: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateContactMessageDto {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export interface ContactMessagesListResponse {
  data: ContactMessage[];
  total: number;
}
