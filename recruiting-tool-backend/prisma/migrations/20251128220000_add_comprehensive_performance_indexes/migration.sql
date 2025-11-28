-- Add comprehensive performance indexes for all models
-- GitHub Issue #61: Add Critical Database Indexes for Performance
-- These indexes optimize query performance for frequently accessed fields

-- Company indexes
CREATE INDEX IF NOT EXISTS "Company_createdAt_idx" ON "Company"("createdAt");

-- User indexes
CREATE INDEX IF NOT EXISTS "User_companyId_isActive_idx" ON "User"("companyId", "isActive");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CandidateNote indexes
CREATE INDEX IF NOT EXISTS "CandidateNote_createdAt_idx" ON "CandidateNote"("createdAt");

-- JobPosition indexes
CREATE INDEX IF NOT EXISTS "JobPosition_title_idx" ON "JobPosition"("title");

-- HiringProcess indexes
CREATE INDEX IF NOT EXISTS "HiringProcess_jobPositionId_status_idx" ON "HiringProcess"("jobPositionId", "status");
CREATE INDEX IF NOT EXISTS "HiringProcess_candidateId_status_idx" ON "HiringProcess"("candidateId", "status");

-- Stage indexes
CREATE INDEX IF NOT EXISTS "Stage_type_idx" ON "Stage"("type");
CREATE INDEX IF NOT EXISTS "Stage_createdAt_idx" ON "Stage"("createdAt");

-- StageNote indexes
-- Skipped: StageNote table does not exist yet
-- CREATE INDEX IF NOT EXISTS "StageNote_createdAt_idx" ON "StageNote"("createdAt");

-- FileUpload indexes
CREATE INDEX IF NOT EXISTS "FileUpload_createdAt_idx" ON "FileUpload"("createdAt");

-- Application indexes
CREATE INDEX IF NOT EXISTS "Application_appliedAt_idx" ON "Application"("appliedAt");

-- EmailTemplate indexes
CREATE INDEX IF NOT EXISTS "EmailTemplate_createdAt_idx" ON "EmailTemplate"("createdAt");

-- EmailLog indexes
CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status");

-- Interview indexes
CREATE INDEX IF NOT EXISTS "Interview_createdAt_idx" ON "Interview"("createdAt");
CREATE INDEX IF NOT EXISTS "Interview_stageId_status_idx" ON "Interview"("stageId", "status");

-- InterviewInterviewer indexes
CREATE INDEX IF NOT EXISTS "InterviewInterviewer_createdAt_idx" ON "InterviewInterviewer"("createdAt");

-- Profile indexes
CREATE INDEX IF NOT EXISTS "Profile_createdAt_idx" ON "Profile"("createdAt");

-- UserActivityLog indexes
-- Skipped: UserActivityLog table does not exist yet
-- CREATE INDEX IF NOT EXISTS "UserActivityLog_uid_idx" ON "UserActivityLog"("uid");

-- HRSchedule indexes
CREATE INDEX IF NOT EXISTS "HRSchedule_uid_idx" ON "HRSchedule"("uid");
CREATE INDEX IF NOT EXISTS "HRSchedule_isAvailable_idx" ON "HRSchedule"("isAvailable");

-- ScorecardTemplate indexes
CREATE INDEX IF NOT EXISTS "ScorecardTemplate_createdAt_idx" ON "ScorecardTemplate"("createdAt");
CREATE INDEX IF NOT EXISTS "ScorecardTemplate_name_idx" ON "ScorecardTemplate"("name");

-- ScorecardCategory indexes
CREATE INDEX IF NOT EXISTS "ScorecardCategory_order_idx" ON "ScorecardCategory"("order");

-- ScorecardCriterion indexes
CREATE INDEX IF NOT EXISTS "ScorecardCriterion_order_idx" ON "ScorecardCriterion"("order");

-- Scorecard indexes
CREATE INDEX IF NOT EXISTS "Scorecard_submittedAt_idx" ON "Scorecard"("submittedAt");
CREATE INDEX IF NOT EXISTS "Scorecard_createdAt_idx" ON "Scorecard"("createdAt");

-- ScorecardScore indexes
CREATE INDEX IF NOT EXISTS "ScorecardScore_score_idx" ON "ScorecardScore"("score");
