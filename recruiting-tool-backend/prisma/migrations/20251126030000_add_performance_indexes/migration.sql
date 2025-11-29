-- AlterTable - Add missing User fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deactivatedBy" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "JobPosition_status_idx" ON "JobPosition"("status");

-- CreateIndex
CREATE INDEX "JobPosition_companyId_idx" ON "JobPosition"("companyId");

-- CreateIndex
CREATE INDEX "JobPosition_createdById_idx" ON "JobPosition"("createdById");

-- CreateIndex
CREATE INDEX "JobPosition_companyId_status_idx" ON "JobPosition"("companyId", "status");

-- CreateIndex
CREATE INDEX "HiringProcess_status_idx" ON "HiringProcess"("status");

-- CreateIndex
CREATE INDEX "HiringProcess_jobPositionId_idx" ON "HiringProcess"("jobPositionId");

-- CreateIndex
CREATE INDEX "HiringProcess_candidateId_idx" ON "HiringProcess"("candidateId");

-- CreateIndex
CREATE INDEX "HiringProcess_companyId_idx" ON "HiringProcess"("companyId");

-- CreateIndex
CREATE INDEX "HiringProcess_companyId_status_idx" ON "HiringProcess"("companyId", "status");

-- CreateIndex
CREATE INDEX "Stage_hiringProcessId_idx" ON "Stage"("hiringProcessId");

-- CreateIndex
CREATE INDEX "Stage_jobPositionId_idx" ON "Stage"("jobPositionId");

-- CreateIndex
CREATE INDEX "Stage_status_idx" ON "Stage"("status");

-- CreateIndex
CREATE INDEX "Stage_position_idx" ON "Stage"("position");

-- CreateIndex
CREATE INDEX "Stage_hiringProcessId_position_idx" ON "Stage"("hiringProcessId", "position");

-- CreateIndex
CREATE INDEX "FileUpload_candidateId_idx" ON "FileUpload"("candidateId");

-- CreateIndex
CREATE INDEX "FileUpload_uploadedById_idx" ON "FileUpload"("uploadedById");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_jobPositionId_idx" ON "Application"("jobPositionId");

-- CreateIndex
CREATE INDEX "Application_applicantEmail_idx" ON "Application"("applicantEmail");

-- CreateIndex
CREATE INDEX "Application_reviewedById_idx" ON "Application"("reviewedById");

-- CreateIndex
CREATE INDEX "Application_jobPositionId_status_idx" ON "Application"("jobPositionId", "status");
