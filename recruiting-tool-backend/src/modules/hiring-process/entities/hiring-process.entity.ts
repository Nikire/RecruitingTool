import { HiringProcess, Prisma } from '@prisma/client';
import { StageMapper } from '../modules/stages/entities/stage.entity';
import { CandidateMapper } from '../modules/candidate/entities/candidate.entity';

export const includeHiringProcess = { candidate: true, stages: true };

type HiringProcessWithRelations = Prisma.HiringProcessGetPayload<{
  include: typeof includeHiringProcess;
}>;

export function HiringProcessOneMapper(hiringProcess: HiringProcessWithRelations) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
    stages: hiringProcess.stages.map(StageMapper),
    candidate: CandidateMapper(hiringProcess.candidate),
  };
}
