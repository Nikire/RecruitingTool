-- Migration: outreach_apollo_fields
-- Adds Apollo enrichment fields to outreach_leads, rebuilds OutreachLeadStatus enum
-- (removes SENT/REPLIED, keeps PENDING/CONVERTED), and adds APOLLO_CAMPAIGN to ProspectSource.

-- Step 1: Move any SENT/REPLIED rows to PENDING before dropping enum values
UPDATE outreach_leads SET status = 'PENDING' WHERE status IN ('SENT', 'REPLIED');

-- Step 2: Rename old enum
ALTER TYPE "OutreachLeadStatus" RENAME TO "OutreachLeadStatus_old";

-- Step 3: Create new enum with only the values we want
CREATE TYPE "OutreachLeadStatus" AS ENUM ('PENDING', 'CONVERTED');

-- Step 4: Alter column to use new enum (with explicit cast)
ALTER TABLE outreach_leads
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE "OutreachLeadStatus" USING status::text::"OutreachLeadStatus",
  ALTER COLUMN status SET DEFAULT 'PENDING';

-- Step 5: Drop old enum
DROP TYPE "OutreachLeadStatus_old";

-- Step 6: Add Apollo enrichment fields
ALTER TABLE outreach_leads
  ADD COLUMN IF NOT EXISTS "firstName"       TEXT,
  ADD COLUMN IF NOT EXISTS "lastName"        TEXT,
  ADD COLUMN IF NOT EXISTS "title"           TEXT,
  ADD COLUMN IF NOT EXISTS "phone"           TEXT,
  ADD COLUMN IF NOT EXISTS "city"            TEXT,
  ADD COLUMN IF NOT EXISTS "state"           TEXT,
  ADD COLUMN IF NOT EXISTS "country"         TEXT,
  ADD COLUMN IF NOT EXISTS "website"         TEXT,
  ADD COLUMN IF NOT EXISTS "industry"        TEXT,
  ADD COLUMN IF NOT EXISTS "seniority"       TEXT,
  ADD COLUMN IF NOT EXISTS "apolloContactId" TEXT,
  ADD COLUMN IF NOT EXISTS "apolloAccountId" TEXT,
  ADD COLUMN IF NOT EXISTS "secondaryEmail"  TEXT,
  ADD COLUMN IF NOT EXISTS "apolloData"      JSONB;

-- Step 7: Create indexes for Apollo ID lookups
CREATE INDEX IF NOT EXISTS "outreach_leads_apolloContactId_idx" ON outreach_leads("apolloContactId");
CREATE INDEX IF NOT EXISTS "outreach_leads_apolloAccountId_idx" ON outreach_leads("apolloAccountId");

-- Step 8: Add APOLLO_CAMPAIGN to ProspectSource enum
ALTER TYPE "ProspectSource" ADD VALUE IF NOT EXISTS 'APOLLO_CAMPAIGN';
