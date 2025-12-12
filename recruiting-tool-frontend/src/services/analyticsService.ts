import api from "../api/axios";
import {
  OverviewMetricsDto,
  TimeMetricsDto,
  ConversionMetricsDto,
  VolumeMetricsDto,
  SourceAnalyticsDto,
  PipelineFunnelDto,
  TimeToHireDto,
  SourceEffectivenessDto,
  StageDurationDto,
} from "../types/analytics";

/**
 * Analytics Service
 *
 * Direct API calls to backend analytics endpoints.
 * Use React Query hooks (useAnalytics.ts) for data fetching instead of calling these directly.
 */

export interface DateRangeParams {
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
  companyUid?: string; // For SUPER_ADMIN filtering
}

/**
 * Helper to build query params
 */
const buildQueryParams = (params?: DateRangeParams): string => {
  if (!params) return "";

  const urlParams = new URLSearchParams();
  if (params.startDate) urlParams.append("startDate", params.startDate);
  if (params.endDate) urlParams.append("endDate", params.endDate);
  if (params.companyUid) urlParams.append("companyUid", params.companyUid);

  const queryString = urlParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Fetch overview metrics
 */
export const getAnalyticsOverview = async (
  params?: DateRangeParams,
): Promise<OverviewMetricsDto> => {
  const { data } = await api.get<OverviewMetricsDto>(
    `/analytics/overview${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch time metrics
 */
export const getAnalyticsTimeMetrics = async (
  params?: DateRangeParams,
): Promise<TimeMetricsDto> => {
  const { data } = await api.get<TimeMetricsDto>(
    `/analytics/time-metrics${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch conversion metrics
 */
export const getAnalyticsConversion = async (
  params?: DateRangeParams,
): Promise<ConversionMetricsDto> => {
  const { data } = await api.get<ConversionMetricsDto>(
    `/analytics/conversion${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch volume metrics
 */
export const getAnalyticsVolume = async (
  params?: DateRangeParams,
): Promise<VolumeMetricsDto> => {
  const { data } = await api.get<VolumeMetricsDto>(
    `/analytics/volume${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch source analytics
 */
export const getAnalyticsSources = async (
  params?: DateRangeParams,
): Promise<SourceAnalyticsDto[]> => {
  const { data } = await api.get<SourceAnalyticsDto[]>(
    `/analytics/sources${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch pipeline funnel
 */
export const getAnalyticsPipeline = async (
  params?: DateRangeParams,
): Promise<PipelineFunnelDto> => {
  const { data } = await api.get<PipelineFunnelDto>(
    `/analytics/pipeline${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch time-to-hire analytics
 */
export const getAnalyticsTimeToHire = async (
  params?: DateRangeParams,
): Promise<TimeToHireDto> => {
  const { data } = await api.get<TimeToHireDto>(
    `/analytics/time-to-hire${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch source effectiveness
 */
export const getAnalyticsSourceEffectiveness = async (
  params?: DateRangeParams,
): Promise<SourceEffectivenessDto[]> => {
  const { data } = await api.get<SourceEffectivenessDto[]>(
    `/analytics/source-effectiveness${buildQueryParams(params)}`,
  );
  return data;
};

/**
 * Fetch stage duration analysis
 */
export const getAnalyticsStageDuration = async (
  params?: DateRangeParams,
): Promise<StageDurationDto[]> => {
  const { data } = await api.get<StageDurationDto[]>(
    `/analytics/stage-duration${buildQueryParams(params)}`,
  );
  return data;
};
