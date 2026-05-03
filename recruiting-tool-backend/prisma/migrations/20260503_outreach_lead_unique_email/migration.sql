-- Deduplicate existing rows: keep the oldest row per (campaignId, email) pair
DELETE FROM outreach_leads
WHERE id NOT IN (
  SELECT MIN(id)
  FROM outreach_leads
  WHERE email IS NOT NULL AND "campaignId" IS NOT NULL
  GROUP BY "campaignId", email
)
AND email IS NOT NULL
AND "campaignId" IS NOT NULL;

-- Partial unique index: prevents duplicate emails within the same campaign
-- NULLs are excluded so leads without email can coexist freely
CREATE UNIQUE INDEX "outreach_leads_campaignId_email_unique"
  ON outreach_leads("campaignId", email)
  WHERE email IS NOT NULL AND "campaignId" IS NOT NULL;

-- Index on email for fast unsubscribe-list lookups
CREATE INDEX IF NOT EXISTS "outreach_leads_email_idx" ON outreach_leads(email);
