import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import {
  CreateHiringProcessDto,
  UpdateHiringProcessDto,
  HiringProcessResponseDto,
  HiringProcessFindDto,
  AccessCodeResponseDto,
  HiringProcessGroupedFilterDto,
  PaginatedHiringProcessGroupsResponseDto,
} from './dto/hiring-process.dto';
import { HiringProcessFilterDto } from './dto/hiring-process-filter.dto';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiTags, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginatedResponse } from 'src/dto/pagination.dto';

@ApiTags('Hiring Process')
@ApiBearerAuth()
@Controller('hiring-process')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Hiring process not found' })
export class HiringProcessController {
  constructor(private readonly hiringProcessService: HiringProcessService) {}

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
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

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get('list')
  @ApiOperation({ summary: 'Get paginated hiring processes list with advanced filtering and search' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated hiring processes list with filters applied',
  })
  list(@Query() filterDto: HiringProcessFilterDto, @CurrentUser() currentUser: User): Promise<PaginatedResponse<HiringProcessResponseDto>> {
    return this.hiringProcessService.list(filterDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get('list-grouped')
  @ApiOperation({ summary: 'Get hiring processes grouped by job position with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated job position groups, each with all their hiring processes',
    type: PaginatedHiringProcessGroupsResponseDto,
  })
  listGrouped(@Query() filterDto: HiringProcessGroupedFilterDto, @CurrentUser() currentUser: User): Promise<PaginatedHiringProcessGroupsResponseDto> {
    return this.hiringProcessService.listGrouped(filterDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get()
  @ApiOperation({ summary: 'Get hiring process list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the hiring process details',
    type: [HiringProcessResponseDto],
  })
  findAll(@Body() hiringProcessFindDto: HiringProcessFindDto, @CurrentUser() currentUser: User): Promise<Array<HiringProcessResponseDto>> {
    return this.hiringProcessService.findAll(hiringProcessFindDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get(':uid')
  @ApiOperation({ summary: 'Get one hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the hiring process details',
    type: HiringProcessResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.findOne(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Put(':uid')
  @ApiOperation({ summary: 'Update one hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated hiring process details',
    type: HiringProcessResponseDto,
  })
  @ApiBody({ type: UpdateHiringProcessDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateHiringProcessDto: UpdateHiringProcessDto, @CurrentUser() currentUser: User): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.update(uid, updateHiringProcessDto, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one hiring process - HR role required' })
  @ApiResponse({
    status: 200,
    description: 'The hiring process has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MessageResponseDto> {
    return this.hiringProcessService.remove(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Post(':uid/progress-stage')
  @ApiOperation({ summary: 'Progress to next stage in hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Stage progressed successfully or hiring process completed',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Hiring Process UID' })
  progressStage(@Param('uid') uid: string, @CurrentUser() currentUser: User) {
    return this.hiringProcessService.progressToNextStage(uid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Post(':uid/move-to-stage/:stageUid')
  @ApiOperation({ summary: 'Move candidate to specific stage in hiring process' })
  @ApiResponse({
    status: 200,
    description: 'Candidate moved to target stage successfully',
  })
  @ApiParam({ name: 'uid', required: true, description: 'Hiring Process UID' })
  @ApiParam({ name: 'stageUid', required: true, description: 'Target Stage UID' })
  moveToStage(@Param('uid') uid: string, @Param('stageUid') stageUid: string, @CurrentUser() currentUser: User) {
    return this.hiringProcessService.moveToSpecificStage(uid, stageUid, currentUser);
  }

  @Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Post(':uid/generate-access-code')
  @ApiOperation({ summary: 'Generate access code for candidate self-service status check - HR role required' })
  @ApiResponse({
    status: 201,
    description: 'Access code generated successfully',
    type: AccessCodeResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'Hiring Process UID' })
  generateAccessCode(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<AccessCodeResponseDto> {
    return this.hiringProcessService.generateAccessCode(uid, currentUser);
  }
}
