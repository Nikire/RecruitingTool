-- Implement soft delete and update cascade behaviors for Issue #63
-- Add deletedAt fields to historical data models
-- Update cascade behaviors from Cascade/Restrict to SetNull

-- AlterTable: Add deletedAt to JobPosition
ALTER TABLE "JobPosition" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Add deletedAt to Candidate
ALTER TABLE "Candidate" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Add deletedAt to Application
ALTER TABLE "Application" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Add deletedAt to Interview
ALTER TABLE "Interview" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Update cascade behaviors: HiringProcess.candidate (may not have FK constraint if nullable)
-- Only drop and recreate if constraint exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HiringProcess_candidateId_fkey') THEN
    ALTER TABLE "HiringProcess" DROP CONSTRAINT "HiringProcess_candidateId_fkey";
  END IF;
END $$;

ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update cascade behaviors: HiringProcess.jobPosition (Cascade -> SetNull)
ALTER TABLE "HiringProcess" DROP CONSTRAINT IF EXISTS "HiringProcess_jobPositionId_fkey";
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update cascade behaviors: Stage.jobPosition (Cascade -> SetNull)
ALTER TABLE "Stage" DROP CONSTRAINT IF EXISTS "Stage_jobPositionId_fkey";
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update cascade behaviors: FileUpload.candidate (Cascade -> SetNull)
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_candidateId_fkey";
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update cascade behaviors for CandidateNote (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateNote') THEN
    ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_candidateId_fkey";
    ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Update cascade behaviors for StageTimeLog (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'StageTimeLog') THEN
    ALTER TABLE "StageTimeLog" DROP CONSTRAINT IF EXISTS "StageTimeLog_candidateId_fkey";
    ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Update cascade behaviors for CandidateScore (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateScore') THEN
    ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_candidateId_fkey";
    ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Update cascade behaviors for CandidateActivity (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateActivity') THEN
    ALTER TABLE "CandidateActivity" DROP CONSTRAINT IF EXISTS "CandidateActivity_candidateId_fkey";
    ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex: Add indexes for deletedAt fields (query performance)
CREATE INDEX "JobPosition_deletedAt_idx" ON "JobPosition"("deletedAt");
CREATE INDEX "Candidate_deletedAt_idx" ON "Candidate"("deletedAt");
CREATE INDEX "Application_deletedAt_idx" ON "Application"("deletedAt");
CREATE INDEX "Interview_deletedAt_idx" ON "Interview"("deletedAt");
