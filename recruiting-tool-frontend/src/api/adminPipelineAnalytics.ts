import { adminKeys } from "./queryKeys";
import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export interface PlatformStats {
  totalApplications: number;
  applicationsThisMonth: number;
  applicationsLastMonthGrowth: number;
  totalInterviews: number;
  interviewsThisMonth: number;
  openPositions: number;
  totalPositions: number;
  closedPositions: number;
  avgTimeToHireDays: number;
  conversionRate: number;
  totalActiveCompanies: number;
}

export interface MonthlyApplicationItem {
  month: string;
  count: number;
}

export interface ApplicationSourceItem {
  source: string;
  count: number;
}

export interface PipelineAnalyticsResponse {
  platformStats: PlatformStats;
  monthlyApplications: MonthlyApplicationItem[];
  applicationSources: ApplicationSourceItem[];
}

const fetchPipelineAnalytics = async (): Promise<PipelineAnalyticsResponse> => {
  const response = await api.get<PipelineAnalyticsResponse>(
    "/admin/analytics/pipeline",
  );
  return response.data;
};

export const useAdminPipelineAnalytics = () => {
  return useQuery<PipelineAnalyticsResponse>({
    queryKey: adminKeys.pipelineAnalytics(),
    queryFn: fetchPipelineAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
