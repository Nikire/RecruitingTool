-- AlterEnum
BEGIN;
CREATE TYPE "InterviewStatus_new" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Interview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Interview" ALTER COLUMN "status" TYPE "InterviewStatus_new" USING ("status"::text::"InterviewStatus_new");
ALTER TYPE "InterviewStatus" RENAME TO "InterviewStatus_old";
ALTER TYPE "InterviewStatus_new" RENAME TO "InterviewStatus";
DROP TYPE "InterviewStatus_old";
ALTER TABLE "Interview" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "StageNote" DROP CONSTRAINT "StageNote_stageId_fkey";

-- DropForeignKey
ALTER TABLE "StageNote" DROP CONSTRAINT "StageNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewInterviewer" DROP CONSTRAINT "InterviewInterviewer_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewInterviewer" DROP CONSTRAINT "InterviewInterviewer_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserActivityLog" DROP CONSTRAINT "UserActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "HRSchedule" DROP CONSTRAINT "HRSchedule_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScorecardTemplate" DROP CONSTRAINT "ScorecardTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ScorecardCategory" DROP CONSTRAINT "ScorecardCategory_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ScorecardCriterion" DROP CONSTRAINT "ScorecardCriterion_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Scorecard" DROP CONSTRAINT "Scorecard_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Scorecard" DROP CONSTRAINT "Scorecard_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Scorecard" DROP CONSTRAINT "Scorecard_evaluatorId_fkey";

-- DropForeignKey
ALTER TABLE "ScorecardScore" DROP CONSTRAINT "ScorecardScore_scorecardId_fkey";

-- DropIndex
DROP INDEX "Interview_scheduledDate_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deactivatedAt",
DROP COLUMN "deactivatedBy",
DROP COLUMN "isActive",
DROP COLUMN "lastLoginAt";

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "location";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "uid" SET DEFAULT gen_random_uuid();

-- DropTable
DROP TABLE "StageNote";

-- DropTable
DROP TABLE "InterviewInterviewer";

-- DropTable
DROP TABLE "UserActivityLog";

-- DropTable
DROP TABLE "HRSchedule";

-- DropTable
DROP TABLE "ScorecardTemplate";

-- DropTable
DROP TABLE "ScorecardCategory";

-- DropTable
DROP TABLE "ScorecardCriterion";

-- DropTable
DROP TABLE "Scorecard";

-- DropTable
DROP TABLE "ScorecardScore";

