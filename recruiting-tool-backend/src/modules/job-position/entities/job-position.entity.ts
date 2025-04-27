import { JobPosition, Prisma } from '@prisma/client';
import { HiringProcessOneMapper } from 'src/modules/hiring-process/entities/hiring-process.entity';
import { StageMapper } from 'src/modules/hiring-process/modules/stages/entities/stage.entity';

export const includeJobPosition = { stages: true, hiringProcesses: true };

type JobPositionWithRelations = Prisma.JobPositionGetPayload<{
  include: typeof includeJobPosition;
}>;

export function JobPositionMapper(jobPosition: JobPosition | JobPositionWithRelations) {
  return {
    id: jobPosition.id,
    uid: jobPosition.uid,
    title: jobPosition.title,
    status: jobPosition.status,
    stages: Array.isArray((jobPosition as any).stages) ? (jobPosition as any).stages.map(StageMapper) : [],
    hiringProcesses: Array.isArray((jobPosition as any).hiringProcesses) ? (jobPosition as any).hiringProcesses.map(HiringProcessOneMapper) : [],
  };
}

export function JobPositionOneMapper(jobPosition: JobPositionWithRelations) {
  return {
    id: jobPosition.id,
    uid: jobPosition.uid,
    title: jobPosition.title,
    status: jobPosition.status,
    hiringProcesses: jobPosition.hiringProcesses,
    stages: jobPosition.stages,
  };
}
