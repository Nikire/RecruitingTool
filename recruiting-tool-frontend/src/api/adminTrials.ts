import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export type ConversionReadiness = "HOT" | "WARM" | "COLD";

export interface TrialCompanyItem {
  uid: string;
  name: string;
  plan: string;
  subscriptionStatus: string;
  daysOnPlatform: number;
  activationScore: number;
  conversionReadiness: ConversionReadiness;
  jobPositionsCreated: number;
  candidatesAdded: number;
  applicationsReceived: number;
  hiringProcessesStarted: number;
  teamMembersInvited: number;
  hasOutreachRecord: boolean;
  prospectCompanyUid: string | null;
}

export interface TrialOverviewSummary {
  hotCount: number;
  warmCount: number;
  coldCount: number;
}

export interface TrialOverviewResponse {
  companies: TrialCompanyItem[];
  total: number;
  page: number;
  limit: number;
  summary: TrialOverviewSummary;
}

export interface AdminTrialOverviewParams {
  page?: number;
  limit?: number;
  readiness?: string;
  plan?: string;
}

const fetchAdminTrialOverview = async (
  params: AdminTrialOverviewParams,
): Promise<TrialOverviewResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.readiness) queryParams.readiness = params.readiness;
  if (params.plan) queryParams.plan = params.plan;

  const response = await api.get<TrialOverviewResponse>(
    "/admin/trials/overview",
    { params: queryParams },
  );
  return response.data;
};

export function useAdminTrialOverview(params: AdminTrialOverviewParams) {
  return useQuery<TrialOverviewResponse>({
    queryKey: ["admin", "trials", "overview", params],
    queryFn: () => fetchAdminTrialOverview(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}
