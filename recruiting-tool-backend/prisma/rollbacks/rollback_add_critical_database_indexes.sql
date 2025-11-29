-- Rollback for migration: 20251127130253_add_critical_database_indexes
-- Safe to rollback: Only removes indexes, no data loss
-- Note: Performance will decrease without these indexes

-- Drop UID indexes (reverse order of creation)
DROP INDEX IF EXISTS "RefreshToken_uid_idx";
DROP INDEX IF EXISTS "BatchScoringJob_uid_idx";
DROP INDEX IF EXISTS "CandidateScore_uid_idx";
DROP INDEX IF EXISTS "Scorecard_uid_idx";
DROP INDEX IF EXISTS "ScorecardCriterion_uid_idx";
DROP INDEX IF EXISTS "ScorecardCategory_uid_idx";
DROP INDEX IF EXISTS "ScorecardTemplate_uid_idx";
-- DROP INDEX IF EXISTS "UserActivityLog_uid_idx"; -- Not created, skipping
DROP INDEX IF EXISTS "Profile_uid_idx";
DROP INDEX IF EXISTS "InterviewBookingToken_uid_idx";
DROP INDEX IF EXISTS "InterviewTimeSlot_uid_idx";
DROP INDEX IF EXISTS "InterviewReschedule_uid_idx";
DROP INDEX IF EXISTS "Interview_uid_idx";
DROP INDEX IF EXISTS "EmailLog_uid_idx";
DROP INDEX IF EXISTS "EmailTemplate_uid_idx";
DROP INDEX IF EXISTS "Application_uid_idx";
DROP INDEX IF EXISTS "FileUpload_uid_idx";
DROP INDEX IF EXISTS "Stage_uid_idx";
DROP INDEX IF EXISTS "HiringProcess_uid_idx";
DROP INDEX IF EXISTS "JobPosition_uid_idx";
DROP INDEX IF EXISTS "CandidateNote_uid_idx";
DROP INDEX IF EXISTS "Candidate_uid_idx";
DROP INDEX IF EXISTS "User_uid_idx";
DROP INDEX IF EXISTS "Company_name_idx";
DROP INDEX IF EXISTS "Company_uid_idx";
