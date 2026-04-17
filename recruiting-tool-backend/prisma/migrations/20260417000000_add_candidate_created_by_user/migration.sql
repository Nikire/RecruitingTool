-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "createdByUserId" INTEGER;

-- CreateIndex
CREATE INDEX "Candidate_createdByUserId_idx" ON "Candidate"("createdByUserId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
