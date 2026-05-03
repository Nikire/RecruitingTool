import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import type {
  OutreachCampaign,
  OutreachLead,
  CreateCampaignPayload,
  UpdateLeadPayload,
  ImportResult,
  ConvertResult,
  SendLeadEmailPayload,
  SendLeadEmailResult,
  PreviewEmailResult,
  SendTestEmailPayload,
  SendTestEmailResult,
} from "../types/outreach-campaigns.types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const CAMPAIGNS_QK = ["outreach-campaigns"] as const;
export const leadsQK = (
  campaignUid: string,
  filters?: Record<string, string>,
) => ["outreach-leads", campaignUid, filters ?? {}] as const;

// ─── Campaign hooks ───────────────────────────────────────────────────────────

export function useOutreachCampaigns() {
  return useQuery<OutreachCampaign[]>({
    queryKey: CAMPAIGNS_QK,
    queryFn: async () => {
      const res = await api.get<OutreachCampaign[]>("/outreach-campaigns");
      return res.data;
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation<OutreachCampaign, Error, CreateCampaignPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<OutreachCampaign>(
        "/outreach-campaigns",
        payload,
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CAMPAIGNS_QK }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (uid) => {
      await api.delete(`/outreach-campaigns/${uid}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CAMPAIGNS_QK }),
  });
}

// ─── Lead hooks ───────────────────────────────────────────────────────────────

export function useOutreachLeads(
  campaignUid: string | null,
  filters?: { status?: string; channel?: string },
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.channel) params.set("channel", filters.channel);
  const filterObj =
    filters?.status || filters?.channel ? { ...filters } : undefined;

  return useQuery<OutreachLead[]>({
    queryKey: leadsQK(campaignUid ?? "", filterObj),
    queryFn: async () => {
      const res = await api.get<OutreachLead[]>(
        `/outreach-campaigns/${campaignUid}/leads`,
        { params },
      );
      return res.data;
    },
    enabled: !!campaignUid,
  });
}

export function useImportLeads(campaignUid: string) {
  const qc = useQueryClient();
  return useMutation<ImportResult, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<ImportResult>(
        `/outreach-campaigns/${campaignUid}/leads/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: leadsQK(campaignUid) }),
  });
}

export function useUpdateLead(campaignUid: string) {
  const qc = useQueryClient();
  return useMutation<
    OutreachLead,
    Error,
    { leadUid: string } & UpdateLeadPayload
  >({
    mutationFn: async ({ leadUid, ...payload }) => {
      const res = await api.patch<OutreachLead>(
        `/outreach-campaigns/${campaignUid}/leads/${leadUid}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsQK(campaignUid) });
      qc.invalidateQueries({ queryKey: CAMPAIGNS_QK });
    },
  });
}

export function useConvertLead(campaignUid: string) {
  const qc = useQueryClient();
  return useMutation<ConvertResult, Error, string>({
    mutationFn: async (leadUid) => {
      const res = await api.post<ConvertResult>(
        `/outreach-campaigns/${campaignUid}/leads/${leadUid}/convert`,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsQK(campaignUid) });
      qc.invalidateQueries({ queryKey: CAMPAIGNS_QK });
    },
  });
}

export function useSendLeadEmail(campaignUid: string) {
  const qc = useQueryClient();
  return useMutation<
    SendLeadEmailResult,
    Error,
    { leadUid: string } & SendLeadEmailPayload
  >({
    mutationFn: async ({ leadUid, ...payload }) => {
      const res = await api.post<SendLeadEmailResult>(
        `/outreach-campaigns/${campaignUid}/leads/${leadUid}/send-email`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsQK(campaignUid) });
      qc.invalidateQueries({ queryKey: CAMPAIGNS_QK });
    },
  });
}

export function usePreviewLeadEmail(
  campaignUid: string,
  leadUid: string,
  enabled: boolean,
) {
  return useQuery<PreviewEmailResult>({
    queryKey: ["outreach-preview-email", campaignUid, leadUid],
    queryFn: async () => {
      const res = await api.get<PreviewEmailResult>(
        `/outreach-campaigns/${campaignUid}/leads/${leadUid}/preview-email`,
      );
      return res.data;
    },
    enabled: enabled && !!campaignUid && !!leadUid,
  });
}

export function useSendTestEmail(campaignUid: string) {
  return useMutation<SendTestEmailResult, Error, SendTestEmailPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<SendTestEmailResult>(
        `/outreach-campaigns/${campaignUid}/send-test-email`,
        payload,
      );
      return res.data;
    },
  });
}
