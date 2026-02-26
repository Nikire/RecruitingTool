import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsResponseDto, UpdateSystemSettingsDto, TestEmailResponseDto } from './dto/system-settings.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

@ApiTags('System Settings')
@ApiBearerAuth()
@Controller('admin/system-settings')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiForbiddenResponse({
  description: 'Forbidden - SUPER_ADMIN role required',
})
@Auth(['SUPER_ADMIN'])
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get system settings - SUPER_ADMIN role required',
    description: 'Returns current system configuration including email, AI, storage, rate limiting, backup, and app settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns system settings',
    type: SystemSettingsResponseDto,
  })
  getSettings(): Promise<SystemSettingsResponseDto> {
    return this.systemSettingsService.getSettings();
  }

  @Patch()
  @ApiOperation({
    summary: 'Update system settings - SUPER_ADMIN role required',
    description: 'Update safe system settings. Currently supports toggling applicationEmailsEnabled.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns updated system settings',
    type: SystemSettingsResponseDto,
  })
  updateSettings(@Body() dto: UpdateSystemSettingsDto): Promise<SystemSettingsResponseDto> {
    return this.systemSettingsService.updateSettings(dto);
  }

  @Post('test-email')
  @ApiOperation({
    summary: 'Send a test email - SUPER_ADMIN role required',
    description: "Sends a test connection email to the SUPER_ADMIN's email address to verify the email configuration",
  })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
    type: TestEmailResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to send test email - check SMTP configuration',
  })
  testEmail(@CurrentUser() currentUser: { email: string }): Promise<TestEmailResponseDto> {
    return this.systemSettingsService.testEmailConnection(currentUser.email);
  }
}
