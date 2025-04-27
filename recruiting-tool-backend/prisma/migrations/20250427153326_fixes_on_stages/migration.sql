/*
  Warnings:

  - Made the column `jobPositionId` on table `Stage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_hiringProcessId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_jobPositionId_fkey";

-- AlterTable
ALTER TABLE "Stage" ALTER COLUMN "hiringProcessId" DROP NOT NULL,
ALTER COLUMN "jobPositionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
