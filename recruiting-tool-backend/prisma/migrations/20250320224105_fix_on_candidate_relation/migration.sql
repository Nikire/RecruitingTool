-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_hiringProcessId_fkey";

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "hiringProcessId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE SET NULL ON UPDATE CASCADE;
