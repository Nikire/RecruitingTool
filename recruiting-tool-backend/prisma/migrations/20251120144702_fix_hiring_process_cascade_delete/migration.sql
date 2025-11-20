-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_hiringProcessId_fkey";

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
