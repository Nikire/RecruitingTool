import api from "../api/axios";
import type { AdminSubscriptionsResponse } from "../types/subscription.types";

/**
 * Subscription Service - Handles all subscription-related API calls
 */

/**
 * Get all subscriptions (Admin only)
 * @returns Promise with all subscriptions and statistics
 */
export const getAllSubscriptionsAdmin = async (): Promise<AdminSubscriptionsResponse> => {
  const response = await api.get<AdminSubscriptionsResponse>("/stripe/admin/subscriptions");
  return response.data;
};
