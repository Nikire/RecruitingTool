import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CustomPlansService } from './custom-plans.service';
import { CreateCustomPlanDto, UpdateCustomPlanDto, CustomPlanResponseDto, CustomPlanListResponseDto, StripeSyncResponseDto, StripeConfigResponseDto } from './dto/custom-plan.dto';

@ApiTags('Admin - Custom Plans')
@ApiBearerAuth()
@Controller('admin/custom-plans')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth([RolesType.SUPER_ADMIN])
export class CustomPlansController {
  private readonly logger = new Logger(CustomPlansController.name);

  constructor(private readonly customPlansService: CustomPlansService) {}

  // ---------------------------------------------------------------------------
  // List all custom plans
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({
    summary: 'List all custom plans (SUPER_ADMIN only)',
    description: 'Returns all custom plan records with their assigned company information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom plans retrieved successfully',
    type: CustomPlanListResponseDto,
  })
  findAll(): Promise<CustomPlanListResponseDto> {
    this.logger.log('Admin: listing all custom plans');
    return this.customPlansService.findAll();
  }

  // ---------------------------------------------------------------------------
  // Stripe configuration (test/live mode detection)
  // ---------------------------------------------------------------------------

  @Get('stripe-config')
  @ApiOperation({
    summary: 'Get Stripe configuration (SUPER_ADMIN only)',
    description: 'Returns whether Stripe is enabled and whether the key is a test key. Used by the frontend to build correct Stripe Dashboard URLs.',
  })
  @ApiResponse({ status: 200, description: 'Stripe config retrieved', type: StripeConfigResponseDto })
  getStripeConfig(): StripeConfigResponseDto {
    return this.customPlansService.getStripeConfig();
  }

  // ---------------------------------------------------------------------------
  // Get a single custom plan
  // ---------------------------------------------------------------------------

  @Get(':uid')
  @ApiOperation({ summary: 'Get a single custom plan by UID (SUPER_ADMIN only)' })
  @ApiParam({ name: 'uid', description: 'UID of the custom plan' })
  @ApiResponse({ status: 200, description: 'Custom plan retrieved', type: CustomPlanResponseDto })
  @ApiResponse({ status: 404, description: 'Custom plan not found' })
  findOne(@Param('uid') uid: string): Promise<CustomPlanResponseDto> {
    this.logger.log(`Admin: fetching custom plan uid="${uid}"`);
    return this.customPlansService.findOne(uid);
  }

  // ---------------------------------------------------------------------------
  // Create a custom plan
  // ---------------------------------------------------------------------------

  @Post()
  @ApiOperation({
    summary: 'Create a custom plan (SUPER_ADMIN only)',
    description: 'Creates a new custom plan. Optionally assign it to a company via companyUid.',
  })
  @ApiResponse({ status: 201, description: 'Custom plan created successfully', type: CustomPlanResponseDto })
  @ApiResponse({ status: 404, description: 'Company not found (if companyUid is provided)' })
  create(@Body() dto: CreateCustomPlanDto): Promise<CustomPlanResponseDto> {
    this.logger.log(`Admin: creating custom plan name="${dto.name}"`);
    return this.customPlansService.create(dto);
  }

  // ---------------------------------------------------------------------------
  // Update a custom plan
  // ---------------------------------------------------------------------------

  @Patch(':uid')
  @ApiOperation({ summary: 'Update a custom plan by UID (SUPER_ADMIN only)' })
  @ApiParam({ name: 'uid', description: 'UID of the custom plan to update' })
  @ApiResponse({ status: 200, description: 'Custom plan updated successfully', type: CustomPlanResponseDto })
  @ApiResponse({ status: 404, description: 'Custom plan not found' })
  update(@Param('uid') uid: string, @Body() dto: UpdateCustomPlanDto): Promise<CustomPlanResponseDto> {
    this.logger.log(`Admin: updating custom plan uid="${uid}"`);
    return this.customPlansService.update(uid, dto);
  }

  // ---------------------------------------------------------------------------
  // Delete a custom plan
  // ---------------------------------------------------------------------------

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom plan by UID (SUPER_ADMIN only)' })
  @ApiParam({ name: 'uid', description: 'UID of the custom plan to delete' })
  @ApiResponse({ status: 204, description: 'Custom plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Custom plan not found' })
  async remove(@Param('uid') uid: string): Promise<void> {
    this.logger.log(`Admin: deleting custom plan uid="${uid}"`);
    return this.customPlansService.remove(uid);
  }

  // ---------------------------------------------------------------------------
  // Assign plan to a company
  // ---------------------------------------------------------------------------

  @Post(':uid/assign/:companyUid')
  @ApiOperation({
    summary: 'Assign a custom plan to a company (SUPER_ADMIN only)',
    description: 'Links the custom plan to the specified company.',
  })
  @ApiParam({ name: 'uid', description: 'UID of the custom plan' })
  @ApiParam({ name: 'companyUid', description: 'UID of the company to assign the plan to' })
  @ApiResponse({ status: 200, description: 'Custom plan assigned to company', type: CustomPlanResponseDto })
  @ApiResponse({ status: 404, description: 'Custom plan or company not found' })
  assignToCompany(@Param('uid') uid: string, @Param('companyUid') companyUid: string): Promise<CustomPlanResponseDto> {
    this.logger.log(`Admin: assigning custom plan uid="${uid}" to company uid="${companyUid}"`);
    return this.customPlansService.assignToCompany(uid, companyUid);
  }

  // ---------------------------------------------------------------------------
  // Sync to Stripe
  // ---------------------------------------------------------------------------

  @Post(':uid/sync-stripe')
  @ApiOperation({
    summary: 'Sync a custom plan to Stripe (SUPER_ADMIN only)',
    description:
      'Creates a Stripe Product and Price for the custom plan and stores the resulting IDs on the record. ' +
      'Idempotent: reuses existing product if already created, but always creates a new price.',
  })
  @ApiParam({ name: 'uid', description: 'UID of the custom plan to sync' })
  @ApiResponse({ status: 200, description: 'Stripe product and price created', type: StripeSyncResponseDto })
  @ApiResponse({ status: 400, description: 'Stripe is not configured on this server' })
  @ApiResponse({ status: 404, description: 'Custom plan not found' })
  syncToStripe(@Param('uid') uid: string): Promise<StripeSyncResponseDto> {
    this.logger.log(`Admin: syncing custom plan uid="${uid}" to Stripe`);
    return this.customPlansService.syncToStripe(uid);
  }
}
