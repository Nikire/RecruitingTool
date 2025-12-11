import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferenceResponseDto, UpdateNotificationPreferencesDto } from './dto';
import { AuthGuard } from '../shared/modules/auth/guards/auth.guard';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly notificationPreferencesService: NotificationPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences for current user' })
  @ApiResponse({
    status: 200,
    description: 'User notification preferences',
    type: NotificationPreferenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPreferences(@CurrentUser() currentUser: User): Promise<NotificationPreferenceResponseDto> {
    return this.notificationPreferencesService.getPreferences(currentUser.uid);
  }

  @Patch()
  @ApiOperation({ summary: 'Update notification preferences for current user' })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences updated successfully',
    type: NotificationPreferenceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(@CurrentUser() currentUser: User, @Body() updateDto: UpdateNotificationPreferencesDto): Promise<NotificationPreferenceResponseDto> {
    return this.notificationPreferencesService.updatePreferences(currentUser.uid, updateDto);
  }
}
