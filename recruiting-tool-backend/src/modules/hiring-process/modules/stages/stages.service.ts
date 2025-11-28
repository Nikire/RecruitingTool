import { Injectable, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { CreateStageDto, UpdateStageDto, StageResponseDto } from './dto/stages.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { StageMapper } from './entities/stage.entity';
import { StageStatus } from '@prisma/client';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CreateStageNoteDto, UpdateStageNoteDto, StageNoteResponseDto } from './dto/stage-note.dto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { StageMetricsResponseDto } from './dto/stage-time-tracking.dto';
import { SseService } from 'src/modules/sse/sse.service';

@Injectable()
export class StagesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly sseService: SseService,
  ) {}
  async create(createStageDto: CreateStageDto) {
    const { jobPositionUid, title, type, description, estimatedTime } = createStageDto;

    const maxPosition = await this.databaseService.stage.aggregate({
      where: {
        JobPosition: { uid: jobPositionUid },
        deletedAt: null, // Exclude soft-deleted stages when calculating position
      },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? 0) + 1; // null = position 0, then is last position + 1

    const stage = await this.databaseService.stage.create({
      data: {
        title,
        type,
        description,
        position: newPosition,
        estimatedTime,
        JobPosition: { connect: { uid: jobPositionUid } },
      },
    });

    return StageMapper(stage);
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<StageResponseDto>> {
    const { page = 1, pageSize = 10, search, sortBy = 'position', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * pageSize;

    // Build where clause for search and exclude soft-deleted stages
    const where: any = search
      ? {
          OR: [{ title: { contains: search, mode: 'insensitive' as const } }, { description: { contains: search, mode: 'insensitive' as const } }],
        }
      : {};

    // Exclude soft-deleted stages
    where.deletedAt = null;

    // Get total count
    const total = await this.databaseService.stage.count({ where });

    // Get paginated data
    const stages = await this.databaseService.stage.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: stages.map((stage) => StageMapper(stage)),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(uid: string) {
    const stage = await this.databaseService.stage.findFirst({
      where: { uid, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${uid} not found`);
    }

    return StageMapper(stage);
  }

  async update(uid: string, updateStageDto: UpdateStageDto) {
    const stage = await this.databaseService.stage.findFirst({
      where: { uid, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${uid} not found`);
    }

    const { position, ...updateData } = updateStageDto;
    const hiringProcessId = stage.hiringProcessId;

    if (position !== undefined && position !== stage.position) {
      await this.databaseService.$transaction(async (tx) => {
        if (position < stage.position) {
          await tx.stage.updateMany({
            where: {
              hiringProcessId,
              position: { gte: position, lt: stage.position },
              deletedAt: null, // Exclude soft-deleted stages from position adjustment
            },
            data: { position: { increment: 1 } },
          });
        } else {
          await tx.stage.updateMany({
            where: {
              hiringProcessId,
              position: { gt: stage.position, lte: position },
              deletedAt: null, // Exclude soft-deleted stages from position adjustment
            },
            data: { position: { decrement: 1 } },
          });
        }
        await tx.stage.update({
          where: { uid },
          data: { position },
        });
      });
    }
    const updatedStage = await this.databaseService.stage.update({
      where: { uid },
      data: updateData,
    });
    return StageMapper(updatedStage);
  }

  async remove(uid: string) {
    const stageToDelete = await this.databaseService.stage.findFirst({
      where: { uid, deletedAt: null },
    });

    if (!stageToDelete) throw new NotFoundException(`Stage with UID ${uid} not found`);

    const hiringProcessId = stageToDelete.hiringProcessId;
    const deletedPosition = stageToDelete.position;

    await this.databaseService.$transaction(async (tx) => {
      await tx.stage.delete({ where: { uid } });

      await tx.stage.updateMany({
        where: {
          hiringProcessId,
          position: { gt: deletedPosition },
          deletedAt: null, // Exclude soft-deleted stages from position adjustment
        },
        data: { position: { decrement: 1 } },
      });
    });

    return { message: `Stage ${uid} deleted successfully` };
  }

  async bulkCreateStages(stages: CreateStageDto[]) {
    if (stages.length === 0) return [];

    const jobPositionUid = stages[0].jobPositionUid;
    const hiringProcessUid = stages[0].hiringProcessUid;

    // Get jobPositionId if jobPositionUid is provided
    let jobPositionId: number | undefined = undefined;
    if (jobPositionUid) {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { uid: jobPositionUid },
      });
      jobPositionId = jobPosition?.id;
    }

    // Get hiringProcessId and candidateId if hiringProcessUid is provided
    let hiringProcessId: number | undefined = undefined;
    let candidateId: number | undefined = undefined;
    if (hiringProcessUid) {
      const hiringProcess = await this.databaseService.hiringProcess.findUnique({
        where: { uid: hiringProcessUid },
        include: { candidate: true },
      });
      hiringProcessId = hiringProcess?.id;
      candidateId = hiringProcess?.candidateId ?? undefined;
    }

    const createdStages = await this.databaseService.stage.createManyAndReturn({
      data: stages.map((stage, index) => ({
        title: stage.title,
        type: stage.type,
        description: stage.description,
        estimatedTime: stage.estimatedTime,
        position: index,
        ...(jobPositionId !== undefined && { jobPositionId }),
        ...(hiringProcessId !== undefined && { hiringProcessId }),
        status: index === 0 ? StageStatus.CURRENT : StageStatus.OPEN,
      })),
    });

    // Create time log for first stage (CURRENT) if this is for a hiring process with a candidate
    if (hiringProcessId && candidateId && createdStages.length > 0) {
      const firstStage = createdStages[0];
      await this.createTimeLog(firstStage.id, candidateId);
    }

    return createdStages.map(StageMapper);
  }

  async progressToNextStage(hiringProcessUid: string) {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
        candidate: true,
      },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process with UID ${hiringProcessUid} not found`);
    }

    const currentStage = hiringProcess.stages.find((stage) => stage.status === StageStatus.CURRENT);

    if (!currentStage) {
      throw new NotFoundException('No current stage found in this hiring process');
    }

    const nextStage = hiringProcess.stages.find((stage) => stage.position === currentStage.position + 1);

    // Exit time log for current stage (if candidate exists)
    if (hiringProcess.candidateId) {
      await this.exitTimeLog(currentStage.id, hiringProcess.candidateId);
    }

    if (!nextStage) {
      // No next stage, mark current as done and hiring process as completed
      await this.databaseService.$transaction([
        this.databaseService.stage.update({
          where: { id: currentStage.id },
          data: { status: StageStatus.DONE },
        }),
        this.databaseService.hiringProcess.update({
          where: { id: hiringProcess.id },
          data: { status: 'CLOSED' },
        }),
      ]);

      return { message: 'Hiring process completed successfully' };
    }

    // Mark current stage as done and next stage as current
    await this.databaseService.$transaction([
      this.databaseService.stage.update({
        where: { id: currentStage.id },
        data: { status: StageStatus.DONE },
      }),
      this.databaseService.stage.update({
        where: { id: nextStage.id },
        data: { status: StageStatus.CURRENT },
      }),
    ]);

    // Create time log for next stage (if candidate exists)
    if (hiringProcess.candidateId) {
      await this.createTimeLog(nextStage.id, hiringProcess.candidateId);
    }

    const updatedStages = await this.databaseService.stage.findMany({
      where: { hiringProcessId: hiringProcess.id },
      orderBy: { position: 'asc' },
    });

    // Emit SSE event for candidate status changed
    if (hiringProcess.candidate) {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { id: hiringProcess.jobPositionId },
        include: { company: true },
      });

      if (jobPosition) {
        this.sseService.emitCandidateStatusChanged(
          hiringProcess.candidate.uid,
          hiringProcess.candidate.name,
          hiringProcess.uid,
          currentStage.title,
          nextStage.title,
          jobPosition.title,
          jobPosition.uid,
          undefined, // userUid - send to all users
          jobPosition.company?.uid, // companyUid - filter by company
        );
      }
    }

    return updatedStages.map(StageMapper);
  }

  async moveToSpecificStage(hiringProcessUid: string, targetStageUid: string) {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
        candidate: true,
      },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process with UID ${hiringProcessUid} not found`);
    }

    const targetStage = hiringProcess.stages.find((stage) => stage.uid === targetStageUid);

    if (!targetStage) {
      throw new NotFoundException(`Target stage with UID ${targetStageUid} not found in this hiring process`);
    }

    // Find current stage and exit its time log
    const currentStage = hiringProcess.stages.find((stage) => stage.status === StageStatus.CURRENT);
    if (currentStage && hiringProcess.candidateId) {
      await this.exitTimeLog(currentStage.id, hiringProcess.candidateId);
    }

    // Reset all stages to OPEN first
    await this.databaseService.stage.updateMany({
      where: { hiringProcessId: hiringProcess.id },
      data: { status: StageStatus.OPEN },
    });

    // Mark all stages before target as DONE, and target as CURRENT
    const updates = hiringProcess.stages
      .map((stage) => {
        if (stage.position < targetStage.position) {
          return this.databaseService.stage.update({
            where: { id: stage.id },
            data: { status: StageStatus.DONE },
          });
        } else if (stage.id === targetStage.id) {
          return this.databaseService.stage.update({
            where: { id: stage.id },
            data: { status: StageStatus.CURRENT },
          });
        }
        return null;
      })
      .filter(Boolean);

    await this.databaseService.$transaction(updates);

    // Create time log for target stage
    if (hiringProcess.candidateId) {
      await this.createTimeLog(targetStage.id, hiringProcess.candidateId);
    }

    const updatedStages = await this.databaseService.stage.findMany({
      where: { hiringProcessId: hiringProcess.id },
      orderBy: { position: 'asc' },
    });

    // Emit SSE event for candidate status changed
    if (hiringProcess.candidate) {
      const jobPosition = await this.databaseService.jobPosition.findUnique({
        where: { id: hiringProcess.jobPositionId },
        include: { company: true },
      });

      if (jobPosition) {
        this.sseService.emitCandidateStatusChanged(
          hiringProcess.candidate.uid,
          hiringProcess.candidate.name,
          hiringProcess.uid,
          currentStage?.title,
          targetStage.title,
          jobPosition.title,
          jobPosition.uid,
          undefined, // userUid - send to all users
          jobPosition.company?.uid, // companyUid - filter by company
        );
      }
    }

    return updatedStages.map(StageMapper);
  }

  // Stage Notes methods
  async createNote(stageUid: string, createNoteDto: CreateStageNoteDto, authorUserId: number): Promise<StageNoteResponseDto> {
    // Find stage by UID to get the numeric ID
    const stage = await this.databaseService.stage.findFirst({
      where: { uid: stageUid, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException(`Stage ${stageUid} not found`);
    }

    const note = await this.databaseService.stageNote.create({
      data: {
        content: createNoteDto.content,
        stageId: stage.id,
        authorId: authorUserId,
      },
      include: {
        author: true,
        stage: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      stageUid: note.stage.uid,
      author: {
        uid: note.author.uid,
        name: note.author.name,
        email: note.author.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async findNotesByStageUid(stageUid: string): Promise<StageNoteResponseDto[]> {
    const stage = await this.databaseService.stage.findFirst({
      where: { uid: stageUid, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException(`Stage ${stageUid} not found`);
    }

    const notes = await this.databaseService.stageNote.findMany({
      where: { stageId: stage.id },
      include: {
        author: true,
        stage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => ({
      uid: note.uid,
      content: note.content,
      stageUid: note.stage.uid,
      author: {
        uid: note.author.uid,
        name: note.author.name,
        email: note.author.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  async updateNote(noteUid: string, updateNoteDto: UpdateStageNoteDto, authorUserId: number): Promise<StageNoteResponseDto> {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.stageNote.findUnique({
      where: { uid: noteUid },
      include: {
        author: true,
        stage: true,
      },
    });

    if (!existingNote) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    const note = await this.databaseService.stageNote.update({
      where: { uid: noteUid },
      data: { content: updateNoteDto.content },
      include: {
        author: true,
        stage: true,
      },
    });

    return {
      uid: note.uid,
      content: note.content,
      stageUid: note.stage.uid,
      author: {
        uid: note.author.uid,
        name: note.author.name,
        email: note.author.email,
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async deleteNote(noteUid: string, authorUserId: number): Promise<{ message: string }> {
    // First fetch the note to verify ownership
    const existingNote = await this.databaseService.stageNote.findUnique({
      where: { uid: noteUid },
    });

    if (!existingNote) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new EntityNotFoundException('Note', noteUid);
    }

    await this.databaseService.stageNote.delete({
      where: { uid: noteUid },
    });

    return { message: 'Note deleted successfully' };
  }

  // Stage Time Tracking methods
  async createTimeLog(stageId: number, candidateId: number): Promise<void> {
    // Check if there's already an active time log for this candidate in this stage
    const existingLog = await this.databaseService.stageTimeLog.findFirst({
      where: {
        stageId,
        candidateId,
        exitedAt: null,
      },
    });

    // If no active log exists, create one
    if (!existingLog) {
      await this.databaseService.stageTimeLog.create({
        data: {
          stageId,
          candidateId,
          enteredAt: new Date(),
        },
      });
    }
  }

  async exitTimeLog(stageId: number, candidateId: number): Promise<void> {
    // Find the active time log
    const activeLog = await this.databaseService.stageTimeLog.findFirst({
      where: {
        stageId,
        candidateId,
        exitedAt: null,
      },
    });

    if (activeLog) {
      const exitedAt = new Date();
      const durationMs = exitedAt.getTime() - activeLog.enteredAt.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60)); // Convert to minutes

      await this.databaseService.stageTimeLog.update({
        where: { id: activeLog.id },
        data: {
          exitedAt,
          duration: durationMinutes,
        },
      });
    }
  }

  async getStageMetrics(stageUid: string): Promise<StageMetricsResponseDto> {
    const stage = await this.databaseService.stage.findFirst({
      where: { uid: stageUid, deletedAt: null },
      include: {
        timeLogs: {
          where: {
            exitedAt: { not: null },
          },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${stageUid} not found`);
    }

    // Count candidates currently in this stage
    const candidatesInStage = await this.databaseService.stageTimeLog.count({
      where: {
        stageId: stage.id,
        exitedAt: null,
      },
    });

    // Calculate metrics from completed time logs
    const completedLogs = stage.timeLogs.filter((log) => log.duration !== null);
    const durations = completedLogs.map((log) => log.duration as number);

    const metrics: StageMetricsResponseDto = {
      stageUid: stage.uid,
      stageTitle: stage.title,
      totalCandidates: completedLogs.length,
      candidatesInStage,
      averageTimeMinutes: durations.length > 0 ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : null,
      minTimeMinutes: durations.length > 0 ? Math.min(...durations) : null,
      maxTimeMinutes: durations.length > 0 ? Math.max(...durations) : null,
    };

    return metrics;
  }
}
