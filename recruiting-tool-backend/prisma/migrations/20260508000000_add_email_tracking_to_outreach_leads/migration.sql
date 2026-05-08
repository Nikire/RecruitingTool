-- Add email open/click tracking fields to outreach_leads

ALTER TABLE "outreach_leads" ADD COLUMN "openedAt" TIMESTAMP(3);
ALTER TABLE "outreach_leads" ADD COLUMN "clickedAt" TIMESTAMP(3);
ALTER TABLE "outreach_leads" ADD COLUMN "openCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "outreach_leads" ADD COLUMN "clickCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "outreach_leads" ADD COLUMN "lastOpenedAt" TIMESTAMP(3);
ALTER TABLE "outreach_leads" ADD COLUMN "lastClickedAt" TIMESTAMP(3);
