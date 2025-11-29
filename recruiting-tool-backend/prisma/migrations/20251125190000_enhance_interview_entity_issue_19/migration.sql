-- AlterEnum
ALTER TYPE "InterviewStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "InterviewStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "location" TEXT;

-- CreateTable
CREATE TABLE "InterviewInterviewer" (
    "id" SERIAL NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewInterviewer_userId_idx" ON "InterviewInterviewer"("userId");

-- CreateIndex
CREATE INDEX "InterviewInterviewer_interviewId_idx" ON "InterviewInterviewer"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInterviewer_interviewId_userId_key" ON "InterviewInterviewer"("interviewId", "userId");

-- CreateIndex
CREATE INDEX "Interview_scheduledDate_idx" ON "Interview"("scheduledDate");

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
