import { analyticsKeys } from "../../api/queryKeys";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

// =====================
// Types matching backend DTOs
// =====================

export interface DateRange {
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
  companyUid?: string; // For SUPER_ADMIN filtering
}

export interface TimeMetricsDto {
  averageTimeToHire: number;
  timeToFirstInterview: number;
  averageTimePerStage: Record<string, number>;
}

export interface ConversionMetricsDto {
  applicationToScreeningRate: number;
  screeningToInterviewRate: number;
  interviewToOfferRate: number;
  offerToHiredRate: number;
  overallConversionRate: number;
}

export interface VolumeMetricsDto {
  totalApplicationsThisMonth: number;
  totalHiredThisMonth: number;
  totalActiveProcesses: number;
  candidatesBySource: Record<string, number>;
}

export interface OverviewMetricsDto {
  timeMetrics: TimeMetricsDto;
  conversionMetrics: ConversionMetricsDto;
  volumeMetrics: VolumeMetricsDto;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface SourceAnalyticsDto {
  source: string;
  count: number;
  conversionRate: number;
  averageTimeToHire: number;
}

export interface PipelineStageDto {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface PipelineFunnelDto {
  stages: PipelineStageDto[];
  overallConversionRate: number;
  totalApplications: number;
  totalHires: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface TimeToHireTrendDto {
  period: string;
  averageTimeToHire: number;
  hiresCount: number;
}

export interface TimeToHireDto {
  current: number;
  previous: number;
  percentageChange: number;
  trend: TimeToHireTrendDto[];
  median: number;
  fastest: number;
  slowest: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface SourceEffectivenessDto {
  source: string;
  totalApplications: number;
  hires: number;
  successRate: number;
  averageTimeToHire: number;
  averageQualityScore?: number;
  costPerHire?: number;
}

export interface StageDurationDto {
  stageType: string;
  averageDuration: number;
  medianDuration: number;
  completedCount: number;
  currentCount: number;
  fastest: number;
  slowest: number;
}

// =====================
// Helper to build query params
// =====================

const buildQueryParams = (dateRange?: DateRange): string => {
  if (!dateRange) return "";

  const params = new URLSearchParams();
  if (dateRange.startDate) params.append("startDate", dateRange.startDate);
  if (dateRange.endDate) params.append("endDate", dateRange.endDate);
  if (dateRange.companyUid) params.append("companyUid", dateRange.companyUid);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

// =====================
// React Query Hooks
// =====================

const STALE_TIME = 10 * 60 * 1000; // 10 minutes (match backend cache)
const GC_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Hook for fetching overview metrics
 * Returns comprehensive dashboard metrics including time, conversion, and volume data
 */
export function useAnalyticsOverview(dateRange?: DateRange) {
  return useQuery<OverviewMetricsDto>({
    queryKey: analyticsKeys.overview(dateRange),
    queryFn: async () => {
      const { data } = await api.get<OverviewMetricsDto>(
        `/analytics/overview${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching time metrics
 * Returns time-based recruiting metrics
 */
export function useAnalyticsTimeMetrics(dateRange?: DateRange) {
  return useQuery<TimeMetricsDto>({
    queryKey: analyticsKeys.timeMetrics(dateRange),
    queryFn: async () => {
      const { data } = await api.get<TimeMetricsDto>(
        `/analytics/time-metrics${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching conversion metrics
 * Returns conversion funnel metrics showing how candidates progress through stages
 */
export function useAnalyticsConversion(dateRange?: DateRange) {
  return useQuery<ConversionMetricsDto>({
    queryKey: analyticsKeys.conversion(dateRange),
    queryFn: async () => {
      const { data } = await api.get<ConversionMetricsDto>(
        `/analytics/conversion${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching volume metrics
 * Returns total counts, active processes, and breakdown by source
 */
export function useAnalyticsVolume(dateRange?: DateRange) {
  return useQuery<VolumeMetricsDto>({
    queryKey: analyticsKeys.volume(dateRange),
    queryFn: async () => {
      const { data } = await api.get<VolumeMetricsDto>(
        `/analytics/volume${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching source analytics
 * Returns analytics breakdown by application source
 */
export function useAnalyticsSources(dateRange?: DateRange) {
  return useQuery<SourceAnalyticsDto[]>({
    queryKey: analyticsKeys.sources(dateRange),
    queryFn: async () => {
      const { data } = await api.get<SourceAnalyticsDto[]>(
        `/analytics/sources${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching pipeline funnel
 * Returns detailed funnel analysis with stage-by-stage conversion and drop-off rates
 */
export function useAnalyticsPipeline(dateRange?: DateRange) {
  return useQuery<PipelineFunnelDto>({
    queryKey: analyticsKeys.pipeline(dateRange),
    queryFn: async () => {
      const { data } = await api.get<PipelineFunnelDto>(
        `/analytics/pipeline${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching time-to-hire analytics
 * Returns comprehensive time-to-hire analysis including trends
 */
export function useAnalyticsTimeToHire(dateRange?: DateRange) {
  return useQuery<TimeToHireDto>({
    queryKey: analyticsKeys.timeToHire(dateRange),
    queryFn: async () => {
      const { data } = await api.get<TimeToHireDto>(
        `/analytics/time-to-hire${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching source effectiveness
 * Returns detailed source analysis including success rates and quality scores
 */
export function useAnalyticsSourceEffectiveness(dateRange?: DateRange) {
  return useQuery<SourceEffectivenessDto[]>({
    queryKey: analyticsKeys.sourceEffectiveness(dateRange),
    queryFn: async () => {
      const { data } = await api.get<SourceEffectivenessDto[]>(
        `/analytics/source-effectiveness${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

/**
 * Hook for fetching stage duration analysis
 * Returns average time spent in each stage with bottleneck identification
 */
export function useAnalyticsStageDuration(dateRange?: DateRange) {
  return useQuery<StageDurationDto[]>({
    queryKey: analyticsKeys.stageDuration(dateRange),
    queryFn: async () => {
      const { data } = await api.get<StageDurationDto[]>(
        `/analytics/stage-duration${buildQueryParams(dateRange)}`,
      );
      return data;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}
