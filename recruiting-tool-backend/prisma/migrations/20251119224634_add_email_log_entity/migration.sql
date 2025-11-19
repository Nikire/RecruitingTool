-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "emailType" TEXT NOT NULL,
    "relatedEntity" TEXT,
    "relatedEntityId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_uid_key" ON "EmailLog"("uid");

-- CreateIndex
CREATE INDEX "EmailLog_recipientEmail_idx" ON "EmailLog"("recipientEmail");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_emailType_idx" ON "EmailLog"("emailType");

-- CreateIndex
CREATE INDEX "EmailLog_relatedEntityId_idx" ON "EmailLog"("relatedEntityId");
