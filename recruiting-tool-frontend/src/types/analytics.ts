/**
 * Analytics data types for HR recruitment metrics
 * Aligned with backend API DTOs
 */

// =====================
// Backend DTO Types
// =====================

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
// Legacy Types (for compatibility with existing components)
// TODO: Migrate components to use backend DTOs directly
// =====================

export interface AnalyticsData {
  overview: OverviewMetrics;
  hiring: HiringMetrics;
  candidates: CandidateMetrics;
  performance: PerformanceMetrics;
}

export interface OverviewMetrics {
  totalCandidates: number;
  totalHiringProcesses: number;
  activeJobPositions: number;
  hiredThisMonth: number;
  avgTimeToHire: number; // days

  // Trend indicators (percentage change from previous period)
  candidatesTrend?: number;
  processesTrend?: number;
  positionsTrend?: number;
  hiredTrend?: number;
  timeToHireTrend?: number;
}

export interface HiringMetrics {
  conversionRates: StageConversionRate[];
  timeToHireByPosition: TimeToHireData[];
  hiresOverTime: HiringTrendData[];
}

export interface StageConversionRate {
  fromStage: string;
  toStage: string;
  rate: number; // 0-100%
  count: number; // Number of candidates who made this transition
}

export interface TimeToHireData {
  position: string;
  days: number;
  count: number; // Number of hires
}

export interface HiringTrendData {
  month: string;
  count: number;
  target?: number; // Optional hiring target
}

export interface CandidateMetrics {
  sourceDistribution: SourceData[];
  statusDistribution: StatusData[];
  topSkills: SkillData[];
}

export interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface SkillData {
  skill: string;
  count: number;
}

export interface PerformanceMetrics {
  avgScoreByPosition: PositionScoreData[];
  interviewsPerWeek: InterviewData[];
}

export interface PositionScoreData {
  position: string;
  score: number; // 0-100
  candidateCount: number;
}

export interface InterviewData {
  week: string;
  count: number;
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
}

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardData {
  title: string;
  value: number | string;
  trend?: MetricTrend;
  trendValue?: number;
  icon?: React.ReactNode;
  color?: string;
  unit?: string;
}
