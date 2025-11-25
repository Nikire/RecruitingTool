import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStageDto, UpdateStageDto, StageResponseDto } from './dto/stages.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { StageMapper } from './entities/stage.entity';
import { StageStatus } from '@prisma/client';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { CreateStageNoteDto, UpdateStageNoteDto, StageNoteResponseDto } from './dto/stage-note.dto';

@Injectable()
export class StagesService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createStageDto: CreateStageDto) {
    const { jobPositionUid, title, type, description, estimatedTime } = createStageDto;

    const maxPosition = await this.databaseService.stage.aggregate({
      where: { JobPosition: { uid: jobPositionUid } },
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
    const { page = 1, limit = 10, search, sortBy = 'position', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count
    const total = await this.databaseService.stage.count({ where });

    // Get paginated data
    const stages = await this.databaseService.stage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: stages.map((stage) => StageMapper(stage)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(uid: string) {
    const stage = await this.databaseService.stage.findUnique({
      where: { uid },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with UID ${uid} not found`);
    }

    return StageMapper(stage);
  }

  async update(uid: string, updateStageDto: UpdateStageDto) {
    const stage = await this.databaseService.stage.findUnique({
      where: { uid },
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
            },
            data: { position: { increment: 1 } },
          });
        } else {
          await tx.stage.updateMany({
            where: {
              hiringProcessId,
              position: { gt: stage.position, lte: position },
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
    const stageToDelete = await this.databaseService.stage.findUnique({
      where: { uid },
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

    // Get hiringProcessId if hiringProcessUid is provided
    let hiringProcessId: number | undefined = undefined;
    if (hiringProcessUid) {
      const hiringProcess = await this.databaseService.hiringProcess.findUnique({
        where: { uid: hiringProcessUid },
      });
      hiringProcessId = hiringProcess?.id;
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

    return createdStages.map(StageMapper);
  }

  async progressToNextStage(hiringProcessUid: string) {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process with UID ${hiringProcessUid} not found`);
    }

    const currentStage = hiringProcess.stages.find((stage) => stage.status === StageStatus.CURRENT);

    if (!currentStage) {
      throw new NotFoundException('No current stage found in this hiring process');
    }

    const nextStage = hiringProcess.stages.find(
      (stage) => stage.position === currentStage.position + 1,
    );

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

    const updatedStages = await this.databaseService.stage.findMany({
      where: { hiringProcessId: hiringProcess.id },
      orderBy: { position: 'asc' },
    });

    return updatedStages.map(StageMapper);
  }

  async moveToSpecificStage(hiringProcessUid: string, targetStageUid: string) {
    const hiringProcess = await this.databaseService.hiringProcess.findUnique({
      where: { uid: hiringProcessUid },
      include: {
        stages: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process with UID ${hiringProcessUid} not found`);
    }

    const targetStage = hiringProcess.stages.find((stage) => stage.uid === targetStageUid);

    if (!targetStage) {
      throw new NotFoundException(`Target stage with UID ${targetStageUid} not found in this hiring process`);
    }

    // Reset all stages to OPEN first
    await this.databaseService.stage.updateMany({
      where: { hiringProcessId: hiringProcess.id },
      data: { status: StageStatus.OPEN },
    });

    // Mark all stages before target as DONE, and target as CURRENT
    const updates = hiringProcess.stages.map((stage) => {
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
    }).filter(Boolean);

    await this.databaseService.$transaction(updates);

    const updatedStages = await this.databaseService.stage.findMany({
      where: { hiringProcessId: hiringProcess.id },
      orderBy: { position: 'asc' },
    });

    return updatedStages.map(StageMapper);
  }

  // Stage Notes methods
  async createNote(stageUid: string, createNoteDto: CreateStageNoteDto, authorUserId: number): Promise<StageNoteResponseDto> {
    // Find stage by UID to get the numeric ID
    const stage = await this.databaseService.stage.findUnique({
      where: { uid: stageUid },
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
    const stage = await this.databaseService.stage.findUnique({
      where: { uid: stageUid },
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
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new NotFoundException(`Note ${noteUid} not found`);
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
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    // Verify that the current user is the note author
    if (existingNote.authorId !== authorUserId) {
      throw new NotFoundException(`Note ${noteUid} not found`);
    }

    await this.databaseService.stageNote.delete({
      where: { uid: noteUid },
    });

    return { message: 'Note deleted successfully' };
  }
}
