-- P3-9: CompanyHealthSnapshot.
--
-- The admin Company Health scorer produced a point-in-time reading and threw it away.
-- A nightly job now persists one row per company here, so "this account got worse this
-- week" becomes answerable and can be pushed to the founder by email on Monday morning.
--
-- SAFETY NOTES
--   * This is a brand-new, empty table. `companyId` is NOT NULL only because there are
--     zero pre-existing rows for the constraint to invalidate — the EC2 failure mode this
--     project has hit before is ALTER TABLE ... ADD COLUMN NOT NULL DEFAULT <n> on a table
--     that already has rows, which is not what happens here.
--   * Every SIGNAL column ("tier", "score", "lastLoginDaysAgo", "activeJobPositions",
--     "applicationsThisMonth", "hiringActivitiesThisMonth") is NULLABLE with no default.
--   * No column is added to any existing table by this migration.

-- CreateTable
CREATE TABLE "CompanyHealthSnapshot" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" INTEGER NOT NULL,
    "tier" TEXT,
    "score" INTEGER,
    "lastLoginDaysAgo" INTEGER,
    "activeJobPositions" INTEGER,
    "applicationsThisMonth" INTEGER,
    "hiringActivitiesThisMonth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyHealthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyHealthSnapshot_uid_key" ON "CompanyHealthSnapshot"("uid");

-- CreateIndex
-- The trend query: "latest snapshot per company" and "snapshot nearest 7 days ago".
CREATE INDEX "CompanyHealthSnapshot_companyId_createdAt_idx" ON "CompanyHealthSnapshot"("companyId", "createdAt");

-- CreateIndex
-- The digest window scan: every snapshot in the last 14 days, all companies.
CREATE INDEX "CompanyHealthSnapshot_createdAt_idx" ON "CompanyHealthSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "CompanyHealthSnapshot_uid_idx" ON "CompanyHealthSnapshot"("uid");

-- AddForeignKey
ALTER TABLE "CompanyHealthSnapshot" ADD CONSTRAINT "CompanyHealthSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
