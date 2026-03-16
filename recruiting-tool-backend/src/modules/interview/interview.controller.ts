import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterviewService } from './interview.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  InterviewResponseDto,
  AddInterviewerDto,
  RescheduleInterviewDto,
  InterviewRescheduleHistoryDto,
  CheckAvailabilityDto,
  AvailabilityCheckResponseDto,
  GetCalendarInterviewsDto,
  CalendarInterviewResponseDto,
} from './dto/interview.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType, User } from '@prisma/client';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/users.dto';
import { getUserCompanyId } from 'src/utils/company-access.helper';

@ApiTags('Interview')
@ApiBearerAuth()
@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Create a new interview for a stage' })
  @ApiResponse({ status: 201, description: 'Interview created successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  async create(@Body() createInterviewDto: CreateInterviewDto, @CurrentUser() user: UserResponseDto): Promise<InterviewResponseDto> {
    return this.interviewService.create(createInterviewDto, user.uid);
  }

  @Get('calendar')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Get company interviews within a date range',
    description:
      "Returns all interviews scheduled within the given date range for the requesting user's company. " +
      'Optionally filtered to specific HR organizers via comma-separated memberUids. Max 500 results per request.',
  })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start of date range (ISO 8601)', example: '2026-03-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End of date range (ISO 8601)', example: '2026-03-31T23:59:59.000Z' })
  @ApiQuery({ name: 'memberUids', required: false, description: 'Comma-separated HR member UIDs to filter by organizer' })
  @ApiResponse({ status: 200, description: 'List of calendar interviews', type: [CalendarInterviewResponseDto] })
  @ApiResponse({ status: 400, description: 'Invalid date parameters' })
  async getCalendar(@Query() query: GetCalendarInterviewsDto, @CurrentUser() user: User): Promise<CalendarInterviewResponseDto[]> {
    const companyId = getUserCompanyId(user);
    return this.interviewService.getCalendar(query, companyId);
  }

  @Get(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get interview by UID' })
  @ApiResponse({ status: 200, description: 'Interview details', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async findOne(@Param('uid') uid: string, @CurrentUser() user: any): Promise<InterviewResponseDto> {
    return this.interviewService.findOne(uid, user);
  }

  @Get('stage/:stageUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all interviews for a stage' })
  @ApiResponse({ status: 200, description: 'List of interviews', type: [InterviewResponseDto] })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  async findByStage(@Param('stageUid') stageUid: string): Promise<InterviewResponseDto[]> {
    return this.interviewService.findByStage(stageUid);
  }

  @Put(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Update an interview (full update)' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async update(@Param('uid') uid: string, @Body() updateInterviewDto: UpdateInterviewDto, @CurrentUser() user: any): Promise<InterviewResponseDto> {
    return this.interviewService.update(uid, updateInterviewDto, user);
  }

  @Patch(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Partially update an interview',
    description: 'Updates one or more fields of an interview. Accepts scheduledDate, scheduledTime, duration, meetingLink, notes.',
  })
  @ApiResponse({ status: 200, description: 'Interview updated successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async patch(@Param('uid') uid: string, @Body() updateInterviewDto: UpdateInterviewDto, @CurrentUser() user: any): Promise<InterviewResponseDto> {
    return this.interviewService.update(uid, updateInterviewDto, user);
  }

  @Put(':uid/cancel')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Cancel an interview' })
  @ApiResponse({ status: 200, description: 'Interview cancelled successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Interview is already cancelled' })
  async cancel(@Param('uid') uid: string): Promise<InterviewResponseDto> {
    return this.interviewService.cancel(uid);
  }

  @Put(':uid/complete')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Mark interview as completed' })
  @ApiResponse({ status: 200, description: 'Interview marked as completed', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Interview is already completed or cancelled' })
  async complete(@Param('uid') uid: string): Promise<InterviewResponseDto> {
    return this.interviewService.complete(uid);
  }

  @Post(':uid/interviewers')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Add an interviewer to the interview' })
  @ApiResponse({ status: 201, description: 'Interviewer added successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview or user not found' })
  @ApiResponse({ status: 400, description: 'User is already an interviewer' })
  async addInterviewer(@Param('uid') uid: string, @Body() addInterviewerDto: AddInterviewerDto): Promise<InterviewResponseDto> {
    return this.interviewService.addInterviewer(uid, addInterviewerDto.userUid, addInterviewerDto.role);
  }

  @Delete(':uid/interviewers/:userUid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Remove an interviewer from the interview' })
  @ApiResponse({ status: 200, description: 'Interviewer removed successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview, user, or interviewer relation not found' })
  async removeInterviewer(@Param('uid') uid: string, @Param('userUid') userUid: string): Promise<InterviewResponseDto> {
    return this.interviewService.removeInterviewer(uid, userUid);
  }

  @Put(':uid/reschedule')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Reschedule an interview' })
  @ApiResponse({ status: 200, description: 'Interview rescheduled successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  @ApiResponse({ status: 400, description: 'Interview cannot be rescheduled (cancelled, completed, or not scheduled)' })
  async reschedule(@Param('uid') uid: string, @Body() rescheduleDto: RescheduleInterviewDto, @CurrentUser() user: UserResponseDto): Promise<InterviewResponseDto> {
    return this.interviewService.reschedule(uid, rescheduleDto, user.uid);
  }

  @Get(':uid/reschedule-history')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get reschedule history for an interview' })
  @ApiResponse({ status: 200, description: 'Reschedule history retrieved successfully', type: [InterviewRescheduleHistoryDto] })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getRescheduleHistory(@Param('uid') uid: string): Promise<InterviewRescheduleHistoryDto[]> {
    return this.interviewService.getRescheduleHistory(uid);
  }

  @Post('check-availability')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Check interviewer availability and detect conflicts',
    description: 'Check if proposed interviewers are available at a specific time. Detects calendar conflicts and optionally suggests alternative time slots.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability check completed successfully',
    type: AvailabilityCheckResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'One or more interviewers not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async checkAvailability(@Body() dto: CheckAvailabilityDto): Promise<AvailabilityCheckResponseDto> {
    return this.interviewService.checkAvailability(dto);
  }

  @Delete(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({
    summary: 'Delete (soft-delete) an interview',
    description: 'Soft-deletes the interview by setting deletedAt. The interview is no longer returned in queries but is preserved for audit purposes.',
  })
  @ApiResponse({ status: 200, description: 'Interview deleted successfully', schema: { example: { message: 'Interview soft deleted successfully' } } })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async remove(@Param('uid') uid: string, @CurrentUser() user: User): Promise<{ message: string }> {
    return this.interviewService.remove(uid, user);
  }
}
