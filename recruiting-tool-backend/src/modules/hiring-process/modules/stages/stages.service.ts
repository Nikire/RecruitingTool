import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStageDto, UpdateStageDto } from './dto/stages.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { StageMapper } from './entities/stage.entity';

@Injectable()
export class StagesService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createStageDto: CreateStageDto) {
    const { jobPositionUid, title, type, description } = createStageDto;

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
        JobPosition: { connect: { uid: jobPositionUid } },
      },
    });

    return StageMapper(stage);
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

    const jobPositionId = await this.databaseService.jobPosition
      .findUnique({
        where: { uid: jobPositionUid },
      })
      .then((jp) => jp.id);

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
        position: index,
        jobPositionId,
        ...(hiringProcessId !== undefined && { hiringProcessId }),
      })),
    });

    return createdStages.map(StageMapper);
  }
}
