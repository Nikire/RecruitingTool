import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  TimeMetricsDto,
  ConversionMetricsDto,
  VolumeMetricsDto,
  OverviewMetricsDto,
  SourceAnalyticsDto,
  DateRangeQueryDto,
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
    description:
      'Returns time metrics, conversion metrics, and volume metrics. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns overview metrics including time, conversion, and volume data',
    type: OverviewMetricsDto,
  })
  getOverviewMetrics(
    @Query() queryDto: DateRangeQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<OverviewMetricsDto> {
    return this.analyticsService.getOverviewMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('time-metrics')
  @ApiOperation({
    summary: 'Get time-based recruiting metrics',
    description:
      'Returns average time to hire, time to first interview, and average time per stage. SUPER_ADMIN can filter by company.',
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
    description:
      'Returns conversion rates through each stage of the hiring funnel. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns conversion funnel metrics',
    type: ConversionMetricsDto,
  })
  getConversionMetrics(
    @Query() queryDto: DateRangeQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<ConversionMetricsDto> {
    return this.analyticsService.getConversionMetrics(queryDto, currentUser);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('volume')
  @ApiOperation({
    summary: 'Get volume and count metrics',
    description:
      'Returns total applications, hires, active processes, and breakdown by source. SUPER_ADMIN can filter by company.',
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
    description:
      'Returns count, conversion rate, and average time to hire for each source. SUPER_ADMIN can filter by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns source analytics',
    type: [SourceAnalyticsDto],
  })
  getSourceAnalytics(
    @Query() queryDto: DateRangeQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<SourceAnalyticsDto[]> {
    return this.analyticsService.getSourceAnalytics(queryDto, currentUser);
  }
}
