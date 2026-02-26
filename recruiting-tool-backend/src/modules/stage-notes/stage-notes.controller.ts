import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { StageNotesService } from './stage-notes.service';
import { UpsertStageNoteDto, StageNoteResponseDto } from './dto/stage-note.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Stage Notes')
@ApiBearerAuth()
@Controller('hiring-processes/:hiringProcessUid/stages/:stageUid/note')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Stage or hiring process not found' })
export class StageNotesController {
  constructor(private readonly stageNotesService: StageNotesService) {}

  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Put()
  @ApiOperation({
    summary: 'Upsert (create or update) a note for a stage in a hiring process - HR role required',
    description: 'Creates a new note or updates an existing one. There can only be one note per stage per hiring process.',
  })
  @ApiResponse({
    status: 200,
    description: 'The stage note has been successfully created or updated.',
    type: StageNoteResponseDto,
  })
  @ApiParam({ name: 'hiringProcessUid', required: true, description: 'Hiring Process UID' })
  @ApiParam({ name: 'stageUid', required: true, description: 'Stage UID' })
  @ApiBody({ type: UpsertStageNoteDto })
  upsert(
    @Param('hiringProcessUid') hiringProcessUid: string,
    @Param('stageUid') stageUid: string,
    @Body() dto: UpsertStageNoteDto,
    @CurrentUser() currentUser: User,
  ): Promise<StageNoteResponseDto> {
    return this.stageNotesService.upsert(hiringProcessUid, stageUid, dto, currentUser.id);
  }

  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get()
  @ApiOperation({
    summary: 'Get the note for a stage in a hiring process',
    description: 'Returns the single note associated with this stage/hiring-process combination. Returns 404 if none exists.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the stage note.',
    type: StageNoteResponseDto,
  })
  @ApiParam({ name: 'hiringProcessUid', required: true, description: 'Hiring Process UID' })
  @ApiParam({ name: 'stageUid', required: true, description: 'Stage UID' })
  findOne(
    @Param('hiringProcessUid') hiringProcessUid: string,
    @Param('stageUid') stageUid: string,
  ): Promise<StageNoteResponseDto> {
    return this.stageNotesService.findOne(hiringProcessUid, stageUid);
  }

  @Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Delete()
  @ApiOperation({
    summary: 'Delete the note for a stage in a hiring process - HR role required',
    description: 'Deletes the note associated with this stage/hiring-process combination.',
  })
  @ApiResponse({
    status: 200,
    description: 'The stage note has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'hiringProcessUid', required: true, description: 'Hiring Process UID' })
  @ApiParam({ name: 'stageUid', required: true, description: 'Stage UID' })
  remove(
    @Param('hiringProcessUid') hiringProcessUid: string,
    @Param('stageUid') stageUid: string,
  ): Promise<{ message: string }> {
    return this.stageNotesService.remove(hiringProcessUid, stageUid);
  }
}
