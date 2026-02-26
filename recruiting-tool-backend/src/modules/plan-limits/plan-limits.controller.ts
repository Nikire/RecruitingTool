import { Body, Controller, Get, Logger, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { PlanLimitsService } from './plan-limits.service';
import { PlanLimitListResponseDto, PlanLimitResponseDto, UpdatePlanLimitDto } from './dto/plan-limit.dto';

@ApiTags('Admin - Plan Limits')
@ApiBearerAuth()
@Controller('admin/plan-limits')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth([RolesType.SUPER_ADMIN])
export class PlanLimitsController {
  private readonly logger = new Logger(PlanLimitsController.name);

  constructor(private readonly planLimitsService: PlanLimitsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all plan limits (SUPER_ADMIN only)',
    description: 'Returns all plan limit records stored in the database, sorted by planType. Use this to view and manage subscription plan configurations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan limits retrieved successfully',
    type: PlanLimitListResponseDto,
  })
  findAll(): Promise<PlanLimitListResponseDto> {
    this.logger.log('Admin: listing all plan limits');
    return this.planLimitsService.findAll();
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Update a plan limit by UID (SUPER_ADMIN only)',
    description: 'Partially updates the limit values for a subscription plan. All fields are optional — only provided fields will be updated.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The UID of the plan limit record to update',
    example: 'clz1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan limit updated successfully',
    type: PlanLimitResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan limit not found',
  })
  update(@Param('uid') uid: string, @Body() dto: UpdatePlanLimitDto): Promise<PlanLimitResponseDto> {
    this.logger.log(`Admin: updating plan limit uid="${uid}"`);
    return this.planLimitsService.update(uid, dto);
  }
}
