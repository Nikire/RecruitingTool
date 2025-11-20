-- DropForeignKey
ALTER TABLE "HiringProcess" DROP CONSTRAINT "HiringProcess_jobPositionId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobPositionId_fkey";

-- AddForeignKey
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
