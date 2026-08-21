-- CreateEnum
CREATE TYPE "JobModerationStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
-- IMPORTANT: the column is added with DEFAULT 'APPROVED' so that every PRE-EXISTING
-- job posting is grandfathered in and stays live on the public careers board.
-- Only AFTER the backfill is the default flipped to 'PENDING_APPROVAL' for new rows.
ALTER TABLE "JobPosition" ADD COLUMN "moderationStatus" "JobModerationStatus" NOT NULL DEFAULT 'APPROVED';

-- Explicit backfill (redundant with the DEFAULT above, kept so the intent is
-- unambiguous and so the migration is safe if it is ever re-ordered).
UPDATE "JobPosition" SET "moderationStatus" = 'APPROVED' WHERE "moderationStatus" IS NULL OR "moderationStatus" <> 'APPROVED';

-- New postings default to PENDING_APPROVAL; the service layer overrides this to
-- APPROVED when the owning company has an active paid subscription.
ALTER TABLE "JobPosition" ALTER COLUMN "moderationStatus" SET DEFAULT 'PENDING_APPROVAL';

-- AlterTable (nullable columns, no backfill needed)
ALTER TABLE "JobPosition" ADD COLUMN "moderationReason" TEXT;
ALTER TABLE "JobPosition" ADD COLUMN "moderatedAt" TIMESTAMP(3);
ALTER TABLE "JobPosition" ADD COLUMN "moderatedById" INTEGER;

-- CreateIndex
CREATE INDEX "JobPosition_moderationStatus_idx" ON "JobPosition"("moderationStatus");

-- CreateIndex
CREATE INDEX "JobPosition_status_moderationStatus_deletedAt_idx" ON "JobPosition"("status", "moderationStatus", "deletedAt");

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
