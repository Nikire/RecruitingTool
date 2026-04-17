import { Controller, Get, Patch, Post, Body, Query } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsResponseDto, UpdateSystemSettingsDto, TestEmailResponseDto, EmailStatsResponseDto, PaginatedEmailLogsDto } from './dto/system-settings.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

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

  @Get('email-stats')
  @ApiOperation({ summary: 'Get email statistics - SUPER_ADMIN role required' })
  @ApiResponse({ status: 200, type: EmailStatsResponseDto })
  getEmailStats(): Promise<EmailStatsResponseDto> {
    return this.systemSettingsService.getEmailStats();
  }

  @Get('email-logs')
  @ApiOperation({ summary: 'Get paginated email logs - SUPER_ADMIN role required' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['SENT', 'FAILED'] })
  @ApiQuery({ name: 'emailType', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedEmailLogsDto })
  getEmailLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('emailType') emailType?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedEmailLogsDto> {
    return this.systemSettingsService.getEmailLogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status || undefined,
      emailType || undefined,
      search || undefined,
    );
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
