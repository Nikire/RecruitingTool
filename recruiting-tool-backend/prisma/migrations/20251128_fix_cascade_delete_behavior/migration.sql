-- Fix cascade delete behaviors to prevent data loss and orphaned records

-- 1. Fix CandidateNote: Change from SetNull to Cascade
-- Notes are owned by candidate and should be deleted with the candidate
ALTER TABLE "CandidateNote" DROP CONSTRAINT IF EXISTS "CandidateNote_candidateId_fkey";
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Fix FileUpload: Change from SetNull to Cascade
-- Files are owned by candidate and should be deleted with the candidate
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_candidateId_fkey";
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Fix Application: Change from Cascade to SetNull, make jobPositionId nullable
-- Applications should be preserved when job position is soft-deleted
ALTER TABLE "Application" ALTER COLUMN "jobPositionId" DROP NOT NULL;
ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_jobPositionId_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Fix Scorecard: Change from Cascade to SetNull, make interviewId nullable
-- Scorecards should be preserved when interview is soft-deleted
ALTER TABLE "Scorecard" ALTER COLUMN "interviewId" DROP NOT NULL;
ALTER TABLE "Scorecard" DROP CONSTRAINT IF EXISTS "Scorecard_interviewId_fkey";
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_interviewId_fkey"
  FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Fix CandidateScore: Change JobPosition from Cascade to SetNull, make nullable
-- AI scores should be preserved when job position is soft-deleted
ALTER TABLE "CandidateScore" ALTER COLUMN "candidateId" DROP NOT NULL;
ALTER TABLE "CandidateScore" ALTER COLUMN "jobPositionId" DROP NOT NULL;
ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_jobPositionId_fkey";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Fix BatchScoringJob: Change from Cascade to SetNull, make jobPositionId nullable
-- Batch scoring jobs should be preserved when job position is soft-deleted
ALTER TABLE "BatchScoringJob" ALTER COLUMN "jobPositionId" DROP NOT NULL;
ALTER TABLE "BatchScoringJob" DROP CONSTRAINT IF EXISTS "BatchScoringJob_jobPositionId_fkey";
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_jobPositionId_fkey"
  FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
