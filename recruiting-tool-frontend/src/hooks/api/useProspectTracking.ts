import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getProspects,
  getProspectStats,
  getProspect,
  getProspectAnalytics,
  createProspect,
  updateProspect,
  deleteProspect,
  addProspectContact,
  removeProspectContact,
  addProspectActivity,
} from "../../api/prospectTracking";
import type {
  ProspectListParams,
  CreateProspectDto,
  UpdateProspectDto,
  CreateOutreachContactDto,
  CreateOutreachActivityDto,
} from "../../types/prospect-tracking.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export const PROSPECT_KEYS = {
  all: ["prospects"] as const,
  list: (params?: ProspectListParams) =>
    [...PROSPECT_KEYS.all, "list", params] as const,
  stats: () => [...PROSPECT_KEYS.all, "stats"] as const,
  analytics: () => [...PROSPECT_KEYS.all, "analytics"] as const,
  detail: (uid: string) => [...PROSPECT_KEYS.all, uid] as const,
};

export function useProspects(params?: ProspectListParams) {
  return useQuery({
    queryKey: PROSPECT_KEYS.list(params),
    queryFn: () => getProspects(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProspectStats() {
  return useQuery({
    queryKey: PROSPECT_KEYS.stats(),
    queryFn: getProspectStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProspectAnalytics() {
  return useQuery({
    queryKey: PROSPECT_KEYS.analytics(),
    queryFn: getProspectAnalytics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProspect(uid: string | null) {
  return useQuery({
    queryKey: PROSPECT_KEYS.detail(uid!),
    queryFn: () => getProspect(uid!),
    enabled: !!uid,
  });
}

export function useCreateProspect() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProspectDto) => createProspect(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.all });
      showSuccessToast(t("outreach_crm.save_success"));
    },
    onError: () => {
      showErrorToast(
        t("errors.create_failed", { entity: t("outreach_crm.title") }),
      );
    },
  });
}

export function useUpdateProspect() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, ...dto }: UpdateProspectDto & { uid: string }) =>
      updateProspect(uid, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.all });
      showSuccessToast(t("outreach_crm.save_success"));
    },
    onError: () => {
      showErrorToast(
        t("errors.update_failed", { entity: t("outreach_crm.title") }),
      );
    },
  });
}

export function useDeleteProspect() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => deleteProspect(uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.all });
      showSuccessToast(t("outreach_crm.delete_success"));
    },
    onError: () => {
      showErrorToast(
        t("errors.delete_failed", { entity: t("outreach_crm.title") }),
      );
    },
  });
}

export function useAddProspectContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, ...dto }: CreateOutreachContactDto & { uid: string }) =>
      addProspectContact(uid, dto),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.detail(vars.uid) });
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.list() });
    },
  });
}

export function useRemoveProspectContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, contactUid }: { uid: string; contactUid: string }) =>
      removeProspectContact(uid, contactUid),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.detail(vars.uid) });
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.list() });
    },
  });
}

export function useAddProspectActivity() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      uid,
      ...dto
    }: CreateOutreachActivityDto & { uid: string }) =>
      addProspectActivity(uid, dto),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.detail(vars.uid) });
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.list() });
      qc.invalidateQueries({ queryKey: PROSPECT_KEYS.analytics() });
      showSuccessToast(t("outreach_crm_detail.activity_logged"));
    },
    onError: () => {
      showErrorToast(t("outreach_crm_detail.activity_log_error"));
    },
  });
}
