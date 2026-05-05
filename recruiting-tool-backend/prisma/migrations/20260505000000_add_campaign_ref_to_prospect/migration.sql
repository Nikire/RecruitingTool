-- Add campaignRef to ProspectCompany to store the originating campaign name
ALTER TABLE "ProspectCompany" ADD COLUMN IF NOT EXISTS "campaignRef" TEXT;
