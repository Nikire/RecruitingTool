import { adminKeys, quotaKeys, subscriptionKeys } from "./queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import {
  Subscription,
  QuotaStatus,
  CreateCheckoutSessionDto,
  CheckoutSessionResponse,
  BillingPortalResponse,
  CancelSubscriptionResponse,
  InvoicesResponse,
  SubscriptionsListResponse,
  ListSubscriptionsQuery,
} from "../types/subscription.types";

// API functions
export const subscriptionApi = {
  getSubscription: async (): Promise<Subscription> => {
    const response = await api.get("/billing/subscription");
    return response.data;
  },

  getQuota: async (): Promise<QuotaStatus> => {
    const response = await api.get("/quota");
    return response.data;
  },

  createCheckoutSession: async (
    data: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponse> => {
    const response = await api.post("/billing/checkout", data);
    return response.data;
  },

  getBillingPortal: async (): Promise<BillingPortalResponse> => {
    const response = await api.post("/billing/customer-portal", {
      returnUrl: window.location.href,
    });
    return response.data;
  },

  cancelSubscription: async (): Promise<CancelSubscriptionResponse> => {
    const response = await api.post("/billing/cancel");
    return response.data;
  },

  getInvoices: async (): Promise<InvoicesResponse> => {
    const response = await api.get("/billing/invoices");
    return response.data;
  },

  listAllSubscriptions: async (
    query: ListSubscriptionsQuery,
  ): Promise<SubscriptionsListResponse> => {
    // Served by the Dodo Payments module (the live provider). The previous
    // `/stripe/subscriptions/all` route disappeared with StripeModule.
    const response = await api.get("/billing/admin/subscriptions/list", {
      params: query,
    });
    return response.data;
  },
};

// React Query Hooks

/**
 * Hook to fetch the current subscription details
 */
export const useSubscription = () => {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionApi.getSubscription,
    staleTime: 1000 * 30, // 30 seconds - keeps UI fresh after checkout redirect
  });
};

/**
 * Hook to fetch quota status and usage
 */
export const useQuota = () => {
  return useQuery({
    queryKey: quotaKeys.current(),
    queryFn: subscriptionApi.getQuota,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a provider checkout session
 * Redirects to the hosted checkout page on success
 */
export const useCheckout = () => {
  return useMutation({
    mutationFn: subscriptionApi.createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to the provider-hosted checkout page
      window.location.href = data.url;
    },
  });
};

/**
 * Hook to get the billing portal URL
 * Redirects to the customer portal on success
 */
export const useBillingPortal = () => {
  return useMutation({
    mutationFn: subscriptionApi.getBillingPortal,
    onSuccess: (data) => {
      // Redirect to the provider-hosted customer portal
      window.location.href = data.url;
    },
  });
};

/**
 * Hook to cancel subscription at period end
 * Invalidates subscription query on success
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.cancelSubscription,
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
  });
};

/**
 * Hook to fetch billing invoices
 */
export const useInvoices = () => {
  return useQuery({
    queryKey: subscriptionKeys.invoices(),
    queryFn: subscriptionApi.getInvoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch all subscriptions (Admin only)
 */
export const useListAllSubscriptions = (query: ListSubscriptionsQuery) => {
  return useQuery({
    queryKey: adminKeys.subscriptionsList(query),
    queryFn: () => subscriptionApi.listAllSubscriptions(query),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
