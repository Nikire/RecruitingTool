import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanyCalendarSettingsService } from './company-calendar-settings.service';
import { UpdateCompanyCalendarSettingsDto, CompanyCalendarSettingsResponseDto } from './dto/company-calendar-settings.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('Company Calendar Settings')
@Controller('company-calendar-settings')
export class CompanyCalendarSettingsController {
  constructor(private readonly companyCalendarSettingsService: CompanyCalendarSettingsService) {}

  @Get()
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiOperation({ summary: 'Get calendar booking settings for the current company' })
  @ApiResponse({
    status: 200,
    description: 'Calendar settings retrieved successfully',
    type: CompanyCalendarSettingsResponseDto,
  })
  getSettings(@CurrentUser() currentUser: any): Promise<CompanyCalendarSettingsResponseDto> {
    return this.companyCalendarSettingsService.getSettings(currentUser.companyId);
  }

  @Put()
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.COMPANY_OWNER])
  @ApiOperation({ summary: 'Update calendar booking settings for the current company' })
  @ApiResponse({
    status: 200,
    description: 'Calendar settings updated successfully',
    type: CompanyCalendarSettingsResponseDto,
  })
  updateSettings(@Body() dto: UpdateCompanyCalendarSettingsDto, @CurrentUser() currentUser: any): Promise<CompanyCalendarSettingsResponseDto> {
    return this.companyCalendarSettingsService.updateSettings(currentUser.companyId, dto);
  }
}
