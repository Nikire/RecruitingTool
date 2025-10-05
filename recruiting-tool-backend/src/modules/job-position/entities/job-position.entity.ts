import { JobPosition, Prisma } from '@prisma/client';
import { PublicHiringProcessOneMapper } from 'src/modules/hiring-process/entities/hiring-process.entity';
import { StageMapper } from 'src/modules/hiring-process/modules/stages/entities/stage.entity';
import { PublicUserMapper } from 'src/modules/users/entities/users.entities';

export const includeJobPosition = { stages: true, hiringProcesses: true, createdBy: true };

type JobPositionWithRelations = Prisma.JobPositionGetPayload<{
  include: typeof includeJobPosition;
}>;

export function JobPositionMapper(jobPosition: JobPosition | JobPositionWithRelations) {
  return {
    uid: jobPosition.uid,
    title: jobPosition.title,
    status: jobPosition.status,
    stages: Array.isArray((jobPosition as any).stages) ? (jobPosition as any).stages.map((stage) => StageMapper(stage)) : [],
    // hiringProcesses: Array.isArray((jobPosition as any).hiringProcesses) ? (jobPosition as any).hiringProcesses.map((hp) => PublicHiringProcessOneMapper(hp)) : [],
  };
}

export function JobPositionOneMapper(jobPosition: JobPositionWithRelations) {
  return {
    uid: jobPosition.uid,
    title: jobPosition.title,
    status: jobPosition.status,
    stages: Array.isArray((jobPosition as any).stages) ? (jobPosition as any).stages.map((stage) => StageMapper(stage)) : [],
    // hiringProcesses: Array.isArray((jobPosition as any).hiringProcesses) ? (jobPosition as any).hiringProcesses.map((hp) => PublicHiringProcessOneMapper(hp)) : [],
    createdBy: PublicUserMapper(jobPosition.createdBy),
  };
}
