ALTER TABLE "Candidate" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Candidate_companyId_idx" ON "Candidate"("companyId");
