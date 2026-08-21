import api from "../api/axios";
import type { AdminSubscriptionsResponse } from "../types/subscription.types";

/**
 * Subscription Service - Handles all subscription-related API calls
 */

/**
 * Get all subscriptions (Admin only)
 *
 * Served by the Dodo Payments module, which is the live billing provider.
 * This used to point at `/stripe/admin/subscriptions`; StripeModule was
 * removed from AppModule, so that route 404'd and every consumer of this
 * function could only ever render its error state.
 *
 * @returns Promise with all subscriptions and statistics
 */
export const getAllSubscriptionsAdmin =
  async (): Promise<AdminSubscriptionsResponse> => {
    const response = await api.get<AdminSubscriptionsResponse>(
      "/billing/admin/subscriptions",
    );
    return response.data;
  };
