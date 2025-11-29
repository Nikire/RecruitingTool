/**
 * Analytics data types for HR recruitment metrics
 */

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

export type MetricTrend = 'up' | 'down' | 'neutral';

export interface MetricCardData {
  title: string;
  value: number | string;
  trend?: MetricTrend;
  trendValue?: number;
  icon?: React.ReactNode;
  color?: string;
  unit?: string;
}
