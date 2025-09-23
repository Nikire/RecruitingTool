import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { JobPositionService } from './job-position.service';
import { User } from '@prisma/client';
import { CreateJobPositionDto, JobPositionResponseDto, UpdateJobPositionDto } from './dto/job-position.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Job Position')
@ApiBearerAuth()
@Controller('job-position')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
export class JobPositionController {
  constructor(private readonly jobPositionService: JobPositionService) {}

  @Auth(['HR', 'ADMIN'])
  @Post()
  @ApiOperation({ summary: 'Creates a Job position - HR role required' })
  @ApiResponse({
    status: 201,
    description: 'The job position has been successfully created.',
    type: JobPositionResponseDto,
  })
  @ApiBody({ type: CreateJobPositionDto })
  create(@CurrentUser() currentUser: User, @Body() createJobPositionDto: CreateJobPositionDto): Promise<JobPositionResponseDto> {
    return this.jobPositionService.create(currentUser.uid, createJobPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get job position list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job position details',
    type: [JobPositionResponseDto],
  })
  findAll(): Promise<Array<JobPositionResponseDto>> {
    return this.jobPositionService.findAll();
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get job position process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job position details',
    type: JobPositionResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string): Promise<JobPositionResponseDto> {
    return this.jobPositionService.findOne(uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Put(':uid')
  @ApiOperation({ summary: 'Update one job position' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated job position details',
    type: JobPositionResponseDto,
  })
  @ApiBody({ type: UpdateJobPositionDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateJobPositionDto: UpdateJobPositionDto): Promise<JobPositionResponseDto> {
    return this.jobPositionService.update(uid, updateJobPositionDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one job position - HR role required' })
  @ApiResponse({
    status: 200,
    description: 'The job position has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.jobPositionService.remove(uid);
  }
}
