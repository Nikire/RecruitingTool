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
} from "../types/subscription.types";

// API functions
export const subscriptionApi = {
  getSubscription: async (): Promise<Subscription> => {
    const response = await api.get("/stripe/subscription");
    return response.data;
  },

  getQuota: async (): Promise<QuotaStatus> => {
    const response = await api.get("/quota");
    return response.data;
  },

  createCheckoutSession: async (
    data: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponse> => {
    const response = await api.post("/stripe/checkout", data);
    return response.data;
  },

  getBillingPortal: async (): Promise<BillingPortalResponse> => {
    const response = await api.post("/stripe/billing-portal");
    return response.data;
  },

  cancelSubscription: async (): Promise<CancelSubscriptionResponse> => {
    const response = await api.post("/stripe/cancel");
    return response.data;
  },

  getInvoices: async (): Promise<InvoicesResponse> => {
    const response = await api.get("/stripe/invoices");
    return response.data;
  },
};

// React Query Hooks

/**
 * Hook to fetch the current subscription details
 */
export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: subscriptionApi.getSubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch quota status and usage
 */
export const useQuota = () => {
  return useQuery({
    queryKey: ["quota"],
    queryFn: subscriptionApi.getQuota,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a Stripe Checkout session
 * Redirects to Stripe Checkout on success
 */
export const useCheckout = () => {
  return useMutation({
    mutationFn: subscriptionApi.createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
  });
};

/**
 * Hook to get Stripe Billing Portal URL
 * Redirects to billing portal on success
 */
export const useBillingPortal = () => {
  return useMutation({
    mutationFn: subscriptionApi.getBillingPortal,
    onSuccess: (data) => {
      // Redirect to Stripe Billing Portal
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
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

/**
 * Hook to fetch billing invoices
 */
export const useInvoices = () => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: subscriptionApi.getInvoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
