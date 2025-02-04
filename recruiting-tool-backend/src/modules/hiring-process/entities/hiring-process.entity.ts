import { HiringProcess, Prisma } from '@prisma/client';
import { UserMapper } from 'src/modules/users/entities/users.entities';
import { StageMapper } from '../modules/stages/entities/stage.entity';

type HiringProcessWithRelations = Prisma.HiringProcessGetPayload<{
  include: { candidate: true; stages: true };
}>;

export function HiringProcessMapper(hiringProcess: HiringProcess) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
  };
}

export function HiringProcessOneMapper(hiringProcess: HiringProcessWithRelations) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
    candidate: UserMapper(hiringProcess.candidate),
    stages: hiringProcess.stages.map(StageMapper),
  };
}
