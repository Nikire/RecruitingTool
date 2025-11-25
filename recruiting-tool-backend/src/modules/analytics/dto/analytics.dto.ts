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
