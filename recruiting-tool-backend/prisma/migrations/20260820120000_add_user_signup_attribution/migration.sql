-- AlterTable
-- Signup attribution for the User table.
-- IMPORTANT: every column is NULLABLE with NO DEFAULT. Adding a nullable column with no
-- default is a metadata-only operation in PostgreSQL, so this is safe to run against a
-- production "User" table that already has rows (no rewrite, no backfill, no invalid FKs).
-- Pre-existing users simply keep NULL attribution, which correctly means "unknown source".
ALTER TABLE "User" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "User" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "User" ADD COLUMN "utmCampaign" TEXT;
ALTER TABLE "User" ADD COLUMN "utmTerm" TEXT;
ALTER TABLE "User" ADD COLUMN "utmContent" TEXT;
ALTER TABLE "User" ADD COLUMN "referrerUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "landingPath" TEXT;

-- CreateIndex
-- Supports "signups grouped by acquisition channel" reporting.
CREATE INDEX "User_utmSource_idx" ON "User"("utmSource");
