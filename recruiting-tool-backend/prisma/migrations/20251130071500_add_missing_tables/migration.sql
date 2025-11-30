-- CreateEnum for CandidateActivityType
DO $$ BEGIN
 CREATE TYPE "CandidateActivityType" AS ENUM ('CREATED', 'STAGE_CHANGED', 'STATUS_CHANGED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_UPDATED', 'INTERVIEW_CANCELLED', 'INTERVIEW_COMPLETED', 'NOTE_ADDED', 'APPLICATION_RECEIVED', 'EMAIL_SENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for QuotaType
DO $$ BEGIN
 CREATE TYPE "QuotaType" AS ENUM ('RESUME_PARSING', 'CANDIDATE_SCORING', 'BATCH_SCORING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable UserActivityLog
CREATE TABLE IF NOT EXISTS "UserActivityLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable StageNote
CREATE TABLE IF NOT EXISTS "StageNote" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable AIQuota
CREATE TABLE IF NOT EXISTS "AIQuota" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "companyId" INTEGER NOT NULL,
    "quotaType" "QuotaType" NOT NULL,
    "limit" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable AIUsageLog
CREATE TABLE IF NOT EXISTS "AIUsageLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "companyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "operation" "QuotaType" NOT NULL,
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable StageTimeLog
CREATE TABLE IF NOT EXISTS "StageTimeLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "stageId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageTimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable CandidateActivity
CREATE TABLE IF NOT EXISTS "CandidateActivity" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidateId" INTEGER NOT NULL,
    "type" "CandidateActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserActivityLog_uid_key" ON "UserActivityLog"("uid");
CREATE INDEX IF NOT EXISTS "UserActivityLog_userId_idx" ON "UserActivityLog"("userId");
CREATE INDEX IF NOT EXISTS "UserActivityLog_action_idx" ON "UserActivityLog"("action");
CREATE INDEX IF NOT EXISTS "UserActivityLog_createdAt_idx" ON "UserActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "UserActivityLog_uid_idx" ON "UserActivityLog"("uid");

CREATE UNIQUE INDEX IF NOT EXISTS "StageNote_uid_key" ON "StageNote"("uid");
CREATE INDEX IF NOT EXISTS "StageNote_stageId_idx" ON "StageNote"("stageId");
CREATE INDEX IF NOT EXISTS "StageNote_authorId_idx" ON "StageNote"("authorId");
CREATE INDEX IF NOT EXISTS "StageNote_uid_idx" ON "StageNote"("uid");
CREATE INDEX IF NOT EXISTS "StageNote_createdAt_idx" ON "StageNote"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "AIQuota_uid_key" ON "AIQuota"("uid");
CREATE UNIQUE INDEX IF NOT EXISTS "AIQuota_companyId_quotaType_key" ON "AIQuota"("companyId", "quotaType");
CREATE INDEX IF NOT EXISTS "AIQuota_companyId_idx" ON "AIQuota"("companyId");
CREATE INDEX IF NOT EXISTS "AIQuota_quotaType_idx" ON "AIQuota"("quotaType");
CREATE INDEX IF NOT EXISTS "AIQuota_uid_idx" ON "AIQuota"("uid");

CREATE UNIQUE INDEX IF NOT EXISTS "AIUsageLog_uid_key" ON "AIUsageLog"("uid");
CREATE INDEX IF NOT EXISTS "AIUsageLog_companyId_idx" ON "AIUsageLog"("companyId");
CREATE INDEX IF NOT EXISTS "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");
CREATE INDEX IF NOT EXISTS "AIUsageLog_operation_idx" ON "AIUsageLog"("operation");
CREATE INDEX IF NOT EXISTS "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AIUsageLog_uid_idx" ON "AIUsageLog"("uid");

CREATE UNIQUE INDEX IF NOT EXISTS "StageTimeLog_uid_key" ON "StageTimeLog"("uid");
CREATE INDEX IF NOT EXISTS "StageTimeLog_stageId_idx" ON "StageTimeLog"("stageId");
CREATE INDEX IF NOT EXISTS "StageTimeLog_candidateId_idx" ON "StageTimeLog"("candidateId");
CREATE INDEX IF NOT EXISTS "StageTimeLog_enteredAt_idx" ON "StageTimeLog"("enteredAt");
CREATE INDEX IF NOT EXISTS "StageTimeLog_uid_idx" ON "StageTimeLog"("uid");

CREATE UNIQUE INDEX IF NOT EXISTS "CandidateActivity_uid_key" ON "CandidateActivity"("uid");
CREATE INDEX IF NOT EXISTS "CandidateActivity_candidateId_idx" ON "CandidateActivity"("candidateId");
CREATE INDEX IF NOT EXISTS "CandidateActivity_type_idx" ON "CandidateActivity"("type");
CREATE INDEX IF NOT EXISTS "CandidateActivity_createdAt_idx" ON "CandidateActivity"("createdAt");
CREATE INDEX IF NOT EXISTS "CandidateActivity_userId_idx" ON "CandidateActivity"("userId");
CREATE INDEX IF NOT EXISTS "CandidateActivity_uid_idx" ON "CandidateActivity"("uid");

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StageNote" ADD CONSTRAINT "StageNote_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageNote" ADD CONSTRAINT "StageNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
