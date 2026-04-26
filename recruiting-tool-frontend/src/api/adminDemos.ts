import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

export type DemoOutcome =
  | "PENDING"
  | "COMPLETED"
  | "NO_SHOW"
  | "RESCHEDULED"
  | "CANCELED";

export interface DemoBookingAdminItem {
  uid: string;
  prospectEmail: string;
  prospectName: string | null;
  prospectCompany: string | null;
  scheduledAt: string | null;
  outcome: DemoOutcome;
  outcomeNotes: string | null;
  linkedProspectUid: string | null;
  createdAt: string;
  usedAt: string | null;
}

export interface DemoBookingOutcomeSummary {
  pending: number;
  completed: number;
  noShow: number;
  rescheduled: number;
  canceled: number;
}

export interface DemoBookingListResponse {
  demos: DemoBookingAdminItem[];
  total: number;
  page: number;
  limit: number;
  summary: DemoBookingOutcomeSummary;
}

export interface AdminDemosParams {
  page?: number;
  limit?: number;
  outcome?: string;
}

export interface SetDemoOutcomePayload {
  uid: string;
  outcome: DemoOutcome;
  notes?: string;
}

export interface LinkDemoProspectPayload {
  uid: string;
  prospectUid: string;
}

const fetchAdminDemos = async (
  params: AdminDemosParams,
): Promise<DemoBookingListResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.outcome) queryParams.outcome = params.outcome;

  const response = await api.get<DemoBookingListResponse>("/admin/demos", {
    params: queryParams,
  });
  return response.data;
};

const setDemoOutcome = async (
  payload: SetDemoOutcomePayload,
): Promise<DemoBookingAdminItem> => {
  const response = await api.patch<DemoBookingAdminItem>(
    `/admin/demos/${payload.uid}/outcome`,
    { outcome: payload.outcome, notes: payload.notes },
  );
  return response.data;
};

const linkDemoProspect = async (
  payload: LinkDemoProspectPayload,
): Promise<DemoBookingAdminItem> => {
  const response = await api.patch<DemoBookingAdminItem>(
    `/admin/demos/${payload.uid}/link-prospect`,
    { prospectUid: payload.prospectUid },
  );
  return response.data;
};

export function useAdminDemos(params: AdminDemosParams) {
  return useQuery<DemoBookingListResponse>({
    queryKey: ["admin", "demos", params],
    queryFn: () => fetchAdminDemos(params),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

export function useSetDemoOutcome() {
  const queryClient = useQueryClient();
  return useMutation<DemoBookingAdminItem, Error, SetDemoOutcomePayload>({
    mutationFn: setDemoOutcome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "demos"] });
    },
  });
}

export function useLinkDemoProspect() {
  const queryClient = useQueryClient();
  return useMutation<DemoBookingAdminItem, Error, LinkDemoProspectPayload>({
    mutationFn: linkDemoProspect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "demos"] });
    },
  });
}
