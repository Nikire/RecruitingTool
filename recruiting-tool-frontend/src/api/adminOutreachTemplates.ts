import { adminKeys } from "./queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

export interface OutreachTemplateOverride {
  templateId: number;
  lang: string;
  variantIndex: number;
  subject?: string;
  body: string;
}

export interface UpsertOutreachTemplatePayload {
  templateId: number;
  lang: string;
  variantIndex: number;
  subject?: string;
  body: string;
}

export function useOutreachTemplateOverrides() {
  return useQuery<OutreachTemplateOverride[]>({
    queryKey: adminKeys.outreachTemplateOverrides(),
    queryFn: async () => {
      const { data } = await api.get<OutreachTemplateOverride[]>(
        "/admin/outreach-templates",
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertOutreachTemplateOverride() {
  const qc = useQueryClient();
  return useMutation<
    OutreachTemplateOverride,
    Error,
    UpsertOutreachTemplatePayload
  >({
    mutationFn: async (payload: UpsertOutreachTemplatePayload) => {
      const { data } = await api.put<OutreachTemplateOverride>(
        "/admin/outreach-templates",
        payload,
      );
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: adminKeys.outreachTemplateOverrides() }),
  });
}

export function useDeleteOutreachTemplateOverride() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { templateId: number; lang: string; variantIndex: number }
  >({
    mutationFn: async ({
      templateId,
      lang,
      variantIndex,
    }: {
      templateId: number;
      lang: string;
      variantIndex: number;
    }) => {
      await api.delete(
        `/admin/outreach-templates/${templateId}/${lang}/${variantIndex}`,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: adminKeys.outreachTemplateOverrides() }),
  });
}
