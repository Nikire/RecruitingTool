import { Controller, Get, Put, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuotaType, RolesType } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { AIQuotaService } from './ai-quota.service';
import { AIQuotaResponseDto, AIUsageLogResponseDto, SetQuotaLimitDto, UseQuotaDto, GetUsageHistoryDto } from './dto/ai-quota.dto';

@ApiTags('AI Quota')
@ApiBearerAuth()
@Controller('ai-quota')
export class AIQuotaController {
  constructor(private readonly aiQuotaService: AIQuotaService) {}

  @Get('me')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get own company quotas' })
  @ApiResponse({
    status: 200,
    description: 'Returns all quotas for the authenticated user company',
    type: [AIQuotaResponseDto],
  })
  async getMyCompanyQuotas(@CurrentUser() user: any): Promise<AIQuotaResponseDto[]> {
    return this.aiQuotaService.getAllQuotas(user.company.uid);
  }

  @Get('me/:quotaType')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get own company quota by type' })
  @ApiParam({
    name: 'quotaType',
    enum: QuotaType,
    description: 'Type of AI quota',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns quota status for specific type',
    type: AIQuotaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async getMyCompanyQuota(@CurrentUser() user: any, @Param('quotaType') quotaType: QuotaType): Promise<AIQuotaResponseDto> {
    return this.aiQuotaService.getQuota(user.company.uid, quotaType);
  }

  @Post('use')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use quota (internal use by AI services)' })
  @ApiResponse({
    status: 200,
    description: 'Quota used successfully',
    type: AIQuotaResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient quota' })
  @ApiResponse({ status: 404, description: 'Quota not found' })
  async useQuota(@CurrentUser() user: any, @Body() dto: UseQuotaDto): Promise<AIQuotaResponseDto> {
    return this.aiQuotaService.useQuota(user.company.uid, user.uid, dto);
  }

  @Get('me/usage/history')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get own company usage history' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiQuery({
    name: 'operation',
    enum: QuotaType,
    required: false,
    description: 'Filter by operation type',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns usage history',
    type: [AIUsageLogResponseDto],
  })
  async getMyCompanyUsageHistory(@CurrentUser() user: any, @Query() query: GetUsageHistoryDto): Promise<AIUsageLogResponseDto[]> {
    return this.aiQuotaService.getUsageHistory(user.company.uid, query.startDate, query.endDate, query.operation);
  }

  @Get(':companyUid')
  @Auth([RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get company quotas (Super Admin only)',
    description: 'Get all quotas for a specific company',
  })
  @ApiParam({
    name: 'companyUid',
    description: 'Company UID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all quotas for the company',
    type: [AIQuotaResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyQuotas(@Param('companyUid') companyUid: string): Promise<AIQuotaResponseDto[]> {
    return this.aiQuotaService.getAllQuotas(companyUid);
  }

  @Get(':companyUid/:quotaType')
  @Auth([RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get company quota by type (Super Admin only)',
  })
  @ApiParam({
    name: 'companyUid',
    description: 'Company UID',
  })
  @ApiParam({
    name: 'quotaType',
    enum: QuotaType,
    description: 'Type of AI quota',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns quota status',
    type: AIQuotaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Company or quota not found' })
  async getCompanyQuota(@Param('companyUid') companyUid: string, @Param('quotaType') quotaType: QuotaType): Promise<AIQuotaResponseDto> {
    return this.aiQuotaService.getQuota(companyUid, quotaType);
  }

  @Put(':companyUid')
  @Auth([RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Set quota limit (Super Admin only)',
    description: 'Create or update quota limit for a company',
  })
  @ApiParam({
    name: 'companyUid',
    description: 'Company UID',
  })
  @ApiResponse({
    status: 200,
    description: 'Quota limit updated successfully',
    type: AIQuotaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async setQuotaLimit(@Param('companyUid') companyUid: string, @Body() dto: SetQuotaLimitDto): Promise<AIQuotaResponseDto> {
    return this.aiQuotaService.setQuotaLimit(companyUid, dto);
  }

  @Get(':companyUid/usage/history')
  @Auth([RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get company usage history (Super Admin only)',
  })
  @ApiParam({
    name: 'companyUid',
    description: 'Company UID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiQuery({
    name: 'operation',
    enum: QuotaType,
    required: false,
    description: 'Filter by operation type',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns usage history',
    type: [AIUsageLogResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyUsageHistory(@Param('companyUid') companyUid: string, @Query() query: GetUsageHistoryDto): Promise<AIUsageLogResponseDto[]> {
    return this.aiQuotaService.getUsageHistory(companyUid, query.startDate, query.endDate, query.operation);
  }
}
