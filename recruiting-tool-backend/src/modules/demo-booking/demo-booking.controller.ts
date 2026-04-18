import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DemoBookingService } from './demo-booking.service';
import { RequestDemoBookingDto, SelectDemoSlotDto, DemoBookingResponseDto, DemoTimeSlotResponseDto, DemoCalendarSettingsResponseDto } from './dto/demo-booking.dto';

@ApiTags('Demo Booking')
@Controller('demo-booking')
export class DemoBookingController {
  constructor(private readonly demoBookingService: DemoBookingService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a demo booking link' })
  @ApiResponse({ status: 201, type: DemoBookingResponseDto })
  async requestDemo(@Body() dto: RequestDemoBookingDto): Promise<DemoBookingResponseDto> {
    return this.demoBookingService.requestDemo(dto);
  }

  @Get('slots/:token')
  @ApiOperation({ summary: 'Get available demo slots for a token' })
  @ApiResponse({ status: 200, type: [DemoTimeSlotResponseDto] })
  async getSlots(@Param('token') token: string): Promise<DemoTimeSlotResponseDto[]> {
    return this.demoBookingService.getAvailableSlots(token);
  }

  @Get('settings/:token')
  @ApiOperation({ summary: 'Get calendar settings for the demo booking page' })
  @ApiResponse({ status: 200, type: DemoCalendarSettingsResponseDto })
  async getSettings(@Param('token') token: string): Promise<DemoCalendarSettingsResponseDto> {
    return this.demoBookingService.getSettings(token);
  }

  @Post('confirm/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a demo slot selection' })
  @ApiResponse({ status: 200, type: DemoTimeSlotResponseDto })
  async confirmSlot(@Param('token') token: string, @Body() dto: SelectDemoSlotDto): Promise<DemoTimeSlotResponseDto> {
    return this.demoBookingService.confirmSlot(token, dto);
  }
}
