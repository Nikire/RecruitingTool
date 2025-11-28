-- Add UID indexes for all models with UID fields
-- These indexes optimize API queries that use UIDs for lookups
-- Only creating indexes for tables that currently exist in the database

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_uid_idx" ON "Company"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_uid_idx" ON "User"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Candidate_uid_idx" ON "Candidate"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CandidateNote_uid_idx" ON "CandidateNote"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "JobPosition_uid_idx" ON "JobPosition"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HiringProcess_uid_idx" ON "HiringProcess"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Stage_uid_idx" ON "Stage"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FileUpload_uid_idx" ON "FileUpload"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Application_uid_idx" ON "Application"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailTemplate_uid_idx" ON "EmailTemplate"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailLog_uid_idx" ON "EmailLog"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Interview_uid_idx" ON "Interview"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InterviewReschedule_uid_idx" ON "InterviewReschedule"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InterviewTimeSlot_uid_idx" ON "InterviewTimeSlot"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InterviewBookingToken_uid_idx" ON "InterviewBookingToken"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Profile_uid_idx" ON "Profile"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserActivityLog_uid_idx" ON "UserActivityLog"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ScorecardTemplate_uid_idx" ON "ScorecardTemplate"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ScorecardCategory_uid_idx" ON "ScorecardCategory"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ScorecardCriterion_uid_idx" ON "ScorecardCriterion"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Scorecard_uid_idx" ON "Scorecard"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CandidateScore_uid_idx" ON "CandidateScore"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BatchScoringJob_uid_idx" ON "BatchScoringJob"("uid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefreshToken_uid_idx" ON "RefreshToken"("uid");
