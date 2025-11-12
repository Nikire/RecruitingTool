import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStageDto, UpdateStageDto, StageResponseDto } from './dto/stages.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { StageMapper } from './entities/stage.entity';
import { StageStatus } from '@prisma/client';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';

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
}
