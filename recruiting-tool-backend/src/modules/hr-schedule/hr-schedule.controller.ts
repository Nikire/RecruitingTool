import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HRScheduleService } from './hr-schedule.service';
import { CreateHRScheduleDto, UpdateHRScheduleDto, HRScheduleResponseDto } from './dto/hr-schedule.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { RolesType } from '@prisma/client';
import { UserResponseDto } from '../users/dto/users.dto';

@ApiTags('HR Schedule')
@ApiBearerAuth()
@Controller('hr-schedule')
export class HRScheduleController {
  constructor(private readonly hrScheduleService: HRScheduleService) {}

  @Get('me')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: "Get current user's schedule" })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully', type: [HRScheduleResponseDto] })
  async getMySchedule(@CurrentUser() user: UserResponseDto): Promise<HRScheduleResponseDto[]> {
    return this.hrScheduleService.getMySchedule(user.uid);
  }

  @Post()
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({ status: 201, description: 'Schedule slot created successfully', type: HRScheduleResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid time format or overlapping schedule' })
  async createScheduleSlot(@CurrentUser() user: UserResponseDto, @Body() dto: CreateHRScheduleDto): Promise<HRScheduleResponseDto> {
    return this.hrScheduleService.createScheduleSlot(user.uid, dto);
  }

  @Put(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Update schedule slot' })
  @ApiParam({ name: 'uid', description: 'Schedule UID' })
  @ApiResponse({ status: 200, description: 'Schedule slot updated successfully', type: HRScheduleResponseDto })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 403, description: "Cannot update another user's schedule" })
  async updateScheduleSlot(@CurrentUser() user: UserResponseDto, @Param('uid') uid: string, @Body() dto: UpdateHRScheduleDto): Promise<HRScheduleResponseDto> {
    return this.hrScheduleService.updateScheduleSlot(uid, user.uid, dto);
  }

  @Delete(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete schedule slot' })
  @ApiParam({ name: 'uid', description: 'Schedule UID' })
  @ApiResponse({ status: 200, description: 'Schedule slot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 403, description: "Cannot delete another user's schedule" })
  async deleteScheduleSlot(@CurrentUser() user: UserResponseDto, @Param('uid') uid: string): Promise<{ message: string }> {
    await this.hrScheduleService.deleteScheduleSlot(uid, user.uid);
    return { message: 'Schedule slot deleted successfully' };
  }

  @Get('user/:uid')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: "Get user's schedule (ADMIN only)" })
  @ApiParam({ name: 'uid', description: 'User UID' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully', type: [HRScheduleResponseDto] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getScheduleByUserUid(@Param('uid') uid: string): Promise<HRScheduleResponseDto[]> {
    return this.hrScheduleService.getScheduleByUserUid(uid);
  }

  @Get('user/:uid/available')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get available time slots for specific date' })
  @ApiParam({ name: 'uid', description: 'User UID' })
  @ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2025-01-15' })
  @ApiResponse({ status: 200, description: 'Available slots retrieved successfully', type: [HRScheduleResponseDto] })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAvailableSlots(@Param('uid') uid: string, @Query('date') date: string): Promise<HRScheduleResponseDto[]> {
    return this.hrScheduleService.getAvailableSlots(uid, date);
  }
}
