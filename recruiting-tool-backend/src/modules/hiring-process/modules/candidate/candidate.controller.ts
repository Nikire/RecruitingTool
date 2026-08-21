import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CandidateService } from './candidate.service';
import { CandidateImportService } from './candidate-import.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto, CreateManualCandidateDto } from './dto/candidate.dto';
import { CandidateActivityService } from './services/candidate-activity.service';
import { CandidateActivityResponseDto } from './dto/candidate-activity.dto';
import { CandidateImportPreviewDto, CandidateImportResultDto } from './dto/candidate-import.dto';
import { ApiTags, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { Auth } from 'src/modules/shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/modules/shared/modules/auth/decorators/current-user.decorator';
import { PaginatedResponse } from 'src/dto/pagination.dto';
import { CandidateNoteResponseDto, CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { CandidateFilterDto } from './dto/candidate-filter.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { User } from '@prisma/client';
import { CandidateJourneyResponseDto } from '../stages/dto/stage-time-tracking.dto';
import { HiringProcessResponseDto } from '../../dto/hiring-process.dto';
import { StageNotesService } from 'src/modules/stage-notes/stage-notes.service';
import { CandidateStageNotesResponseDto } from 'src/modules/stage-notes/dto/stage-note.dto';

@ApiTags('Candidate')
@ApiBearerAuth()
@Controller('candidate')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Candidate not found' })
// Class-level default = HR (level 6) and above. Read-only handlers below opt
// RECRUITER (level 7) in explicitly; every write handler inherits this list and
// therefore stays HR+.
@Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
export class CandidateController {
  constructor(
    private readonly candidateService: CandidateService,
    private readonly candidateActivityService: CandidateActivityService,
    private readonly candidateImportService: CandidateImportService,
    private readonly databaseService: DatabaseService,
    private readonly stageNotesService: StageNotesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new candidate' })
  @ApiResponse({
    status: 201,
    description: 'The candidate has been successfully created.',
    type: CandidateResponseDto,
  })
  @ApiBody({ type: CreateCandidateDto })
  create(@Body() createCandidateDto: CreateCandidateDto, @CurrentUser() currentUser: User): Promise<CandidateResponseDto> {
    return this.candidateService.create(createCandidateDto, currentUser);
  }

  @Post('manual')
  @ApiOperation({
    summary: 'Create a manual candidate and auto-create hiring process',
    description:
      'Creates a candidate from manual entry (phone call, referral, walk-in, etc.), automatically creates a hiring process, and sends a welcome email. Validates email uniqueness per company.',
  })
  @ApiResponse({
    status: 201,
    description: 'The candidate and hiring process have been successfully created.',
    type: HiringProcessResponseDto,
  })
  @ApiBody({ type: CreateManualCandidateDto })
  createManual(@Body() createManualCandidateDto: CreateManualCandidateDto, @CurrentUser() currentUser: User): Promise<HiringProcessResponseDto> {
    return this.candidateService.createManual(createManualCandidateDto, currentUser);
  }

  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get('list')
  @ApiOperation({ summary: 'Get paginated candidates list with advanced filtering and search' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated candidates list with filters applied',
  })
  list(@Query() filterDto: CandidateFilterDto, @CurrentUser() currentUser: User): Promise<PaginatedResponse<CandidateResponseDto>> {
    return this.candidateService.list(filterDto, currentUser);
  }

  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of candidates',
    type: [CandidateResponseDto],
  })
  findAll(@CurrentUser() currentUser: User): Promise<Array<CandidateResponseDto>> {
    return this.candidateService.findAll(currentUser);
  }

  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':uid')
  @ApiOperation({ summary: 'Get a candidate by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the candidate details',
    type: CandidateResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<CandidateResponseDto> {
    return this.candidateService.findOne(uid, currentUser);
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
  update(@Param('uid') uid: string, @Body() updateCandidateDto: UpdateCandidateDto, @CurrentUser() currentUser: User): Promise<CandidateResponseDto> {
    return this.candidateService.update(uid, updateCandidateDto, currentUser);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Soft delete a candidate by UID' })
  @ApiResponse({
    status: 200,
    description: 'The candidate has been soft deleted (can be restored).',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  remove(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MessageResponseDto> {
    return this.candidateService.remove(uid, currentUser);
  }

  @Delete(':uid/purge')
  @Auth(['SUPER_ADMIN'])
  @ApiOperation({
    summary: 'GDPR Purge - Permanently delete candidate data (SUPER_ADMIN only)',
    description: 'Hard deletes a candidate and all associated data. This operation is irreversible and should only be used for GDPR "right to be forgotten" requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'The candidate has been permanently deleted from the database.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the candidate to purge' })
  purge(@Param('uid') uid: string, @CurrentUser() user: User): Promise<MessageResponseDto> {
    return this.candidateService.purge(uid, user);
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
  async createNote(@Param('candidateUid') candidateUid: string, @Body() createNoteDto: CreateCandidateNoteDto, @CurrentUser() user: any): Promise<CandidateNoteResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });

    // Override candidateUid from path param to ensure consistency
    createNoteDto.candidateUid = candidateUid;
    // `dbUser` (not the token payload) is passed as the tenancy subject so the
    // service can scope the candidate to the caller's company.
    return this.candidateService.createNote(createNoteDto, dbUser.id, dbUser);
  }

  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':candidateUid/notes')
  @ApiOperation({ summary: 'Get all notes for a candidate' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of notes for the candidate',
    type: [CandidateNoteResponseDto],
  })
  @ApiParam({ name: 'candidateUid', required: true, description: 'UID of the candidate' })
  findNotesByCandidateUid(@Param('candidateUid') candidateUid: string, @CurrentUser() currentUser: User): Promise<CandidateNoteResponseDto[]> {
    return this.candidateService.findNotesByCandidateUid(candidateUid, currentUser);
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
  async updateNote(@Param('noteUid') noteUid: string, @Body() updateNoteDto: UpdateCandidateNoteDto, @CurrentUser() user: any): Promise<CandidateNoteResponseDto> {
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
  async removeNote(@Param('noteUid') noteUid: string, @CurrentUser() user: any): Promise<MessageResponseDto> {
    // Look up the user's numeric ID from the UID stored in the token
    const dbUser = await this.databaseService.user.findUnique({
      where: { uid: user.uid },
    });
    return this.candidateService.removeNote(noteUid, dbUser.id);
  }

  // Candidate Journey Tracking endpoint
  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':uid/journey')
  @ApiOperation({ summary: 'Get candidate journey through all stages with time tracking' })
  @ApiResponse({
    status: 200,
    description: 'Returns the candidate journey across all hiring processes',
    type: [CandidateJourneyResponseDto],
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the candidate' })
  getCandidateJourney(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<CandidateJourneyResponseDto[]> {
    return this.candidateService.getCandidateJourney(uid, currentUser);
  }

  // Candidate Activity Timeline endpoint
  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':uid/activities')
  @ApiOperation({ summary: 'Get candidate activity timeline/history' })
  @ApiResponse({
    status: 200,
    description: 'Returns the candidate activity timeline',
    type: [CandidateActivityResponseDto],
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the candidate' })
  getCandidateActivities(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<CandidateActivityResponseDto[]> {
    return this.candidateActivityService.getCandidateActivities(uid, currentUser);
  }

  // Stage Eval Notes for candidate endpoint
  @Auth(['RECRUITER', 'HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])
  @Get(':candidateUid/stage-eval-notes')
  @ApiOperation({ summary: 'Get all stage evaluation notes for a candidate' })
  @ApiResponse({
    status: 200,
    description: 'Returns all stage evaluation notes for the candidate across all hiring processes',
    type: [CandidateStageNotesResponseDto],
  })
  @ApiParam({ name: 'candidateUid', required: true, description: 'UID of the candidate' })
  getCandidateStageEvalNotes(@Param('candidateUid') candidateUid: string, @CurrentUser() currentUser: User): Promise<CandidateStageNotesResponseDto[]> {
    return this.stageNotesService.findByCandidateUid(candidateUid, currentUser);
  }

  // Bulk Import endpoints
  @Post('import/preview')
  @ApiOperation({
    summary: 'Preview CSV import - validate without creating candidates',
    description: 'Upload a CSV file to validate format and data before importing. Returns preview with valid and invalid rows.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Returns preview of import with validation results',
    type: CandidateImportPreviewDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async previewImport(@UploadedFile() file: Express.Multer.File): Promise<CandidateImportPreviewDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    return this.candidateImportService.previewImport(file.buffer);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import candidates from CSV file',
    description: 'Upload a CSV file to bulk import candidates. Returns import results with success and error counts.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Candidates imported successfully',
    type: CandidateImportResultDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async importCandidates(@UploadedFile() file: Express.Multer.File, @CurrentUser() currentUser: User): Promise<CandidateImportResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    // Get user's company ID for duplicate checking
    const companyId = currentUser.companyId || undefined;

    return this.candidateImportService.importCandidates(file.buffer, companyId);
  }

  @Get('import/template')
  @ApiOperation({
    summary: 'Download CSV template',
    description: 'Download a CSV template file with headers and example data for importing candidates.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV template downloaded successfully',
  })
  downloadTemplate(@Res() res: Response): void {
    const csvContent = this.candidateImportService.generateTemplateCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="candidate-import-template.csv"');
    res.send(csvContent);
  }
}
