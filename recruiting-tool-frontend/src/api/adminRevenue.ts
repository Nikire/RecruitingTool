import { adminKeys } from "./queryKeys";
import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export interface PlanDistributionItem {
  plan: string;
  count: number;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface MonthlySignupItem {
  month: string;
  count: number;
}

export interface RevenueStatsResponse {
  mrr: number;
  mrrGrowth: number;
  activeCompanies: number;
  trialingCompanies: number;
  pastDueCompanies: number;
  canceledThisMonth: number;
  totalCompanies: number;
  planDistribution: PlanDistributionItem[];
  statusDistribution: StatusDistributionItem[];
  monthlySignups: MonthlySignupItem[];
}

const fetchRevenueStats = async (): Promise<RevenueStatsResponse> => {
  const response = await api.get<RevenueStatsResponse>("/admin/revenue/stats");
  return response.data;
};

export const useAdminRevenueStats = () => {
  return useQuery<RevenueStatsResponse>({
    queryKey: adminKeys.revenueStats(),
    queryFn: fetchRevenueStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
