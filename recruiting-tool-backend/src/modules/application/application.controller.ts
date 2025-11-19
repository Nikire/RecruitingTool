import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationDto, ApplicationFilterDto } from './dto/application.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Submit job application (Public - No auth required)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: ApplicationResponseDto,
  })
  @ApiBody({ type: CreateApplicationDto })
  create(@Body() createApplicationDto: CreateApplicationDto): Promise<ApplicationResponseDto> {
    return this.applicationService.create(createApplicationDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Get()
  @ApiOperation({ summary: 'Get all applications (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of applications',
    type: [ApplicationResponseDto],
  })
  findAll(@Query() filterDto: ApplicationFilterDto): Promise<ApplicationResponseDto[]> {
    return this.applicationService.findAll(filterDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Get(':uid')
  @ApiOperation({ summary: 'Get single application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns application details',
    type: ApplicationResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  findOne(@Param('uid') uid: string): Promise<ApplicationResponseDto> {
    return this.applicationService.findOne(uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Put(':uid')
  @ApiOperation({ summary: 'Update application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: ApplicationResponseDto,
  })
  @ApiBody({ type: UpdateApplicationDto })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  update(
    @Param('uid') uid: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @CurrentUser() currentUser: User,
  ): Promise<ApplicationResponseDto> {
    return this.applicationService.update(uid, updateApplicationDto, currentUser.uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete application (HR/ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application deleted successfully',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Application UID' })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.applicationService.remove(uid);
  }
}
