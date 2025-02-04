import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStageDto, UpdateStageDto } from './dto/stages.dto';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { StageMapper } from './entities/stage.entity';

@Injectable()
export class StagesService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createStageDto: CreateStageDto) {
    const { hiringProcessUid, title, type, description } = createStageDto;

    const maxPosition = await this.databaseService.stage.aggregate({
      where: { uid: hiringProcessUid },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? 0) + 1; // null = position 0, then is last position + 1

    const stage = await this.databaseService.stage.create({
      data: {
        title,
        type,
        description,
        position: newPosition,
        hiringProcess: { connect: { uid: hiringProcessUid } },
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
    const uid = stages[0].hiringProcessUid;
    const hiringProcessId = await this.databaseService.hiringProcess.findUnique({ where: { uid } }).then((hp) => hp.id);

    const createdStages = await this.databaseService.stage.createManyAndReturn({
      data: stages.map((stage, index) => ({
        ...stage,
        position: index,
        hiringProcessId,
      })),
    });

    return createdStages.map(StageMapper);
  }
}
