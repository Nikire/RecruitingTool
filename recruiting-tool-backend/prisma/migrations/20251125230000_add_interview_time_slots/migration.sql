-- CreateTable
CREATE TABLE "InterviewTimeSlot" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interviewId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewBookingToken" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token" TEXT NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewBookingToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewTimeSlot_uid_key" ON "InterviewTimeSlot"("uid");

-- CreateIndex
CREATE INDEX "InterviewTimeSlot_interviewId_idx" ON "InterviewTimeSlot"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewTimeSlot_startTime_idx" ON "InterviewTimeSlot"("startTime");

-- CreateIndex
CREATE INDEX "InterviewTimeSlot_isAvailable_idx" ON "InterviewTimeSlot"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewBookingToken_uid_key" ON "InterviewBookingToken"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewBookingToken_token_key" ON "InterviewBookingToken"("token");

-- CreateIndex
CREATE INDEX "InterviewBookingToken_token_idx" ON "InterviewBookingToken"("token");

-- CreateIndex
CREATE INDEX "InterviewBookingToken_interviewId_idx" ON "InterviewBookingToken"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewBookingToken_expiresAt_idx" ON "InterviewBookingToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "InterviewTimeSlot" ADD CONSTRAINT "InterviewTimeSlot_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewBookingToken" ADD CONSTRAINT "InterviewBookingToken_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
