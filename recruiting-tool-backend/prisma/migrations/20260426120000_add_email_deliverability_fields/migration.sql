-- AddColumn deliveryStatus
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "deliveryStatus" TEXT NOT NULL DEFAULT 'SENT';

-- AddColumn openedAt
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "openedAt" TIMESTAMP(3);

-- AddColumn bouncedAt
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "bouncedAt" TIMESTAMP(3);

-- AddColumn bounceType
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "bounceType" TEXT;

-- AddColumn resendEmailId
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "resendEmailId" TEXT;

-- CreateUniqueIndex on resendEmailId
CREATE UNIQUE INDEX IF NOT EXISTS "EmailLog_resendEmailId_key" ON "EmailLog"("resendEmailId");
