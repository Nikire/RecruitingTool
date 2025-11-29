-- Rollback for migration: 20251128_fix_cascade_delete_behavior
-- WARNING: This reverts important data preservation changes
-- WARNING: Reverting these changes may cause data loss when deleting entities
-- Not recommended to rollback this migration in production

-- 6. Revert BatchScoringJob: SetNull -> Cascade, make jobPositionId required
ALTER TABLE "BatchScoringJob" DROP CONSTRAINT IF EXISTS "BatchScoringJob_jobPositionId_fkey";
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Note: Cannot make column NOT NULL if there are NULL values
-- UPDATE "BatchScoringJob" SET "jobPositionId" = ... WHERE "jobPositionId" IS NULL;
-- ALTER TABLE "BatchScoringJob" ALTER COLUMN "jobPositionId" SET NOT NULL;

-- 5. Revert CandidateScore: SetNull -> Cascade, make fields required
ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_jobPositionId_fkey";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Note: Cannot make columns NOT NULL if there are NULL values
-- UPDATE "CandidateScore" SET "jobPositionId" = ... WHERE "jobPositionId" IS NULL;
-- UPDATE "CandidateScore" SET "candidateId" = ... WHERE "candidateId" IS NULL;
-- ALTER TABLE "CandidateScore" ALTER COLUMN "jobPositionId" SET NOT NULL;
-- ALTER TABLE "CandidateScore" ALTER COLUMN "candidateId" SET NOT NULL;

-- 4. Revert Scorecard: SetNull -> Cascade, make interviewId required
ALTER TABLE "Scorecard" DROP CONSTRAINT IF EXISTS "Scorecard_interviewId_fkey";
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_interviewId_fkey"
  FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Note: Cannot make column NOT NULL if there are NULL values
-- UPDATE "Scorecard" SET "interviewId" = ... WHERE "interviewId" IS NULL;
-- ALTER TABLE "Scorecard" ALTER COLUMN "interviewId" SET NOT NULL;

-- 3. Revert Application: SetNull -> Cascade, make jobPositionId required
ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_jobPositionId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Note: Cannot make column NOT NULL if there are NULL values
-- UPDATE "Application" SET "jobPositionId" = ... WHERE "jobPositionId" IS NULL;
-- ALTER TABLE "Application" ALTER COLUMN "jobPositionId" SET NOT NULL;

-- 2. Revert FileUpload: Cascade -> SetNull
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_candidateId_fkey";
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 1. Revert CandidateNote: Cascade -> SetNull
ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_candidateId_fkey";
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
