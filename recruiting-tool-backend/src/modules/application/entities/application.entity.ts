import { Application, Prisma } from '@prisma/client';

export const includeApplication = {
  jobPosition: {
    include: {
      company: true,
    },
  },
  resumeFile: true,
  reviewedBy: true,
};

type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof includeApplication;
}>;

export function ApplicationMapper(application: Application | ApplicationWithRelations) {
  return {
    uid: application.uid,
    jobPositionUid: (application as any).jobPosition?.uid,
    jobPositionTitle: (application as any).jobPosition?.title,
    companyName: (application as any).jobPosition?.company?.name,
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
    applicantPhone: application.applicantPhone,
    resumeFileUid: (application as any).resumeFile?.uid,
    resumeFileName: (application as any).resumeFile?.originalName,
    coverLetter: application.coverLetter,
    status: application.status,
    appliedAt: application.appliedAt,
    reviewedAt: application.reviewedAt,
    reviewedByUid: (application as any).reviewedBy?.uid,
    reviewedByName: (application as any).reviewedBy?.name,
    notes: application.notes,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}
