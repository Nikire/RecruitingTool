import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export type RiskTier = "HEALTHY" | "AT_RISK" | "CHURNING" | "CRITICAL";

export interface CompanyHealthItem {
  uid: string;
  name: string;
  plan: string;
  subscriptionStatus: string;
  healthScore: number;
  riskTier: RiskTier;
  lastLoginDaysAgo: number | null;
  activeJobPositions: number;
  applicationsThisMonth: number;
  hiringActivitiesThisMonth: number;
}

export interface CompanyHealthSummary {
  healthyCount: number;
  atRiskCount: number;
  churningCount: number;
  criticalCount: number;
}

export interface CompanyHealthResponse {
  companies: CompanyHealthItem[];
  total: number;
  page: number;
  limit: number;
  summary: CompanyHealthSummary;
}

export interface AdminCompanyHealthParams {
  page?: number;
  limit?: number;
  riskTier?: string;
}

const fetchAdminCompanyHealth = async (
  params: AdminCompanyHealthParams,
): Promise<CompanyHealthResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.riskTier) queryParams.riskTier = params.riskTier;

  const response = await api.get<CompanyHealthResponse>(
    "/admin/health/companies",
    { params: queryParams },
  );
  return response.data;
};

export function useAdminCompanyHealth(params: AdminCompanyHealthParams) {
  return useQuery<CompanyHealthResponse>({
    queryKey: ["admin", "health", "companies", params],
    queryFn: () => fetchAdminCompanyHealth(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}
