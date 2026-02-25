import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotaService } from './quota.service';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { QuotaStatusDto, PlanLimitsResponseDto } from './dto/quota.dto';

@ApiTags('Quota')
@Controller('quota')
export class QuotaController {
  private readonly logger = new Logger(QuotaController.name);

  constructor(private readonly quotaService: QuotaService) {}

  @Get('plan-limits')
  @ApiOperation({
    summary: 'Get all plan limits (public)',
    description: 'Returns the limits for all subscription tiers (FREE, PROFESSIONAL, ENTERPRISE). No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan limits retrieved successfully',
    type: PlanLimitsResponseDto,
  })
  getPlanLimits(): PlanLimitsResponseDto {
    this.logger.log('Getting public plan limits');
    return this.quotaService.getPlanLimits();
  }

  @Get()
  @Auth([RolesType.USER, RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get quota status',
    description: 'Returns current usage and limits for all resources based on subscription plan',
  })
  @ApiResponse({
    status: 200,
    description: 'Quota status retrieved successfully',
    type: QuotaStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async getQuotaStatus(@CurrentUser() user: any): Promise<QuotaStatusDto> {
    this.logger.log(`Getting quota status for company ${user.companyId}`);
    return this.quotaService.getCompanyQuota(user.companyId);
  }
}
