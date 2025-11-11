import { HiringProcess, Prisma } from '@prisma/client';
import { StageMapper } from '../modules/stages/entities/stage.entity';
import { CandidateMapper } from '../modules/candidate/entities/candidate.entity';

export const includeHiringProcess = {
  candidate: true,
  stages: true,
  jobPosition: {
    include: {
      createdBy: true,
      company: true
    }
  },
  company: true
};

type HiringProcessWithRelations = Prisma.HiringProcessGetPayload<{
  include: typeof includeHiringProcess;
}>;

export function HiringProcessOneMapper(hiringProcess: HiringProcessWithRelations) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
    jobPositionId: hiringProcess.jobPositionId,
    stages: Array.isArray(hiringProcess.stages) ? hiringProcess.stages.map((stage) => StageMapper(stage)) : [],
    candidate: hiringProcess.candidate ? CandidateMapper(hiringProcess.candidate) : null,
    company: hiringProcess.company ? {
      uid: hiringProcess.company.uid,
      name: hiringProcess.company.name,
    } : null,
    jobPosition: hiringProcess.jobPosition ? {
      uid: hiringProcess.jobPosition.uid,
      title: hiringProcess.jobPosition.title,
      createdBy: hiringProcess.jobPosition.createdBy ? {
        uid: hiringProcess.jobPosition.createdBy.uid,
        name: hiringProcess.jobPosition.createdBy.name,
        email: hiringProcess.jobPosition.createdBy.email,
      } : null,
    } : null,
  };
}

export function PublicHiringProcessOneMapper(hiringProcess: HiringProcessWithRelations) {
  return {
    uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
    candidate: hiringProcess.candidate ? CandidateMapper(hiringProcess.candidate) : null,
  };
}
