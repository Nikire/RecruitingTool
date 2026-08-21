import { adminKeys } from "./queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../types/subscription.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChangePlanPayload {
  plan: SubscriptionPlan;
  note?: string;
}

export interface ChangeStatusPayload {
  status: SubscriptionStatus;
  note?: string;
}

export interface ExtendTrialPayload {
  days: number;
  note?: string;
}

export interface UpdatedSubscription {
  uid: string;
  plan: string;
  status: string;
  trialEnd: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

export interface SubscriptionAuditLogItem {
  uid: string;
  action: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
  adminName: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

const changePlan = async (
  companyUid: string,
  payload: ChangePlanPayload,
): Promise<UpdatedSubscription> => {
  const response = await api.patch<UpdatedSubscription>(
    `/admin/subscriptions/${companyUid}/plan`,
    payload,
  );
  return response.data;
};

const changeStatus = async (
  companyUid: string,
  payload: ChangeStatusPayload,
): Promise<UpdatedSubscription> => {
  const response = await api.patch<UpdatedSubscription>(
    `/admin/subscriptions/${companyUid}/status`,
    payload,
  );
  return response.data;
};

const extendTrial = async (
  companyUid: string,
  payload: ExtendTrialPayload,
): Promise<UpdatedSubscription> => {
  const response = await api.post<UpdatedSubscription>(
    `/admin/subscriptions/${companyUid}/extend-trial`,
    payload,
  );
  return response.data;
};

const fetchAuditLog = async (
  companyUid: string,
): Promise<SubscriptionAuditLogItem[]> => {
  const response = await api.get<SubscriptionAuditLogItem[]>(
    `/admin/subscriptions/${companyUid}/audit-log`,
  );
  return response.data;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useChangePlan = (companyUid: string) => {
  const queryClient = useQueryClient();
  return useMutation<UpdatedSubscription, Error, ChangePlanPayload>({
    mutationFn: (payload) => changePlan(companyUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
    },
  });
};

export const useChangeStatus = (companyUid: string) => {
  const queryClient = useQueryClient();
  return useMutation<UpdatedSubscription, Error, ChangeStatusPayload>({
    mutationFn: (payload) => changeStatus(companyUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
    },
  });
};

export const useExtendTrial = (companyUid: string) => {
  const queryClient = useQueryClient();
  return useMutation<UpdatedSubscription, Error, ExtendTrialPayload>({
    mutationFn: (payload) => extendTrial(companyUid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subscriptions() });
    },
  });
};

export const useSubscriptionAuditLog = (
  companyUid: string | null,
  enabled: boolean,
) => {
  return useQuery<SubscriptionAuditLogItem[]>({
    queryKey: adminKeys.subscriptionAuditLog(companyUid),
    queryFn: () => fetchAuditLog(companyUid!),
    enabled: enabled && !!companyUid,
    staleTime: 0,
  });
};
