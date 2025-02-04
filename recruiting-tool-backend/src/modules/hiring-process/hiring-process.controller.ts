import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { HiringProcessService } from './hiring-process.service';
import { CreateHiringProcessDto, UpdateHiringProcessDto, HiringProcessResponseDto } from './dto/hiring-process.dto';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User, HiringProcessStatus } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiTags, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Hiring Process')
@ApiBearerAuth()
@Controller('hiring-process')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Hiring process not found' })
@Auth(['HR'])
export class HiringProcessController {
  constructor(private readonly hiringProcessService: HiringProcessService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a Hiring Process - HR role required' })
  @ApiResponse({
    status: 201,
    description: 'The hiring process has been successfully created.',
    type: HiringProcessResponseDto,
  })
  @ApiBody({ type: CreateHiringProcessDto })
  create(@CurrentUser() currentUser: User, @Body() createHiringProcessDto: CreateHiringProcessDto): Promise<HiringProcessResponseDto> {
    return this.hiringProcessService.create(currentUser.uid, createHiringProcessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get hiring process list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the hiring process details',
    type: [HiringProcessResponseDto],
  })
  findAll(): Promise<Array<HiringProcessResponseDto>> {
    return this.hiringProcessService.findAll();
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
}
