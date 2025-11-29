-- Add reschedule tracking fields to Interview table
ALTER TABLE "Interview" ADD COLUMN "rescheduledCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Interview" ADD COLUMN "originalScheduledDate" TIMESTAMP(3);
ALTER TABLE "Interview" ADD COLUMN "lastRescheduledAt" TIMESTAMP(3);
ALTER TABLE "Interview" ADD COLUMN "rescheduledReason" TEXT;

-- CreateTable
CREATE TABLE "InterviewReschedule" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interviewId" INTEGER NOT NULL,
    "oldScheduledDate" TIMESTAMP(3) NOT NULL,
    "oldScheduledTime" TEXT NOT NULL,
    "newScheduledDate" TIMESTAMP(3) NOT NULL,
    "newScheduledTime" TEXT NOT NULL,
    "reason" TEXT,
    "rescheduledById" INTEGER NOT NULL,
    "rescheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewReschedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewReschedule_uid_key" ON "InterviewReschedule"("uid");

-- CreateIndex
CREATE INDEX "InterviewReschedule_interviewId_idx" ON "InterviewReschedule"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewReschedule_rescheduledById_idx" ON "InterviewReschedule"("rescheduledById");

-- CreateIndex
CREATE INDEX "InterviewReschedule_rescheduledAt_idx" ON "InterviewReschedule"("rescheduledAt");

-- AddForeignKey
ALTER TABLE "InterviewReschedule" ADD CONSTRAINT "InterviewReschedule_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewReschedule" ADD CONSTRAINT "InterviewReschedule_rescheduledById_fkey" FOREIGN KEY ("rescheduledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
