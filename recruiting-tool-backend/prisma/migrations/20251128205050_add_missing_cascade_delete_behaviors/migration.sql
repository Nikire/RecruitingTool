/*
  Warnings:

  - You are about to drop the column `hiringProcessId` on the `Candidate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobPositionId,applicantEmail]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,companyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "QuotaType" AS ENUM ('RESUME_PARSING', 'CANDIDATE_SCORING', 'BATCH_SCORING');

-- CreateEnum
CREATE TYPE "CandidateActivityType" AS ENUM ('CREATED', 'STAGE_CHANGED', 'STATUS_CHANGED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_UPDATED', 'INTERVIEW_CANCELLED', 'INTERVIEW_COMPLETED', 'NOTE_ADDED', 'APPLICATION_RECEIVED', 'EMAIL_SENT');

-- AlterEnum
ALTER TYPE "ApplicationSource" ADD VALUE 'CSV_IMPORT';

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_hiringProcessId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewInterviewer" DROP CONSTRAINT "InterviewInterviewer_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "Candidate_hiringProcessId_email_key";

-- DropIndex
DROP INDEX "Candidate_hiringProcessId_key";

-- DropIndex
DROP INDEX "HiringProcess_candidateId_key";

-- DropIndex
DROP INDEX "InterviewInterviewer_createdAt_idx";

-- DropIndex
DROP INDEX "Profile_uid_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BatchScoringJob" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "hiringProcessId";

-- AlterTable
ALTER TABLE "CandidateScore" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "HRSchedule" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InterviewBookingToken" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InterviewReschedule" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InterviewTimeSlot" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Scorecard" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScorecardCategory" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScorecardCriterion" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScorecardTemplate" ALTER COLUMN "uid" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StageNote" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIQuota" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "companyId" INTEGER NOT NULL,
    "quotaType" "QuotaType" NOT NULL,
    "limit" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "operation" "QuotaType" NOT NULL,
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTimeLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "stageId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageTimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateActivity" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "type" "CandidateActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageNote_uid_key" ON "StageNote"("uid");

-- CreateIndex
CREATE INDEX "StageNote_stageId_idx" ON "StageNote"("stageId");

-- CreateIndex
CREATE INDEX "StageNote_authorId_idx" ON "StageNote"("authorId");

-- CreateIndex
CREATE INDEX "StageNote_uid_idx" ON "StageNote"("uid");

-- CreateIndex
CREATE INDEX "StageNote_createdAt_idx" ON "StageNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserActivityLog_uid_key" ON "UserActivityLog"("uid");

-- CreateIndex
CREATE INDEX "UserActivityLog_userId_idx" ON "UserActivityLog"("userId");

-- CreateIndex
CREATE INDEX "UserActivityLog_action_idx" ON "UserActivityLog"("action");

-- CreateIndex
CREATE INDEX "UserActivityLog_createdAt_idx" ON "UserActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivityLog_uid_idx" ON "UserActivityLog"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "AIQuota_uid_key" ON "AIQuota"("uid");

-- CreateIndex
CREATE INDEX "AIQuota_companyId_idx" ON "AIQuota"("companyId");

-- CreateIndex
CREATE INDEX "AIQuota_quotaType_idx" ON "AIQuota"("quotaType");

-- CreateIndex
CREATE INDEX "AIQuota_uid_idx" ON "AIQuota"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "AIQuota_companyId_quotaType_key" ON "AIQuota"("companyId", "quotaType");

-- CreateIndex
CREATE UNIQUE INDEX "AIUsageLog_uid_key" ON "AIUsageLog"("uid");

-- CreateIndex
CREATE INDEX "AIUsageLog_companyId_idx" ON "AIUsageLog"("companyId");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLog_operation_idx" ON "AIUsageLog"("operation");

-- CreateIndex
CREATE INDEX "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageLog_uid_idx" ON "AIUsageLog"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "StageTimeLog_uid_key" ON "StageTimeLog"("uid");

-- CreateIndex
CREATE INDEX "StageTimeLog_stageId_idx" ON "StageTimeLog"("stageId");

-- CreateIndex
CREATE INDEX "StageTimeLog_candidateId_idx" ON "StageTimeLog"("candidateId");

-- CreateIndex
CREATE INDEX "StageTimeLog_enteredAt_idx" ON "StageTimeLog"("enteredAt");

-- CreateIndex
CREATE INDEX "StageTimeLog_uid_idx" ON "StageTimeLog"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateActivity_uid_key" ON "CandidateActivity"("uid");

-- CreateIndex
CREATE INDEX "CandidateActivity_candidateId_idx" ON "CandidateActivity"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateActivity_type_idx" ON "CandidateActivity"("type");

-- CreateIndex
CREATE INDEX "CandidateActivity_createdAt_idx" ON "CandidateActivity"("createdAt");

-- CreateIndex
CREATE INDEX "CandidateActivity_userId_idx" ON "CandidateActivity"("userId");

-- CreateIndex
CREATE INDEX "CandidateActivity_uid_idx" ON "CandidateActivity"("uid");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobPositionId_applicantEmail_key" ON "Application"("jobPositionId", "applicantEmail");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityUid_idx" ON "AuditLog"("entityUid");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_createdAt_idx" ON "Candidate"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_companyId_key" ON "EmailTemplate"("name", "companyId");

-- CreateIndex
CREATE INDEX "HiringProcess_createdAt_idx" ON "HiringProcess"("createdAt");

-- CreateIndex
CREATE INDEX "JobPosition_createdAt_idx" ON "JobPosition"("createdAt");

-- CreateIndex
CREATE INDEX "JobPosition_companyId_deletedAt_idx" ON "JobPosition"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "User_roles_idx" ON "User"("roles");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_companyId_key" ON "User"("email", "companyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageNote" ADD CONSTRAINT "StageNote_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageNote" ADD CONSTRAINT "StageNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
