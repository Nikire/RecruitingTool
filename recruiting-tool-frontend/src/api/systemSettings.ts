import api from "./axios";
import {
  SystemSettingsResponse,
  UpdateSystemSettingsDto,
  TestEmailResponse,
  EmailStatsResponse,
  PaginatedEmailLogs,
} from "../types/systemSettings.types";

/**
 * Fetch current system settings (SUPER_ADMIN only)
 */
export function getSystemSettings(): Promise<SystemSettingsResponse> {
  return api.get("/admin/system-settings").then((res) => res.data);
}

/**
 * Update mutable system settings (SUPER_ADMIN only)
 * Currently supports toggling applicationEmailsEnabled.
 */
export function updateSystemSettings(
  dto: UpdateSystemSettingsDto,
): Promise<SystemSettingsResponse> {
  return api.patch("/admin/system-settings", dto).then((res) => res.data);
}

/**
 * Send a test email to the current SUPER_ADMIN user (SUPER_ADMIN only)
 */
export function testEmailConnection(): Promise<TestEmailResponse> {
  return api.post("/admin/system-settings/test-email").then((res) => res.data);
}

/**
 * Fetch email sending statistics (SUPER_ADMIN only)
 */
export function getEmailStats(): Promise<EmailStatsResponse> {
  return api.get("/admin/system-settings/email-stats").then((res) => res.data);
}

/**
 * Fetch paginated email logs (SUPER_ADMIN only)
 */
export function getEmailLogs(params: {
  page?: number;
  limit?: number;
  status?: string;
  emailType?: string;
  search?: string;
}): Promise<PaginatedEmailLogs> {
  return api
    .get("/admin/system-settings/email-logs", { params })
    .then((res) => res.data);
}
