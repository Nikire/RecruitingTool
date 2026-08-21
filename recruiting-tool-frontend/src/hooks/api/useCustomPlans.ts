import { customPlanKeys, stripeConfigKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getCustomPlans,
  createCustomPlan,
  updateCustomPlan,
  deleteCustomPlan,
  assignCustomPlan,
  syncCustomPlanToStripe,
  getStripeConfig,
} from "../../api/customPlans";
import type {
  CreateCustomPlanDto,
  UpdateCustomPlanDto,
} from "../../types/customPlans.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/**
 * Fetch all custom plans (SUPER_ADMIN only)
 */
export function useCustomPlans() {
  return useQuery({
    queryKey: customPlanKeys.all,
    queryFn: getCustomPlans,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create a new custom plan (SUPER_ADMIN only)
 */
export function useCreateCustomPlan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCustomPlanDto) => createCustomPlan(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPlanKeys.all });
      showSuccessToast(t("custom_plans.create_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("custom_plans.create_error"));
    },
  });
}

/**
 * Update a custom plan (SUPER_ADMIN only)
 */
export function useUpdateCustomPlan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, dto }: { uid: string; dto: UpdateCustomPlanDto }) =>
      updateCustomPlan(uid, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPlanKeys.all });
      showSuccessToast(t("custom_plans.update_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("custom_plans.update_error"));
    },
  });
}

/**
 * Delete a custom plan (SUPER_ADMIN only)
 */
export function useDeleteCustomPlan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteCustomPlan(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPlanKeys.all });
      showSuccessToast(t("custom_plans.delete_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("custom_plans.delete_error"));
    },
  });
}

/**
 * Assign a custom plan to a company (SUPER_ADMIN only)
 */
export function useAssignCustomPlan() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, companyUid }: { uid: string; companyUid: string }) =>
      assignCustomPlan(uid, companyUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPlanKeys.all });
      showSuccessToast(t("custom_plans.assign_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("custom_plans.assign_error"));
    },
  });
}

/**
 * Get Stripe configuration — test/live mode (SUPER_ADMIN only)
 */
export function useStripeConfig() {
  return useQuery({
    queryKey: stripeConfigKeys.all,
    queryFn: getStripeConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes — rarely changes
  });
}

/**
 * Sync a custom plan to Stripe (SUPER_ADMIN only)
 */
export function useSyncCustomPlanToStripe() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => syncCustomPlanToStripe(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customPlanKeys.all });
      showSuccessToast(t("custom_plans.stripe_sync_success"));
    },
    onError: (error) => {
      showErrorToast(error, t("custom_plans.stripe_sync_error"));
    },
  });
}
