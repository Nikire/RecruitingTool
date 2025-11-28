import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  TimeMetricsDto,
  ConversionMetricsDto,
  VolumeMetricsDto,
  OverviewMetricsDto,
  SourceAnalyticsDto,
  DateRangeQueryDto,
  PipelineFunnelDto,
  TimeToHireDto,
  SourceEffectivenessDto,
  StageDurationDto,
} from './dto/analytics.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('overview')
  @ApiOperation({
    summary: 'Get overview of all recruiting metrics',
    description: 'Returns time metrics, conversion metrics, and volume metrics. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns overview metrics including time, conversion, and volume data',
    type: OverviewMetricsDto,
  })
  getOverviewMetrics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<OverviewMetricsDto> {
    return this.analyticsService.getOverviewMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('time-metrics')
  @ApiOperation({
    summary: 'Get time-based recruiting metrics',
    description: 'Returns average time to hire, time to first interview, and average time per stage. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns time-based metrics',
    type: TimeMetricsDto,
  })
  getTimeMetrics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<TimeMetricsDto> {
    return this.analyticsService.getTimeMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('conversion')
  @ApiOperation({
    summary: 'Get conversion funnel metrics',
    description: 'Returns conversion rates through each stage of the hiring funnel. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns conversion funnel metrics',
    type: ConversionMetricsDto,
  })
  getConversionMetrics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<ConversionMetricsDto> {
    return this.analyticsService.getConversionMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('volume')
  @ApiOperation({
    summary: 'Get volume and count metrics',
    description: 'Returns total applications, hires, active processes, and breakdown by source. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns volume metrics',
    type: VolumeMetricsDto,
  })
  getVolumeMetrics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<VolumeMetricsDto> {
    return this.analyticsService.getVolumeMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('sources')
  @ApiOperation({
    summary: 'Get analytics breakdown by application source',
    description: 'Returns count, conversion rate, and average time to hire for each source. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns source analytics',
    type: [SourceAnalyticsDto],
  })
  getSourceAnalytics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<SourceAnalyticsDto[]> {
    return this.analyticsService.getSourceAnalytics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('pipeline')
  @ApiOperation({
    summary: 'Get pipeline funnel data with conversion rates',
    description: 'Returns detailed funnel analysis with stage-by-stage conversion and drop-off rates. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns pipeline funnel metrics',
    type: PipelineFunnelDto,
  })
  getPipelineFunnel(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<PipelineFunnelDto> {
    return this.analyticsService.getPipelineFunnel(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('time-to-hire')
  @ApiOperation({
    summary: 'Get time-to-hire metrics with trend data',
    description: 'Returns comprehensive time-to-hire analysis including trends, median, fastest, and slowest times. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns time-to-hire analytics',
    type: TimeToHireDto,
  })
  getTimeToHireAnalytics(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<TimeToHireDto> {
    return this.analyticsService.getTimeToHireAnalytics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('source-effectiveness')
  @ApiOperation({
    summary: 'Get source effectiveness with success rates',
    description: 'Returns detailed source analysis including success rates, time to hire, and quality scores. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns source effectiveness metrics',
    type: [SourceEffectivenessDto],
  })
  getSourceEffectiveness(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<SourceEffectivenessDto[]> {
    return this.analyticsService.getSourceEffectiveness(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('stage-duration')
  @ApiOperation({
    summary: 'Get stage duration analysis',
    description: 'Returns average time spent in each stage with bottleneck identification. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns stage duration metrics',
    type: [StageDurationDto],
  })
  getStageDuration(@Query() queryDto: DateRangeQueryDto, @CurrentUser() currentUser: User): Promise<StageDurationDto[]> {
    return this.analyticsService.getStageDuration(queryDto, currentUser);
  }
}
