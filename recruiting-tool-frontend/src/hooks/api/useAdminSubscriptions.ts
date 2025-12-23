import { useQuery } from "@tanstack/react-query";
import { getAllSubscriptionsAdmin } from "../../services/subscriptionService";
import type { AdminSubscriptionsResponse } from "../../types/subscription.types";

/**
 * Hook to fetch all subscriptions for admin view
 * @returns React Query result with all subscriptions and statistics
 */
export const useAdminSubscriptions = () => {
  return useQuery<AdminSubscriptionsResponse>({
    queryKey: ["admin", "subscriptions"],
    queryFn: getAllSubscriptionsAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
