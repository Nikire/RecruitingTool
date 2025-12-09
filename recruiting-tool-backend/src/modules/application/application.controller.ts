import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 applications per hour per IP
  @ApiOperation({ summary: 'Submit job application (Public - No auth required)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: ApplicationResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many application submissions. Maximum 5 applications per hour per IP.',
  })
  @ApiBody({ type: CreateApplicationDto })
  create(@Body() createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    return this.applicationService.create(createApplicationDto);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get()
  @ApiOperation({ summary: 'Get all applications (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of applications',
    type: [ApplicationResponseDto],
  })
  findAll(@Query() filterDto: ApplicationFilterDto, @CurrentUser() currentUser: User): Promise<ApplicationResponseDto[]> {
    return this.applicationService.findAll(filterDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':uid')
  @ApiOperation({ summary: 'Get single application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns application details',
    type: ApplicationResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  findOne(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<ApplicationResponseDto> {
    return this.applicationService.findOne(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Put(':uid')
  @ApiOperation({ summary: 'Update application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: ApplicationResponseDto,
  })
  @ApiBody({ type: UpdateApplicationDto })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  update(@Param('uid') uid: string, @Body() updateApplicationDto: UpdateApplicationDto, @CurrentUser() currentUser: User): Promise<ApplicationResponseDto> {
    return this.applicationService.update(uid, updateApplicationDto, currentUser.uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application deleted successfully',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MessageResponseDto> {
    return this.applicationService.remove(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Put(':uid/accept')
  @ApiOperation({ summary: 'Accept application and create candidate + hiring process (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application accepted successfully. Candidate and hiring process created.',
    type: ApplicationResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  acceptApplication(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<ApplicationResponseDto> {
    return this.applicationService.acceptApplication(uid, currentUser);
  }
}
