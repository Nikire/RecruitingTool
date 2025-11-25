-- CreateTable
CREATE TABLE "HRSchedule" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "specificDate" TIMESTAMP(3),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HRSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HRSchedule_uid_key" ON "HRSchedule"("uid");

-- CreateIndex
CREATE INDEX "HRSchedule_userId_idx" ON "HRSchedule"("userId");

-- CreateIndex
CREATE INDEX "HRSchedule_dayOfWeek_idx" ON "HRSchedule"("dayOfWeek");

-- CreateIndex
CREATE INDEX "HRSchedule_specificDate_idx" ON "HRSchedule"("specificDate");

-- AddForeignKey
ALTER TABLE "HRSchedule" ADD CONSTRAINT "HRSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
