import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto } from './dto/candidate.dto';
import { ApiTags, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { Auth } from 'src/modules/shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/modules/shared/modules/auth/decorators/current-user.decorator';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CandidateNoteResponseDto, CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';

@ApiTags('Candidate')
@ApiBearerAuth()
@Controller('candidate')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Candidate not found' })
@Auth(['HR', 'ADMIN'])
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new candidate' })
  @ApiResponse({
    status: 201,
    description: 'The candidate has been successfully created.',
    type: CandidateResponseDto,
  })
  @ApiBody({ type: CreateCandidateDto })
  create(@Body() createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {
    return this.candidateService.create(createCandidateDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get paginated candidates list with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated candidates list',
  })
  list(@Query() paginationDto: PaginationDto): Promise<PaginatedResponse<CandidateResponseDto>> {
    return this.candidateService.list(paginationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of candidates',
    type: [CandidateResponseDto],
  })
  findAll(): Promise<Array<CandidateResponseDto>> {
    return this.candidateService.findAll();
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a candidate by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the candidate details',
    type: CandidateResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string): Promise<CandidateResponseDto> {
    return this.candidateService.findOne(uid);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update a candidate by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated candidate',
    type: CandidateResponseDto,
  })
  @ApiBody({ type: UpdateCandidateDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateCandidateDto: UpdateCandidateDto): Promise<CandidateResponseDto> {
    return this.candidateService.update(uid, updateCandidateDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete a candidate by UID' })
  @ApiResponse({
    status: 200,
    description: 'The candidate has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.candidateService.remove(uid);
  }

  // Candidate Notes endpoints
  @Post(':candidateUid/notes')
  @ApiOperation({ summary: 'Create a note for a candidate' })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
    type: CandidateNoteResponseDto,
  })
  @ApiParam({ name: 'candidateUid', required: true, description: 'UID of the candidate' })
  @ApiBody({ type: CreateCandidateNoteDto })
  async createNote(
    @Param('candidateUid') candidateUid: string,
    @Body() createNoteDto: CreateCandidateNoteDto,
    @CurrentUser() user: any,
  ): Promise<CandidateNoteResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });

    // Override candidateUid from path param to ensure consistency
    createNoteDto.candidateUid = candidateUid;
    return this.candidateService.createNote(createNoteDto, dbUser.id);
  }

  @Get(':candidateUid/notes')
  @ApiOperation({ summary: 'Get all notes for a candidate' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of notes for the candidate',
    type: [CandidateNoteResponseDto],
  })
  @ApiParam({ name: 'candidateUid', required: true, description: 'UID of the candidate' })
  findNotesByCandidateUid(@Param('candidateUid') candidateUid: string): Promise<CandidateNoteResponseDto[]> {
    return this.candidateService.findNotesByCandidateUid(candidateUid);
  }

  @Put('notes/:noteUid')
  @ApiOperation({ summary: 'Update a note by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated note',
    type: CandidateNoteResponseDto,
  })
  @ApiParam({ name: 'noteUid', required: true, description: 'UID of the note' })
  @ApiBody({ type: UpdateCandidateNoteDto })
  async updateNote(
    @Param('noteUid') noteUid: string,
    @Body() updateNoteDto: UpdateCandidateNoteDto,
    @CurrentUser() user: any,
  ): Promise<CandidateNoteResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });
    return this.candidateService.updateNote(noteUid, updateNoteDto, dbUser.id);
  }

  @Delete('notes/:noteUid')
  @ApiOperation({ summary: 'Delete a note by UID' })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'noteUid', required: true, description: 'UID of the note' })
  async removeNote(
    @Param('noteUid') noteUid: string,
    @CurrentUser() user: any,
  ): Promise<MessageResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });
    return this.candidateService.removeNote(noteUid, dbUser.id);
  }
}
