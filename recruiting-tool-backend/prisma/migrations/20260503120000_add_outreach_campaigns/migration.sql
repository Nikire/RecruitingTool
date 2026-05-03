-- CreateEnum
CREATE TYPE "OutreachLeadChannel" AS ENUM ('EMAIL', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "OutreachLeadStatus" AS ENUM ('PENDING', 'SENT', 'REPLIED', 'CONVERTED');

-- CreateTable
CREATE TABLE "outreach_campaigns" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_leads" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "channel" "OutreachLeadChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "OutreachLeadStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "convertedToProspectAt" TIMESTAMP(3),
    "prospectUid" TEXT,
    "campaignId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "outreach_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outreach_campaigns_uid_key" ON "outreach_campaigns"("uid");

-- CreateIndex
CREATE INDEX "outreach_campaigns_uid_idx" ON "outreach_campaigns"("uid");

-- CreateIndex
CREATE INDEX "outreach_campaigns_createdAt_idx" ON "outreach_campaigns"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "outreach_leads_uid_key" ON "outreach_leads"("uid");

-- CreateIndex
CREATE INDEX "outreach_leads_status_idx" ON "outreach_leads"("status");

-- CreateIndex
CREATE INDEX "outreach_leads_campaignId_idx" ON "outreach_leads"("campaignId");

-- CreateIndex
CREATE INDEX "outreach_leads_uid_idx" ON "outreach_leads"("uid");

-- AddForeignKey
ALTER TABLE "outreach_campaigns" ADD CONSTRAINT "outreach_campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_leads" ADD CONSTRAINT "outreach_leads_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "outreach_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_leads" ADD CONSTRAINT "outreach_leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
