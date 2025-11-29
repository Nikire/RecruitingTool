import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class DateRangeQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for analytics (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Company UID (optional, SUPER_ADMIN can filter by company)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  companyUid?: string;
}

export class TimeMetricsDto {
  @ApiProperty({
    description: 'Average time to hire in days (from application to hired)',
    example: 25.5,
  })
  averageTimeToHire: number;

  @ApiProperty({
    description: 'Average time from application to first interview in days',
    example: 5.2,
  })
  timeToFirstInterview: number;

  @ApiProperty({
    description: 'Average time spent in each stage',
    example: {
      INTERVIEW: 3.5,
      TECHNICAL_INTERVIEW: 7.2,
      FINAL_INTERVIEW: 4.8,
      OFFER: 5.0,
    },
  })
  averageTimePerStage: Record<string, number>;
}

export class ConversionMetricsDto {
  @ApiProperty({
    description: 'Percentage of applications that move to screening',
    example: 45.5,
  })
  applicationToScreeningRate: number;

  @ApiProperty({
    description: 'Percentage of screened candidates that move to interview',
    example: 60.2,
  })
  screeningToInterviewRate: number;

  @ApiProperty({
    description: 'Percentage of interviewed candidates that receive an offer',
    example: 35.7,
  })
  interviewToOfferRate: number;

  @ApiProperty({
    description: 'Percentage of offers that are accepted',
    example: 75.0,
  })
  offerToHiredRate: number;

  @ApiProperty({
    description: 'Overall conversion rate from application to hired',
    example: 12.1,
  })
  overallConversionRate: number;
}

export class VolumeMetricsDto {
  @ApiProperty({
    description: 'Total applications received this month',
    example: 150,
  })
  totalApplicationsThisMonth: number;

  @ApiProperty({
    description: 'Total candidates hired this month',
    example: 12,
  })
  totalHiredThisMonth: number;

  @ApiProperty({
    description: 'Total active hiring processes',
    example: 45,
  })
  totalActiveProcesses: number;

  @ApiProperty({
    description: 'Breakdown of candidates by application source',
    example: {
      LINKEDIN: 50,
      INDEED: 30,
      REFERRAL: 25,
      WEBSITE: 20,
      OTHER: 25,
    },
  })
  candidatesBySource: Record<string, number>;
}

export class SourceAnalyticsDto {
  @ApiProperty({
    description: 'Source name',
    example: 'LINKEDIN',
  })
  source: string;

  @ApiProperty({
    description: 'Number of applications from this source',
    example: 50,
  })
  count: number;

  @ApiProperty({
    description: 'Conversion rate from this source (%)',
    example: 15.5,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Average time to hire from this source (days)',
    example: 22.3,
  })
  averageTimeToHire: number;
}

export class OverviewMetricsDto {
  @ApiProperty({
    description: 'Time-based metrics',
    type: TimeMetricsDto,
  })
  timeMetrics: TimeMetricsDto;

  @ApiProperty({
    description: 'Conversion funnel metrics',
    type: ConversionMetricsDto,
  })
  conversionMetrics: ConversionMetricsDto;

  @ApiProperty({
    description: 'Volume and count metrics',
    type: VolumeMetricsDto,
  })
  volumeMetrics: VolumeMetricsDto;

  @ApiProperty({
    description: 'Date range used for calculations',
    example: {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    },
  })
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export class PipelineStageDto {
  @ApiProperty({
    description: 'Stage name',
    example: 'Application',
  })
  stage: string;

  @ApiProperty({
    description: 'Number of candidates at this stage',
    example: 100,
  })
  count: number;

  @ApiProperty({
    description: 'Conversion rate from previous stage (%)',
    example: 45.5,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Drop-off rate from previous stage (%)',
    example: 54.5,
  })
  dropOffRate: number;
}

export class PipelineFunnelDto {
  @ApiProperty({
    description: 'Pipeline stages with counts and conversion rates',
    type: [PipelineStageDto],
  })
  stages: PipelineStageDto[];

  @ApiProperty({
    description: 'Overall conversion rate from application to hire (%)',
    example: 12.5,
  })
  overallConversionRate: number;

  @ApiProperty({
    description: 'Total applications in funnel',
    example: 200,
  })
  totalApplications: number;

  @ApiProperty({
    description: 'Total hires in funnel',
    example: 25,
  })
  totalHires: number;

  @ApiProperty({
    description: 'Date range used for calculations',
    example: {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    },
  })
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export class TimeToHireTrendDto {
  @ApiProperty({
    description: 'Date or period label',
    example: '2024-01',
  })
  period: string;

  @ApiProperty({
    description: 'Average time to hire for this period (days)',
    example: 28.5,
  })
  averageTimeToHire: number;

  @ApiProperty({
    description: 'Number of hires in this period',
    example: 5,
  })
  hiresCount: number;
}

export class TimeToHireDto {
  @ApiProperty({
    description: 'Current average time to hire (days)',
    example: 25.3,
  })
  current: number;

  @ApiProperty({
    description: 'Previous period average for comparison (days)',
    example: 30.2,
  })
  previous: number;

  @ApiProperty({
    description: 'Percentage change from previous period',
    example: -16.2,
  })
  percentageChange: number;

  @ApiProperty({
    description: 'Trend data over time',
    type: [TimeToHireTrendDto],
  })
  trend: TimeToHireTrendDto[];

  @ApiProperty({
    description: 'Median time to hire (days)',
    example: 22.0,
  })
  median: number;

  @ApiProperty({
    description: 'Fastest time to hire (days)',
    example: 10.0,
  })
  fastest: number;

  @ApiProperty({
    description: 'Slowest time to hire (days)',
    example: 45.0,
  })
  slowest: number;

  @ApiProperty({
    description: 'Date range used for calculations',
    example: {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    },
  })
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export class SourceEffectivenessDto {
  @ApiProperty({
    description: 'Application source',
    example: 'LINKEDIN',
  })
  source: string;

  @ApiProperty({
    description: 'Total applications from this source',
    example: 50,
  })
  totalApplications: number;

  @ApiProperty({
    description: 'Number of hires from this source',
    example: 8,
  })
  hires: number;

  @ApiProperty({
    description: 'Success/conversion rate (%)',
    example: 16.0,
  })
  successRate: number;

  @ApiProperty({
    description: 'Average time to hire from this source (days)',
    example: 22.5,
  })
  averageTimeToHire: number;

  @ApiProperty({
    description: 'Average quality score (if AI scoring enabled)',
    example: 7.8,
    required: false,
  })
  averageQualityScore?: number;

  @ApiProperty({
    description: 'Cost per hire from this source (if cost data available)',
    example: 1500.0,
    required: false,
  })
  costPerHire?: number;
}

export class StageDurationDto {
  @ApiProperty({
    description: 'Stage type',
    example: 'INTERVIEW',
  })
  stageType: string;

  @ApiProperty({
    description: 'Average duration in this stage (days)',
    example: 5.2,
  })
  averageDuration: number;

  @ApiProperty({
    description: 'Median duration in this stage (days)',
    example: 4.0,
  })
  medianDuration: number;

  @ApiProperty({
    description: 'Number of candidates who completed this stage',
    example: 25,
  })
  completedCount: number;

  @ApiProperty({
    description: 'Number of candidates currently in this stage',
    example: 8,
  })
  currentCount: number;

  @ApiProperty({
    description: 'Fastest completion time (days)',
    example: 1.0,
  })
  fastest: number;

  @ApiProperty({
    description: 'Slowest completion time (days)',
    example: 15.0,
  })
  slowest: number;
}
