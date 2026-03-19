import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { UpsertStageNoteDto, StageNoteResponseDto, CandidateStageNotesResponseDto } from './dto/stage-note.dto';

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
   */
  private async resolveHiringProcessId(hiringProcessUid: string): Promise<{ id: number; uid: string }> {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
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
      },
      update: {
        content: dto.content,
        rating: dto.rating,
        authorId,
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
   * Get the note for a specific stage within a hiring process.
   */
  async findOne(hiringProcessUid: string, stageUid: string): Promise<StageNoteResponseDto> {
    const hiringProcess = await this.resolveHiringProcessId(hiringProcessUid);
    const stageId = await this.resolveStageId(stageUid, hiringProcess.id);

    const note = await this.databaseService.stageNote.findUnique({
      where: {
        stageId_hiringProcessId: {
          stageId,
          hiringProcessId: hiringProcess.id,
        },
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
   * Delete the note for a specific stage within a hiring process.
   */
  async remove(hiringProcessUid: string, stageUid: string): Promise<{ message: string }> {
    const hiringProcess = await this.resolveHiringProcessId(hiringProcessUid);
    const stageId = await this.resolveStageId(stageUid, hiringProcess.id);

    const existing = await this.databaseService.stageNote.findUnique({
      where: {
        stageId_hiringProcessId: {
          stageId,
          hiringProcessId: hiringProcess.id,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`No note found for stage ${stageUid} in hiring process ${hiringProcessUid}`);
    }

    await this.databaseService.stageNote.delete({
      where: {
        stageId_hiringProcessId: {
          stageId,
          hiringProcessId: hiringProcess.id,
        },
      },
    });

    return { message: 'Stage note deleted successfully' };
  }

  /**
   * Get all stage evaluation notes for a candidate (across all hiring processes and stages).
   */
  async findByCandidateUid(candidateUid: string): Promise<CandidateStageNotesResponseDto[]> {
    const notes = await this.databaseService.stageNote.findMany({
      where: {
        hiringProcess: {
          candidate: { uid: candidateUid },
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
