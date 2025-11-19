import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { CreateHiringProcessDto, UpdateHiringProcessDto, HiringProcessResponseDto, HiringProcessFindDto } from './dto/hiring-process.dto';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User, HiringProcessStatus } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiTags, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

@ApiTags('Hiring Process')
@ApiBearerAuth()
@Controller('hiring-process')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Hiring process not found' })
export class HiringProcessController {
  constructor(private readonly hiringProcessService: HiringProcessService) {}

  @Auth(['HR', 'ADMIN'])
  @Post()
  @ApiOperation({ summary: 'Creates a Hiring Process - HR role required' })
  @ApiResponse({
    status: 201,
    description: 'The hiring process has been successfully created.',
    type: HiringProcessResponseDto,
  })
  @ApiBody({ type: CreateHiringProcessDto })
  create(@Body() createHiringProcessDto: CreateHiringProcessDto): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.create(createHiringProcessDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Get('list')
  @ApiOperation({ summary: 'Get paginated hiring processes list with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated hiring processes list',
  })
  list(@Query() paginationDto: PaginationDto): Promise<PaginatedResponse<HiringProcessResponseDto>> {
    return this.hiringProcessService.list(paginationDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Get()
  @ApiOperation({ summary: 'Get hiring process list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the hiring process details',
    type: [HiringProcessResponseDto],
  })
  findAll(@Body() hiringProcessFindDto: HiringProcessFindDto): Promise<Array<HiringProcessResponseDto>> {
    return this.hiringProcessService.findAll(hiringProcessFindDto);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get one hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the hiring process details',
    type: HiringProcessResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.findOne(uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Put(':uid')
  @ApiOperation({ summary: 'Update one hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated hiring process details',
    type: HiringProcessResponseDto,
  })
  @ApiBody({ type: UpdateHiringProcessDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateHiringProcessDto: UpdateHiringProcessDto): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.update(uid, updateHiringProcessDto);
  }

  @Auth(['HR', 'ADMIN'])
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one hiring process - HR role required' })
  @ApiResponse({
    status: 200,
    description: 'The hiring process has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.hiringProcessService.remove(uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Post(':uid/progress-stage')
  @ApiOperation({ summary: 'Progress to next stage in hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Stage progressed successfully or hiring process completed',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Hiring Process UID' })
  progressStage(@Param('uid') uid: string) {
    return this.hiringProcessService.progressToNextStage(uid);
  }

  @Auth(['HR', 'ADMIN'])
  @Post(':uid/move-to-stage/:stageUid')
  @ApiOperation({ summary: 'Move candidate to specific stage in hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Candidate moved to target stage successfully',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Hiring Process UID' })
  @ApiParam({ name: 'stageUid', required: true, description: 'Target Stage UID' })
  moveToStage(@Param('uid') uid: string, @Param('stageUid') stageUid: string) {
    return this.hiringProcessService.moveToSpecificStage(uid, stageUid);
  }
}
