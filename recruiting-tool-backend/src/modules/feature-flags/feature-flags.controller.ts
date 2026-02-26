import { Body, Controller, Get, Logger, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagListResponseDto, FeatureFlagResponseDto, UpdateFeatureFlagDto } from './dto/feature-flag.dto';

@ApiTags('Admin - Feature Flags')
@ApiBearerAuth()
@Controller('admin/feature-flags')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth([RolesType.SUPER_ADMIN])
export class FeatureFlagsController {
  private readonly logger = new Logger(FeatureFlagsController.name);

  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all feature flags (SUPER_ADMIN only)',
    description:
      'Returns all feature flag records stored in the database, ordered by key then planType. ' +
      'Optionally filter by planType query parameter (e.g. ?planType=FREE).',
  })
  @ApiQuery({
    name: 'planType',
    required: false,
    description: 'Filter flags by plan type (FREE, STARTER, PROFESSIONAL, ENTERPRISE)',
    example: 'FREE',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flags retrieved successfully',
    type: FeatureFlagListResponseDto,
  })
  findAll(@Query('planType') planType?: string): Promise<FeatureFlagListResponseDto> {
    if (planType) {
      this.logger.log(`Admin: listing feature flags for planType="${planType}"`);
      return this.featureFlagsService.findByPlanType(planType);
    }

    this.logger.log('Admin: listing all feature flags');
    return this.featureFlagsService.findAll();
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Toggle a feature flag by UID (SUPER_ADMIN only)',
    description: 'Updates the enabled state of a single feature flag record identified by its UID.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The UID of the feature flag record to update',
    example: 'clz1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature flag updated successfully',
    type: FeatureFlagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feature flag not found',
  })
  toggle(@Param('uid') uid: string, @Body() dto: UpdateFeatureFlagDto): Promise<FeatureFlagResponseDto> {
    this.logger.log(`Admin: toggling feature flag uid="${uid}" to enabled=${dto.enabled}`);
    return this.featureFlagsService.toggle(uid, dto);
  }
}
