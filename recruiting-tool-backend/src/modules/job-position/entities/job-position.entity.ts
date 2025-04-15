import { JobPosition, Prisma } from '@prisma/client';

type JobPositionWithRelations = Prisma.JobPositionGetPayload<{
  include: { stages: true; hiringProcesses: true };
}>;

export function JobPositionMapper(jobPosition: JobPosition) {
  return {
    id: jobPosition.id,
    uid: jobPosition.uid,
    title: jobPosition.title,
    status: jobPosition.status,
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
