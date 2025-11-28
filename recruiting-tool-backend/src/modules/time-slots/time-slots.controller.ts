import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TimeSlotsService } from './time-slots.service';
import { GenerateTimeSlotsDto, GenerateCustomTimeSlotsDto, SelectTimeSlotDto, TimeSlotResponseDto, BookingTokenResponseDto } from './dto/time-slots.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('Time Slots')
@Controller('time-slots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  // ==================== PROTECTED ENDPOINTS (HR/ADMIN) ====================

  @Post('generate')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Generate time slots from HR schedule' })
  @ApiResponse({
    status: 201,
    description: 'Time slots generated successfully',
    type: [TimeSlotResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Interview or HR Schedule not found' })
  async generateTimeSlots(@Body() dto: GenerateTimeSlotsDto): Promise<TimeSlotResponseDto[]> {
    return this.timeSlotsService.generateTimeSlots(dto);
  }

  @Post('generate-custom')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Generate custom time slots manually' })
  @ApiResponse({
    status: 201,
    description: 'Custom time slots generated successfully',
    type: [TimeSlotResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async generateCustomTimeSlots(@Body() dto: GenerateCustomTimeSlotsDto): Promise<TimeSlotResponseDto[]> {
    return this.timeSlotsService.generateCustomTimeSlots(dto);
  }

  @Post('booking-token/:interviewUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Generate booking token for an interview' })
  @ApiParam({ name: 'interviewUid', description: 'Interview UID' })
  @ApiResponse({
    status: 201,
    description: 'Booking token generated successfully',
    type: BookingTokenResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async generateBookingToken(@Param('interviewUid') interviewUid: string): Promise<BookingTokenResponseDto> {
    return this.timeSlotsService.generateBookingToken(interviewUid);
  }

  @Get('interview/:interviewUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all time slots for an interview (HR view)' })
  @ApiParam({ name: 'interviewUid', description: 'Interview UID' })
  @ApiResponse({
    status: 200,
    description: 'Time slots retrieved successfully',
    type: [TimeSlotResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getTimeSlotsByInterview(@Param('interviewUid') interviewUid: string): Promise<TimeSlotResponseDto[]> {
    return this.timeSlotsService.getTimeSlotsByInterview(interviewUid);
  }

  @Delete('cancel/:interviewUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel selected time slot and re-open all slots' })
  @ApiParam({ name: 'interviewUid', description: 'Interview UID' })
  @ApiResponse({
    status: 204,
    description: 'Time slot selection cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async cancelSlotSelection(@Param('interviewUid') interviewUid: string): Promise<void> {
    return this.timeSlotsService.cancelSlotSelection(interviewUid);
  }

  // ==================== PUBLIC ENDPOINTS (CANDIDATE) ====================

  @Get('available/:token')
  @ApiOperation({ summary: 'Get available time slots using booking token (PUBLIC)' })
  @ApiParam({ name: 'token', description: 'Booking token' })
  @ApiResponse({
    status: 200,
    description: 'Available time slots retrieved successfully',
    type: [TimeSlotResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Invalid booking token' })
  @ApiResponse({ status: 403, description: 'Token expired or already used' })
  async getAvailableSlots(@Param('token') token: string): Promise<TimeSlotResponseDto[]> {
    return this.timeSlotsService.getAvailableSlots(token);
  }

  @Post('select/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select a time slot using booking token (PUBLIC)' })
  @ApiParam({ name: 'token', description: 'Booking token' })
  @ApiResponse({
    status: 200,
    description: 'Time slot selected successfully',
    type: TimeSlotResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invalid booking token or time slot' })
  @ApiResponse({ status: 400, description: 'Time slot not available' })
  @ApiResponse({ status: 403, description: 'Token expired or already used' })
  async selectSlot(@Param('token') token: string, @Body() dto: SelectTimeSlotDto): Promise<TimeSlotResponseDto> {
    return this.timeSlotsService.selectSlot(token, dto);
  }
}
