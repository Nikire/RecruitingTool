-- ==============================================
-- BUSINESS RULE CONSTRAINTS
-- ==============================================

-- 1. CASE-INSENSITIVE EMAIL UNIQUENESS

-- User table case-insensitive email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_unique_ci" ON "User" (LOWER(email));

-- Candidate table case-insensitive email
CREATE UNIQUE INDEX IF NOT EXISTS "Candidate_email_unique_ci" ON "Candidate" (LOWER(email));

-- Application table case-insensitive email (composite unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "Application_jobPosition_email_unique_ci" ON "Application" ("jobPositionId", LOWER("applicantEmail"));

-- 2. CHECK CONSTRAINTS

-- Stage positions must be non-negative
ALTER TABLE "Stage" DROP CONSTRAINT IF EXISTS "Stage_position_check";
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_position_check" CHECK (position >= 0);

-- FileUpload size must be positive
ALTER TABLE "FileUpload" DROP CONSTRAINT IF EXISTS "FileUpload_size_check";
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_size_check" CHECK (size > 0);

-- Interview duration must be positive (when not null)
ALTER TABLE "Interview" DROP CONSTRAINT IF EXISTS "Interview_duration_check";
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_duration_check" CHECK (duration IS NULL OR duration > 0);

-- StageTimeLog duration must be non-negative (when not null)
-- Skip if table doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'StageTimeLog') THEN
    ALTER TABLE "StageTimeLog" DROP CONSTRAINT IF EXISTS "StageTimeLog_duration_check";
    ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_duration_check" CHECK (duration IS NULL OR duration >= 0);
  END IF;
END$$;

-- HRSchedule dayOfWeek must be between 0 and 6
-- Skip if table doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'HRSchedule') THEN
    ALTER TABLE "HRSchedule" DROP CONSTRAINT IF EXISTS "HRSchedule_dayOfWeek_check";
    ALTER TABLE "HRSchedule" ADD CONSTRAINT "HRSchedule_dayOfWeek_check" CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6);
  END IF;
END$$;

-- AIQuota limit must be positive
-- Skip if table doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AIQuota') THEN
    ALTER TABLE "AIQuota" DROP CONSTRAINT IF EXISTS "AIQuota_limit_check";
    ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_limit_check" CHECK ("limit" > 0);
  END IF;
END$$;

-- AIQuota used must be non-negative
-- Skip if table doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AIQuota') THEN
    ALTER TABLE "AIQuota" DROP CONSTRAINT IF EXISTS "AIQuota_used_check";
    ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_used_check" CHECK (used >= 0);
  END IF;
END$$;

-- Scorecard overallScore must be between 0 and 100 (when not null)
ALTER TABLE "Scorecard" DROP CONSTRAINT IF EXISTS "Scorecard_overallScore_check";
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_overallScore_check" CHECK ("overallScore" IS NULL OR ("overallScore" >= 0 AND "overallScore" <= 100));

-- ScorecardCriterion maxScore must be positive
ALTER TABLE "ScorecardCriterion" DROP CONSTRAINT IF EXISTS "ScorecardCriterion_maxScore_check";
ALTER TABLE "ScorecardCriterion" ADD CONSTRAINT "ScorecardCriterion_maxScore_check" CHECK ("maxScore" > 0);

-- ScorecardScore score must be non-negative
ALTER TABLE "ScorecardScore" DROP CONSTRAINT IF EXISTS "ScorecardScore_score_check";
ALTER TABLE "ScorecardScore" ADD CONSTRAINT "ScorecardScore_score_check" CHECK (score >= 0);

-- ScorecardCategory weight must be positive
ALTER TABLE "ScorecardCategory" DROP CONSTRAINT IF EXISTS "ScorecardCategory_weight_check";
ALTER TABLE "ScorecardCategory" ADD CONSTRAINT "ScorecardCategory_weight_check" CHECK (weight > 0);

-- CandidateScore scores must be between 0 and 100
ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_overallScore_check";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_overallScore_check" CHECK ("overallScore" >= 0 AND "overallScore" <= 100);

ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_skillsScore_check";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_skillsScore_check" CHECK ("skillsScore" >= 0 AND "skillsScore" <= 100);

ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_experienceScore_check";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_experienceScore_check" CHECK ("experienceScore" >= 0 AND "experienceScore" <= 100);

ALTER TABLE "CandidateScore" DROP CONSTRAINT IF EXISTS "CandidateScore_educationScore_check";
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_educationScore_check" CHECK ("educationScore" >= 0 AND "educationScore" <= 100);

-- BatchScoringJob counts must be non-negative
ALTER TABLE "BatchScoringJob" DROP CONSTRAINT IF EXISTS "BatchScoringJob_totalCandidates_check";
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_totalCandidates_check" CHECK ("totalCandidates" >= 0);

ALTER TABLE "BatchScoringJob" DROP CONSTRAINT IF EXISTS "BatchScoringJob_processedCount_check";
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_processedCount_check" CHECK ("processedCount" >= 0);

ALTER TABLE "BatchScoringJob" DROP CONSTRAINT IF EXISTS "BatchScoringJob_failedCount_check";
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_failedCount_check" CHECK ("failedCount" >= 0);

-- Interview rescheduledCount must be non-negative
ALTER TABLE "Interview" DROP CONSTRAINT IF EXISTS "Interview_rescheduledCount_check";
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_rescheduledCount_check" CHECK ("rescheduledCount" >= 0);
