import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewService } from './interview.service';
import { CreateInterviewDto, UpdateInterviewDto, InterviewResponseDto } from './dto/interview.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/users.dto';

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
  async create(
    @Body() createInterviewDto: CreateInterviewDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<InterviewResponseDto> {
    return this.interviewService.create(createInterviewDto, user.uid);
  }

  @Get(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get interview by UID' })
  @ApiResponse({ status: 200, description: 'Interview details', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async findOne(@Param('uid') uid: string): Promise<InterviewResponseDto> {
    return this.interviewService.findOne(uid);
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
  @ApiOperation({ summary: 'Update an interview' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully', type: InterviewResponseDto })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async update(
    @Param('uid') uid: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ): Promise<InterviewResponseDto> {
    return this.interviewService.update(uid, updateInterviewDto);
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

  @Delete(':uid')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete an interview' })
  @ApiResponse({ status: 200, description: 'Interview deleted successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async remove(@Param('uid') uid: string): Promise<{ message: string }> {
    return this.interviewService.remove(uid);
  }
}
