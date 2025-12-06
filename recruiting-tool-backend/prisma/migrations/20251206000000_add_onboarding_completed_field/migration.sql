-- AlterEnum
ALTER TYPE "ApplicationSource" ADD VALUE 'CSV_IMPORT';

-- AlterEnum
ALTER TYPE "RolesType" ADD VALUE 'COMPANY_OWNER';

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT IF EXISTS "Candidate_hiringProcessId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT IF EXISTS "EmailTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewInterviewer" DROP CONSTRAINT IF EXISTS "InterviewInterviewer_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_companyId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Candidate_hiringProcessId_email_key";

-- DropIndex
DROP INDEX IF EXISTS "Candidate_hiringProcessId_key";

-- DropIndex
DROP INDEX IF EXISTS "HiringProcess_candidateId_key";

-- DropIndex
DROP INDEX IF EXISTS "InterviewInterviewer_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Profile_uid_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_email_key";

-- AlterTable
ALTER TABLE "AIQuota" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AIUsageLog" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BatchScoringJob" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CalendarConnection" ALTER COLUMN "uid" DROP DEFAULT,
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable - Remove hiringProcessId from Candidate if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Candidate' AND column_name = 'hiringProcessId') THEN
        ALTER TABLE "Candidate" DROP COLUMN "hiringProcessId";
    END IF;
END $$;

-- AlterTable
ALTER TABLE "CandidateActivity" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable - Make authorId nullable if not already
ALTER TABLE "CandidateNote" ALTER COLUMN "authorId" DROP NOT NULL;

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

-- AlterTable
ALTER TABLE "StageNote" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StageTimeLog" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "uid" DROP DEFAULT;

-- AlterTable - Add onboardingCompleted to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserActivityLog" ALTER COLUMN "uid" DROP DEFAULT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex (with duplicate handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Application_jobPositionId_applicantEmail_key') THEN
        CREATE UNIQUE INDEX "Application_jobPositionId_applicantEmail_key" ON "Application"("jobPositionId", "applicantEmail");
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate values exist, skipping unique index on Application';
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_entityUid_idx" ON "AuditLog"("entityUid");

-- CreateIndex (with duplicate handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Candidate_email_key') THEN
        CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate values exist, skipping unique index on Candidate.email';
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Candidate_createdAt_idx" ON "Candidate"("createdAt");

-- CreateIndex (with duplicate handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'EmailTemplate_name_companyId_key') THEN
        CREATE UNIQUE INDEX "EmailTemplate_name_companyId_key" ON "EmailTemplate"("name", "companyId");
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate values exist, skipping unique index on EmailTemplate';
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HiringProcess_createdAt_idx" ON "HiringProcess"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JobPosition_createdAt_idx" ON "JobPosition"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JobPosition_companyId_deletedAt_idx" ON "JobPosition"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_roles_idx" ON "User"("roles");

-- CreateIndex (with duplicate handling)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_email_companyId_key') THEN
        CREATE UNIQUE INDEX "User_email_companyId_key" ON "User"("email", "companyId");
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Duplicate values exist, skipping unique index on User';
END $$;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
