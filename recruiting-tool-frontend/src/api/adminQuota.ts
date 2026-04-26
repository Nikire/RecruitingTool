import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export interface QuotaResourceUsage {
  used: number;
  limit: number;
  percentage: number;
}

export interface CompanyQuotaItem {
  uid: string;
  name: string;
  plan: string;
  subscriptionStatus: string;
  jobPositions: QuotaResourceUsage;
  users: QuotaResourceUsage;
  aiCredits: QuotaResourceUsage;
  healthStatus: "OK" | "WARNING" | "CRITICAL" | "EXCEEDED";
}

export interface QuotaOverviewSummary {
  totalCompanies: number;
  okCount: number;
  warningCount: number;
  criticalCount: number;
  exceededCount: number;
}

export interface QuotaOverviewResponse {
  companies: CompanyQuotaItem[];
  total: number;
  page: number;
  limit: number;
  summary: QuotaOverviewSummary;
}

export interface AdminQuotaOverviewParams {
  page?: number;
  limit?: number;
  plan?: string;
  status?: string;
}

const fetchAdminQuotaOverview = async (
  params: AdminQuotaOverviewParams,
): Promise<QuotaOverviewResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.plan) queryParams.plan = params.plan;
  if (params.status) queryParams.status = params.status;

  const response = await api.get<QuotaOverviewResponse>(
    "/admin/quota/overview",
    { params: queryParams },
  );
  return response.data;
};

export function useAdminQuotaOverview(params: AdminQuotaOverviewParams) {
  return useQuery<QuotaOverviewResponse>({
    queryKey: ["admin", "quota", "overview", params],
    queryFn: () => fetchAdminQuotaOverview(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}
