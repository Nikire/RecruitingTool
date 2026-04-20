-- Add new enum values to EmailTemplateType
ALTER TYPE "EmailTemplateType" ADD VALUE IF NOT EXISTS 'ASYNC_STAGE_INVITATION';
ALTER TYPE "EmailTemplateType" ADD VALUE IF NOT EXISTS 'ASYNC_STAGE_SUBMISSION_RECEIVED';

-- Add new enum values to NotificationType
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ASYNC_STAGE_SUBMISSION_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ASYNC_STAGE_REMINDER_SENT';

-- CreateTable AsyncStageToken
CREATE TABLE "AsyncStageToken" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "hiringProcessId" INTEGER NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastReminderSentAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsyncStageToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable AsyncStageSubmission
CREATE TABLE "AsyncStageSubmission" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tokenId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "hiringProcessId" INTEGER NOT NULL,
    "textContent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,
    "hrNote" TEXT,

    CONSTRAINT "AsyncStageSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable AsyncStageSubmissionFile
CREATE TABLE "AsyncStageSubmissionFile" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "submissionId" INTEGER NOT NULL,
    "fileUploadId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AsyncStageSubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex AsyncStageToken
CREATE UNIQUE INDEX "AsyncStageToken_uid_key" ON "AsyncStageToken"("uid");
CREATE UNIQUE INDEX "AsyncStageToken_token_key" ON "AsyncStageToken"("token");
CREATE INDEX "AsyncStageToken_token_idx" ON "AsyncStageToken"("token");
CREATE INDEX "AsyncStageToken_stageId_idx" ON "AsyncStageToken"("stageId");
CREATE INDEX "AsyncStageToken_hiringProcessId_idx" ON "AsyncStageToken"("hiringProcessId");
CREATE INDEX "AsyncStageToken_expiresAt_idx" ON "AsyncStageToken"("expiresAt");
CREATE INDEX "AsyncStageToken_uid_idx" ON "AsyncStageToken"("uid");

-- CreateIndex AsyncStageSubmission
CREATE UNIQUE INDEX "AsyncStageSubmission_uid_key" ON "AsyncStageSubmission"("uid");
CREATE UNIQUE INDEX "AsyncStageSubmission_tokenId_key" ON "AsyncStageSubmission"("tokenId");
CREATE INDEX "AsyncStageSubmission_stageId_idx" ON "AsyncStageSubmission"("stageId");
CREATE INDEX "AsyncStageSubmission_hiringProcessId_idx" ON "AsyncStageSubmission"("hiringProcessId");
CREATE INDEX "AsyncStageSubmission_uid_idx" ON "AsyncStageSubmission"("uid");

-- CreateIndex AsyncStageSubmissionFile
CREATE UNIQUE INDEX "AsyncStageSubmissionFile_uid_key" ON "AsyncStageSubmissionFile"("uid");
CREATE INDEX "AsyncStageSubmissionFile_submissionId_idx" ON "AsyncStageSubmissionFile"("submissionId");
CREATE INDEX "AsyncStageSubmissionFile_uid_idx" ON "AsyncStageSubmissionFile"("uid");

-- AddForeignKey AsyncStageToken -> Stage
ALTER TABLE "AsyncStageToken" ADD CONSTRAINT "AsyncStageToken_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey AsyncStageToken -> HiringProcess
ALTER TABLE "AsyncStageToken" ADD CONSTRAINT "AsyncStageToken_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey AsyncStageToken -> User
ALTER TABLE "AsyncStageToken" ADD CONSTRAINT "AsyncStageToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmission -> AsyncStageToken
ALTER TABLE "AsyncStageSubmission" ADD CONSTRAINT "AsyncStageSubmission_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "AsyncStageToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmission -> Stage
ALTER TABLE "AsyncStageSubmission" ADD CONSTRAINT "AsyncStageSubmission_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmission -> HiringProcess
ALTER TABLE "AsyncStageSubmission" ADD CONSTRAINT "AsyncStageSubmission_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmission -> User (reviewer)
ALTER TABLE "AsyncStageSubmission" ADD CONSTRAINT "AsyncStageSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmissionFile -> AsyncStageSubmission
ALTER TABLE "AsyncStageSubmissionFile" ADD CONSTRAINT "AsyncStageSubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "AsyncStageSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey AsyncStageSubmissionFile -> FileUpload
ALTER TABLE "AsyncStageSubmissionFile" ADD CONSTRAINT "AsyncStageSubmissionFile_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "FileUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
