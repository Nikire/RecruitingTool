import { JobPosition, Prisma } from '@prisma/client';
import { PublicHiringProcessOneMapper } from 'src/modules/hiring-process/entities/hiring-process.entity';
import { StageMapper } from 'src/modules/hiring-process/modules/stages/entities/stage.entity';
import { PublicUserMapper } from 'src/modules/users/entities/users.entities';

export const includeJobPosition = {
  stages: {
    where: {
      hiringProcessId: null, // Only get template stages (not hiring process stages)
    },
  },
  hiringProcesses: {
    include: {
      candidate: true,
    },
  },
  createdBy: true,
  company: true,
  // The end client the role is being filled for. Optional relation, so this is null on
  // direct-employer roles and on everything created before the Client model existed.
  client: true,
};

type JobPositionWithRelations = Prisma.JobPositionGetPayload<{
  include: typeof includeJobPosition;
}>;

export function JobPositionMapper(jobPosition: JobPosition | JobPositionWithRelations) {
  return {
    uid: jobPosition.uid,
    title: jobPosition.title,
    description: jobPosition.description,
    status: jobPosition.status,
    customQuestions: jobPosition.customQuestions
      ? Array.isArray(jobPosition.customQuestions)
        ? jobPosition.customQuestions
        : JSON.parse(JSON.stringify(jobPosition.customQuestions))
      : [],
    jobCategory: jobPosition.jobCategory,
    jobType: jobPosition.jobType,
    workLocation: jobPosition.workLocation,
    salaryMin: jobPosition.salaryMin,
    salaryMax: jobPosition.salaryMax,
    salaryCurrency: jobPosition.salaryCurrency,
    salaryPeriod: jobPosition.salaryPeriod,
    benefits: jobPosition.benefits,
    requirements: jobPosition.requirements,
    responsibilities: jobPosition.responsibilities,
    experienceLevel: jobPosition.experienceLevel,
    educationLevel: jobPosition.educationLevel,
    skills: jobPosition.skills,
    applicationDeadline: jobPosition.applicationDeadline,
    isUrgent: jobPosition.isUrgent,
    isFeatured: jobPosition.isFeatured,
    city: jobPosition.city,
    state: jobPosition.state,
    country: jobPosition.country,
    showSalary: jobPosition.showSalary,
    tags: jobPosition.tags,
    isHighlighted: jobPosition.isHighlighted,
    viewCount: jobPosition.viewCount,
    applicationCount: jobPosition.applicationCount,
    candidateSource: jobPosition.candidateSource,
    moderationStatus: jobPosition.moderationStatus,
    moderationReason: jobPosition.moderationReason,
    moderatedAt: jobPosition.moderatedAt,
    clientUid: (jobPosition as any).client?.uid ?? null,
    clientName: (jobPosition as any).client?.name ?? null,
    companyUid: (jobPosition as any).company?.uid,
    companyName: (jobPosition as any).company?.name,
    createdAt: jobPosition.createdAt,
    createdBy: (jobPosition as any).createdBy ? PublicUserMapper((jobPosition as any).createdBy) : undefined,
    stages: Array.isArray((jobPosition as any).stages) ? (jobPosition as any).stages.map((stage) => StageMapper(stage)) : [],
    hiringProcesses: Array.isArray((jobPosition as any).hiringProcesses) ? (jobPosition as any).hiringProcesses.map((hp) => PublicHiringProcessOneMapper(hp)) : [],
  };
}

export function JobPositionOneMapper(jobPosition: JobPositionWithRelations) {
  return {
    uid: jobPosition.uid,
    title: jobPosition.title,
    description: jobPosition.description,
    status: jobPosition.status,
    customQuestions: jobPosition.customQuestions
      ? Array.isArray(jobPosition.customQuestions)
        ? jobPosition.customQuestions
        : JSON.parse(JSON.stringify(jobPosition.customQuestions))
      : [],
    jobCategory: jobPosition.jobCategory,
    jobType: jobPosition.jobType,
    workLocation: jobPosition.workLocation,
    salaryMin: jobPosition.salaryMin,
    salaryMax: jobPosition.salaryMax,
    salaryCurrency: jobPosition.salaryCurrency,
    salaryPeriod: jobPosition.salaryPeriod,
    benefits: jobPosition.benefits,
    requirements: jobPosition.requirements,
    responsibilities: jobPosition.responsibilities,
    experienceLevel: jobPosition.experienceLevel,
    educationLevel: jobPosition.educationLevel,
    skills: jobPosition.skills,
    applicationDeadline: jobPosition.applicationDeadline,
    isUrgent: jobPosition.isUrgent,
    isFeatured: jobPosition.isFeatured,
    city: jobPosition.city,
    state: jobPosition.state,
    country: jobPosition.country,
    showSalary: jobPosition.showSalary,
    tags: jobPosition.tags,
    isHighlighted: jobPosition.isHighlighted,
    viewCount: jobPosition.viewCount,
    applicationCount: jobPosition.applicationCount,
    candidateSource: jobPosition.candidateSource,
    moderationStatus: jobPosition.moderationStatus,
    moderationReason: jobPosition.moderationReason,
    moderatedAt: jobPosition.moderatedAt,
    clientUid: (jobPosition as any).client?.uid ?? null,
    clientName: (jobPosition as any).client?.name ?? null,
    companyUid: (jobPosition as any).company?.uid,
    companyName: (jobPosition as any).company?.name,
    createdAt: jobPosition.createdAt,
    stages: Array.isArray((jobPosition as any).stages) ? (jobPosition as any).stages.map((stage) => StageMapper(stage)) : [],
    hiringProcesses: Array.isArray((jobPosition as any).hiringProcesses) ? (jobPosition as any).hiringProcesses.map((hp) => PublicHiringProcessOneMapper(hp)) : [],
    createdBy: PublicUserMapper(jobPosition.createdBy),
  };
}

export function PublicJobPositionMapper(jobPosition: JobPosition | JobPositionWithRelations) {
  return {
    uid: jobPosition.uid,
    title: jobPosition.title,
    description: jobPosition.description,
    companyName: (jobPosition as any).company?.name || 'Unknown Company',
  };
}
