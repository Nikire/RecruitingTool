-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "userId" INTEGER NOT NULL,
    "emailApplicationStatus" BOOLEAN NOT NULL DEFAULT true,
    "emailInterviewScheduled" BOOLEAN NOT NULL DEFAULT true,
    "emailNewCandidate" BOOLEAN NOT NULL DEFAULT true,
    "emailSystemAnnouncement" BOOLEAN NOT NULL DEFAULT true,
    "inAppApplicationStatus" BOOLEAN NOT NULL DEFAULT true,
    "inAppInterviewScheduled" BOOLEAN NOT NULL DEFAULT true,
    "inAppNewCandidate" BOOLEAN NOT NULL DEFAULT true,
    "inAppSystemAnnouncement" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_uid_key" ON "NotificationPreference"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_uid_idx" ON "NotificationPreference"("uid");

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
