import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { UpsertStageNoteDto, StageNoteResponseDto, CandidateStageNotesResponseDto } from './dto/stage-note.dto';
import { User } from '@prisma/client';
import { getUserCompanyId } from 'src/utils/company-access.helper';

@Injectable()
export class StageNotesService {
  private readonly logger = new Logger(StageNotesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Resolve stage UID to internal numeric ID, confirming the stage belongs to the given hiring process.
   */
  private async resolveStageId(stageUid: string, hiringProcessId: number): Promise<number> {
    const stage = await this.databaseService.stage.findFirst({
      where: { uid: stageUid, hiringProcessId, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException(`Stage ${stageUid} not found in hiring process`);
    }

    return stage.id;
  }

  /**
   * Resolve hiring process UID to internal numeric ID.
   * Excludes soft-deleted hiring processes.
   */
  private async resolveHiringProcessId(hiringProcessUid: string): Promise<{ id: number; uid: string }> {
    const hiringProcess = await this.databaseService.hiringProcess.findFirst({
      where: { uid: hiringProcessUid, deletedAt: null },
      select: { id: true, uid: true },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process ${hiringProcessUid} not found`);
    }

    return hiringProcess;
  }

  /**
   * Upsert (create or update) a note for a specific stage within a hiring process.
   * One note per stage per hiring process — enforced by DB unique constraint.
   * If a soft-deleted note exists for this stage/process, it is restored and updated.
   */
  async upsert(hiringProcessUid: string, stageUid: string, dto: UpsertStageNoteDto, authorId: number): Promise<StageNoteResponseDto> {
    const hiringProcess = await this.resolveHiringProcessId(hiringProcessUid);
    const stageId = await this.resolveStageId(stageUid, hiringProcess.id);

    const note = await this.databaseService.stageNote.upsert({
      where: {
        stageId_hiringProcessId: {
          stageId,
          hiringProcessId: hiringProcess.id,
        },
      },
      create: {
        content: dto.content,
        rating: dto.rating,
        stageId,
        hiringProcessId: hiringProcess.id,
        authorId,
        deletedAt: null,
      },
      update: {
        content: dto.content,
        rating: dto.rating,
        authorId,
        deletedAt: null, // Restore if previously soft-deleted
      },
      include: {
        author: true,
        stage: true,
        hiringProcess: { select: { uid: true } },
      },
    });

    return this.mapToResponseDto(note);
  }

  /**
   * Get the note for a specific stage within a hiring process (excludes soft-deleted notes).
   */
  async findOne(hiringProcessUid: string, stageUid: string): Promise<StageNoteResponseDto> {
    const hiringProcess = await this.resolveHiringProcessId(hiringProcessUid);
    const stageId = await this.resolveStageId(stageUid, hiringProcess.id);

    const note = await this.databaseService.stageNote.findFirst({
      where: {
        stageId,
        hiringProcessId: hiringProcess.id,
        deletedAt: null,
      },
      include: {
        author: true,
        stage: true,
        hiringProcess: { select: { uid: true } },
      },
    });

    if (!note) {
      throw new NotFoundException(`No note found for stage ${stageUid} in hiring process ${hiringProcessUid}`);
    }

    return this.mapToResponseDto(note);
  }

  /**
   * Delete the note for a specific stage within a hiring process (soft delete).
   */
  async remove(hiringProcessUid: string, stageUid: string): Promise<{ message: string }> {
    const hiringProcess = await this.resolveHiringProcessId(hiringProcessUid);
    const stageId = await this.resolveStageId(stageUid, hiringProcess.id);

    const existing = await this.databaseService.stageNote.findFirst({
      where: {
        stageId,
        hiringProcessId: hiringProcess.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`No note found for stage ${stageUid} in hiring process ${hiringProcessUid}`);
    }

    // Soft delete: set deletedAt instead of hard delete
    await this.databaseService.stageNote.update({
      where: { uid: existing.uid },
      data: { deletedAt: new Date() },
    });

    return { message: 'Stage note deleted successfully' };
  }

  /**
   * Get all stage evaluation notes for a candidate (across all hiring processes and stages).
   * Excludes soft-deleted notes.
   */
  /**
   * Stage evaluation notes are interviewer scorecards - private company data.
   * `user` scopes the query to hiring processes owned by the caller's company;
   * without it any authenticated caller could read another tenant's evaluation
   * notes by passing that tenant's candidate UID.
   */
  async findByCandidateUid(candidateUid: string, user?: User): Promise<CandidateStageNotesResponseDto[]> {
    // null => SUPER_ADMIN, the only role with cross-company visibility.
    const userCompanyId = user ? getUserCompanyId(user) : null;

    const notes = await this.databaseService.stageNote.findMany({
      where: {
        deletedAt: null,
        hiringProcess: {
          candidate: { uid: candidateUid },
          ...(userCompanyId !== null && { companyId: userCompanyId }),
        },
      },
      include: {
        stage: { select: { uid: true, title: true } },
        hiringProcess: { select: { uid: true, title: true } },
        author: { select: { uid: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => ({
      uid: note.uid,
      content: note.content,
      rating: note.rating,
      stageUid: note.stage.uid,
      stageTitle: note.stage.title,
      hiringProcessUid: note.hiringProcess.uid,
      hiringProcessTitle: note.hiringProcess.title,
      author: {
        uid: note.author.uid,
        name: note.author.name,
        email: note.author.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  private mapToResponseDto(note: {
    uid: string;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    stage: { uid: string };
    hiringProcess: { uid: string };
    author: { uid: string; name: string; email: string };
  }): StageNoteResponseDto {
    return {
      uid: note.uid,
      content: note.content,
      rating: note.rating,
      stageUid: note.stage.uid,
      hiringProcessUid: note.hiringProcess.uid,
      author: {
        uid: note.author.uid,
        name: note.author.name,
        email: note.author.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
