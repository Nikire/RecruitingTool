-- Rollback for migration: 20251128140000_implement_soft_delete_and_cascade_behavior
-- WARNING: Cannot restore soft-deleted records, only removes deletedAt columns
-- WARNING: Reverting cascade behaviors may cause referential integrity issues
-- Soft-deleted records will be permanently lost after this rollback

-- Drop deletedAt indexes
DROP INDEX IF EXISTS "Interview_deletedAt_idx";
DROP INDEX IF EXISTS "Application_deletedAt_idx";
DROP INDEX IF EXISTS "Candidate_deletedAt_idx";
DROP INDEX IF EXISTS "JobPosition_deletedAt_idx";

-- Revert cascade behaviors: CandidateActivity (SetNull -> Cascade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateActivity') THEN
    ALTER TABLE "CandidateActivity" DROP CONSTRAINT IF EXISTS "CandidateActivity_candidateId_fkey";
    ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Revert cascade behaviors: CandidateScore (SetNull -> Cascade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateScore') THEN
    ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_candidateId_fkey";
    ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Revert cascade behaviors: StageTimeLog (SetNull -> Cascade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'StageTimeLog') THEN
    ALTER TABLE "StageTimeLog" DROP CONSTRAINT IF EXISTS "StageTimeLog_candidateId_fkey";
    ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Revert cascade behaviors: CandidateNote (SetNull -> Cascade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CandidateNote') THEN
    ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_candidateId_fkey";
    ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Revert cascade behaviors: FileUpload (SetNull -> Cascade)
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_candidateId_fkey";
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Revert cascade behaviors: Stage (SetNull -> Cascade)
ALTER TABLE "Stage" DROP CONSTRAINT IF EXISTS "Stage_jobPositionId_fkey";
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Revert cascade behaviors: HiringProcess (SetNull -> Cascade)
ALTER TABLE "HiringProcess" DROP CONSTRAINT IF EXISTS "HiringProcess_jobPositionId_fkey";
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Revert cascade behaviors: HiringProcess.candidate (SetNull -> Cascade)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HiringProcess_candidateId_fkey') THEN
    ALTER TABLE "HiringProcess" DROP CONSTRAINT "HiringProcess_candidateId_fkey";
  END IF;
END $$;

ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop deletedAt columns
ALTER TABLE "Interview" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Application" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Candidate" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "JobPosition" DROP COLUMN IF EXISTS "deletedAt";
