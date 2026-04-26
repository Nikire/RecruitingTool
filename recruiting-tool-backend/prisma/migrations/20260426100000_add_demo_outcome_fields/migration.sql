-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "DemoOutcome" AS ENUM ('PENDING', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED', 'CANCELED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "DemoBookingToken" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "outcome" "DemoOutcome" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "outcomeNotes" TEXT,
ADD COLUMN IF NOT EXISTS "linkedProspectUid" TEXT;
