import { Body, Controller, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  AdminStatsResponseDto,
  UserStatsResponseDto,
  CompanyStatsResponseDto,
  RecentActivityResponseDto,
  RevenueStatsResponseDto,
  QuotaOverviewResponseDto,
  CompanyHealthResponseDto,
  TrialOverviewResponseDto,
  ChangePlanDto,
  ChangeStatusDto,
  ExtendTrialDto,
  SubscriptionAuditLogItemDto,
  UpdatedSubscriptionDto,
  DemoBookingAdminItemDto,
  DemoBookingListResponseDto,
  SetDemoOutcomeDto,
  LinkDemoProspectDto,
} from './dto/admin-stats.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth(['ADMIN'])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get full admin dashboard overview statistics - ADMIN role required',
    description: 'Returns comprehensive statistics including users, companies, candidates, job positions, hiring processes, and recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns full overview statistics',
    type: AdminStatsResponseDto,
  })
  getOverviewStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getOverviewStats();
  }

  @Get('stats/users')
  @ApiOperation({
    summary: 'Get user statistics - ADMIN role required',
    description: 'Returns detailed user statistics including total users, active/inactive counts, users by role, and new users this month',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user statistics',
    type: UserStatsResponseDto,
  })
  getUserStats(): Promise<UserStatsResponseDto> {
    return this.adminService.getUserStats();
  }

  @Get('stats/companies')
  @ApiOperation({
    summary: 'Get company statistics - ADMIN role required',
    description: 'Returns company statistics including total companies and active companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns company statistics',
    type: CompanyStatsResponseDto,
  })
  getCompanyStats(): Promise<CompanyStatsResponseDto> {
    return this.adminService.getCompanyStats();
  }

  @Get('stats/activity')
  @ApiOperation({
    summary: 'Get recent activity logs - ADMIN role required',
    description: 'Returns recent user login activity (last 10 logins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns recent activity logs',
    type: RecentActivityResponseDto,
  })
  getRecentActivity(): Promise<RecentActivityResponseDto> {
    return this.adminService.getRecentActivity();
  }

  @Get('revenue/stats')
  @ApiOperation({
    summary: 'Get revenue dashboard statistics - ADMIN role required',
    description: 'Returns MRR, subscription status breakdown, plan distribution and monthly signups for the last 6 months',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns revenue statistics',
    type: RevenueStatsResponseDto,
  })
  getRevenueStats(): Promise<RevenueStatsResponseDto> {
    return this.adminService.getRevenueStats();
  }

  @Get('quota/overview')
  @ApiOperation({
    summary: 'Get quota usage overview for all companies - ADMIN role required',
    description: 'Returns paginated list of companies with their real-time resource consumption vs plan limits',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'plan', required: false, type: String, description: 'Filter by plan: FREE, PROFESSIONAL, ENTERPRISE' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by health status: OK, WARNING, CRITICAL, EXCEEDED' })
  @ApiResponse({
    status: 200,
    description: 'Returns quota usage overview',
    type: QuotaOverviewResponseDto,
  })
  getQuotaOverview(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
  ): Promise<QuotaOverviewResponseDto> {
    return this.adminService.getQuotaOverview(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, plan || undefined, status || undefined);
  }

  @Get('health/companies')
  @ApiOperation({
    summary: 'Get company health (churn-risk) scores - ADMIN role required',
    description: 'Returns paginated list of companies with engagement-based health scores and churn-risk tiers, sorted by health score ascending (most at-risk first)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'riskTier', required: false, type: String, description: 'Filter by risk tier: HEALTHY, AT_RISK, CHURNING, CRITICAL' })
  @ApiResponse({
    status: 200,
    description: 'Returns company health scores and churn-risk data',
    type: CompanyHealthResponseDto,
  })
  getCompanyHealthScores(@Query('page') page?: string, @Query('limit') limit?: string, @Query('riskTier') riskTier?: string): Promise<CompanyHealthResponseDto> {
    return this.adminService.getCompanyHealthScores(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, riskTier || undefined);
  }

  @Get('trials/overview')
  @ApiOperation({
    summary: 'Get trial & conversion tracker overview - ADMIN role required',
    description: 'Returns paginated list of FREE/TRIALING companies with activation depth metrics to identify who is ready to convert to a paid plan',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'readiness', required: false, type: String, description: 'Filter by conversion readiness: HOT, WARM, COLD' })
  @ApiQuery({ name: 'plan', required: false, type: String, description: 'Filter by plan type: FREE, TRIALING' })
  @ApiResponse({
    status: 200,
    description: 'Returns trial companies with activation scores and conversion readiness',
    type: TrialOverviewResponseDto,
  })
  getTrialOverview(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('readiness') readiness?: string,
    @Query('plan') plan?: string,
  ): Promise<TrialOverviewResponseDto> {
    return this.adminService.getTrialOverview(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, readiness || undefined, plan || undefined);
  }

  // ─── Subscription Lifecycle Manager ─────────────────────────────────────────

  @Patch('subscriptions/:companyUid/plan')
  @ApiOperation({
    summary: 'Change subscription plan for a company - ADMIN role required',
    description: 'Updates the subscription plan and writes an audit log entry',
  })
  @ApiResponse({ status: 200, description: 'Plan updated', type: UpdatedSubscriptionDto })
  changePlan(@Param('companyUid') companyUid: string, @Body() dto: ChangePlanDto, @Request() req: { user: { id: number } }): Promise<UpdatedSubscriptionDto> {
    return this.adminService.changePlan(companyUid, dto, req.user.id);
  }

  @Patch('subscriptions/:companyUid/status')
  @ApiOperation({
    summary: 'Change subscription status for a company - ADMIN role required',
    description: 'Updates the subscription status and writes an audit log entry',
  })
  @ApiResponse({ status: 200, description: 'Status updated', type: UpdatedSubscriptionDto })
  changeStatus(@Param('companyUid') companyUid: string, @Body() dto: ChangeStatusDto, @Request() req: { user: { id: number } }): Promise<UpdatedSubscriptionDto> {
    return this.adminService.changeStatus(companyUid, dto, req.user.id);
  }

  @Post('subscriptions/:companyUid/extend-trial')
  @ApiOperation({
    summary: 'Extend trial period for a company - ADMIN role required',
    description: 'Extends the subscription trial end date by the specified number of days and writes an audit log entry',
  })
  @ApiResponse({ status: 201, description: 'Trial extended', type: UpdatedSubscriptionDto })
  extendTrial(@Param('companyUid') companyUid: string, @Body() dto: ExtendTrialDto, @Request() req: { user: { id: number } }): Promise<UpdatedSubscriptionDto> {
    return this.adminService.extendTrial(companyUid, dto, req.user.id);
  }

  @Get('subscriptions/:companyUid/audit-log')
  @ApiOperation({
    summary: 'Get subscription audit log for a company - ADMIN role required',
    description: 'Returns all subscription lifecycle audit log entries for the specified company, ordered by timestamp desc',
  })
  @ApiResponse({ status: 200, description: 'Returns audit log entries', type: [SubscriptionAuditLogItemDto] })
  getSubscriptionAuditLog(@Param('companyUid') companyUid: string): Promise<SubscriptionAuditLogItemDto[]> {
    return this.adminService.getSubscriptionAuditLog(companyUid);
  }

  // ─── Demo Booking Manager ─────────────────────────────────────────────────

  @Get('demos')
  @ApiOperation({
    summary: 'Get paginated list of demo bookings - ADMIN role required',
    description: 'Returns paginated demo booking tokens with outcome tracking and summary counts',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'outcome', required: false, type: String, description: 'Filter by outcome: PENDING|COMPLETED|NO_SHOW|RESCHEDULED|CANCELED' })
  @ApiResponse({ status: 200, description: 'Returns paginated demo bookings with summary', type: DemoBookingListResponseDto })
  getDemoBookings(@Query('page') page?: string, @Query('limit') limit?: string, @Query('outcome') outcome?: string): Promise<DemoBookingListResponseDto> {
    return this.adminService.getDemoBookings(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, outcome || undefined);
  }

  @Patch('demos/:uid/outcome')
  @ApiOperation({
    summary: 'Set outcome for a demo booking - ADMIN role required',
    description: 'Updates the outcome and optional notes for a specific demo booking',
  })
  @ApiResponse({ status: 200, description: 'Returns updated demo booking item', type: DemoBookingAdminItemDto })
  setDemoOutcome(@Param('uid') uid: string, @Body() dto: SetDemoOutcomeDto): Promise<DemoBookingAdminItemDto> {
    return this.adminService.setDemoOutcome(uid, dto);
  }

  @Patch('demos/:uid/link-prospect')
  @ApiOperation({
    summary: 'Link a ProspectCompany to a demo booking - ADMIN role required',
    description: 'Associates an existing ProspectCompany record with a demo booking via UID',
  })
  @ApiResponse({ status: 200, description: 'Returns updated demo booking item', type: DemoBookingAdminItemDto })
  linkDemoProspect(@Param('uid') uid: string, @Body() dto: LinkDemoProspectDto): Promise<DemoBookingAdminItemDto> {
    return this.adminService.linkDemoProspect(uid, dto);
  }
}
