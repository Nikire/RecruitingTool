-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BatchScoringJob" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jobPositionId" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "totalCandidates" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "candidateUids" JSONB NOT NULL,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchScoringJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchScoringJob_uid_key" ON "BatchScoringJob"("uid");

-- CreateIndex
CREATE INDEX "BatchScoringJob_status_idx" ON "BatchScoringJob"("status");

-- CreateIndex
CREATE INDEX "BatchScoringJob_jobPositionId_idx" ON "BatchScoringJob"("jobPositionId");

-- CreateIndex
CREATE INDEX "BatchScoringJob_priority_idx" ON "BatchScoringJob"("priority");

-- AddForeignKey
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
