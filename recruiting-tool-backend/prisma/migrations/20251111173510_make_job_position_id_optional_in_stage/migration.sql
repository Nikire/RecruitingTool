-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_jobPositionId_fkey";

-- AlterTable
ALTER TABLE "Stage" ALTER COLUMN "jobPositionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
