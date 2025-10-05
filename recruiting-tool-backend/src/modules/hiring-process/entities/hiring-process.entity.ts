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
    stages: Array.isArray(hiringProcess.stages) ? hiringProcess.stages.map((stage) => StageMapper(stage)) : [],
    candidate: hiringProcess.candidate ? CandidateMapper(hiringProcess.candidate) : null,
  };
}

export function PublicHiringProcessOneMapper(hiringProcess: HiringProcessWithRelations) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
  };
}
