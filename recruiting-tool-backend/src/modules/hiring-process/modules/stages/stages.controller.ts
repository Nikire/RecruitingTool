import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto, UpdateStageDto } from './dto/stages.dto';
import { Auth } from 'src/modules/shared/modules/auth/decorators/auth.decorator';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { StageResponseDto } from './dto/stages.dto';
import { CreateStageNoteDto, UpdateStageNoteDto, StageNoteResponseDto } from './dto/stage-note.dto';
import { CurrentUser } from 'src/modules/shared/modules/auth/decorators/current-user.decorator';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { StageMetricsResponseDto } from './dto/stage-time-tracking.dto';

@Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
@ApiBearerAuth()
@ApiTags('Stages')
@Controller('stages')
export class StagesController {
  constructor(
    private readonly stagesService: StagesService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stage' })
  @ApiBody({ type: CreateStageDto })
  create(@Body() createStageDto: CreateStageDto) {
    return this.stagesService.create(createStageDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create multiple stages for a hiring process' })
  @ApiBody({ type: Array<CreateStageDto> })
  bulkCreate(@Body() bulkCreateStagesDto: Array<CreateStageDto>) {
    return this.stagesService.bulkCreateStages(bulkCreateStagesDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get paginated stages list with filtering' })
  list(@Query() paginationDto: PaginationDto, @CurrentUser() user: any): Promise<PaginatedResponse<StageResponseDto>> {
    return this.stagesService.list(paginationDto, user);
  }

  @Get(':uid')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes - stage templates rarely change
  @ApiOperation({ summary: 'Get a stage by UID' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  findOne(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.stagesService.findOne(uid, user);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update a stage' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  @ApiBody({ type: UpdateStageDto })
  update(@Param('uid') uid: string, @Body() updateStageDto: UpdateStageDto, @CurrentUser() user: any) {
    return this.stagesService.update(uid, updateStageDto, user);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete a stage' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  remove(@Param('uid') uid: string, @CurrentUser() user: any) {
    return this.stagesService.remove(uid, user);
  }

  // Stage Notes endpoints
  @Post(':stageUid/notes')
  @ApiOperation({ summary: 'Create a note for a stage' })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
    type: StageNoteResponseDto,
  })
  @ApiParam({ name: 'stageUid', required: true, description: 'UID of the stage' })
  @ApiBody({ type: CreateStageNoteDto })
  async createNote(@Param('stageUid') stageUid: string, @Body() createNoteDto: CreateStageNoteDto, @CurrentUser() user: any): Promise<StageNoteResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });

    return this.stagesService.createNote(stageUid, createNoteDto, dbUser.id);
  }

  @Get(':stageUid/notes')
  @ApiOperation({ summary: 'Get all notes for a stage' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of notes for the stage',
    type: [StageNoteResponseDto],
  })
  @ApiParam({ name: 'stageUid', required: true, description: 'UID of the stage' })
  findNotesByStageUid(@Param('stageUid') stageUid: string): Promise<StageNoteResponseDto[]> {
    return this.stagesService.findNotesByStageUid(stageUid);
  }

  @Put('notes/:noteUid')
  @ApiOperation({ summary: 'Update a note by UID (only by author)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated note',
    type: StageNoteResponseDto,
  })
  @ApiParam({ name: 'noteUid', required: true, description: 'UID of the note' })
  @ApiBody({ type: UpdateStageNoteDto })
  async updateNote(@Param('noteUid') noteUid: string, @Body() updateNoteDto: UpdateStageNoteDto, @CurrentUser() user: any): Promise<StageNoteResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });
    return this.stagesService.updateNote(noteUid, updateNoteDto, dbUser.id);
  }

  @Delete('notes/:noteUid')
  @ApiOperation({ summary: 'Delete a note by UID (only by author)' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'noteUid', required: true, description: 'UID of the note' })
  async removeNote(@Param('noteUid') noteUid: string, @CurrentUser() user: any): Promise<MessageResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });
    return this.stagesService.deleteNote(noteUid, dbUser.id);
  }

  // Time Tracking Analytics endpoints
  @Get(':uid/metrics')
  @ApiOperation({ summary: 'Get time tracking metrics for a stage' })
  @ApiResponse({
    status: 200,
    description: 'Returns time metrics for the stage (average, min, max time)',
    type: StageMetricsResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the stage' })
  getStageMetrics(@Param('uid') uid: string): Promise<StageMetricsResponseDto> {
    return this.stagesService.getStageMetrics(uid);
  }
}
