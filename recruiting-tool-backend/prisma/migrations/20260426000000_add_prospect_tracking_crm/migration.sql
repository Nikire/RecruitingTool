-- CreateEnum
CREATE TYPE "ProspectSource" AS ENUM ('CLUTCH', 'GOODFIRMS', 'LINKEDIN', 'SALES_NAVIGATOR', 'UPWORK', 'TOPTAL', 'GOOGLE_MAPS', 'REFERRAL', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'RESPONDED', 'DEMO_SCHEDULED', 'DEMO_DONE', 'PROPOSAL_SENT', 'CONVERTED', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OutreachActivityType" AS ENUM ('NOTE', 'MESSAGE_SENT', 'RESPONSE_RECEIVED', 'FOLLOW_UP', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'PROPOSAL_SENT', 'STATUS_CHANGED', 'CONTACT_ADDED');

-- CreateEnum
CREATE TYPE "OutreachChannel" AS ENUM ('LINKEDIN', 'EMAIL', 'WHATSAPP', 'PHONE', 'IN_PERSON', 'OTHER');

-- CreateTable
CREATE TABLE "ProspectCompany" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "companySize" TEXT,
    "country" TEXT,
    "city" TEXT,
    "source" "ProspectSource" NOT NULL DEFAULT 'OTHER',
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "linkedCompanyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "ProspectCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachContact" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prospectCompanyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachActivity" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prospectCompanyId" INTEGER NOT NULL,
    "type" "OutreachActivityType" NOT NULL,
    "channel" "OutreachChannel",
    "notes" TEXT,
    "templateUsed" TEXT,
    "previousStatus" "ProspectStatus",
    "newStatus" "ProspectStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,

    CONSTRAINT "OutreachActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProspectCompany_uid_key" ON "ProspectCompany"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ProspectCompany_linkedCompanyId_key" ON "ProspectCompany"("linkedCompanyId");

-- CreateIndex
CREATE INDEX "ProspectCompany_uid_idx" ON "ProspectCompany"("uid");

-- CreateIndex
CREATE INDEX "ProspectCompany_status_idx" ON "ProspectCompany"("status");

-- CreateIndex
CREATE INDEX "ProspectCompany_source_idx" ON "ProspectCompany"("source");

-- CreateIndex
CREATE INDEX "ProspectCompany_name_idx" ON "ProspectCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachContact_uid_key" ON "OutreachContact"("uid");

-- CreateIndex
CREATE INDEX "OutreachContact_prospectCompanyId_idx" ON "OutreachContact"("prospectCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachActivity_uid_key" ON "OutreachActivity"("uid");

-- CreateIndex
CREATE INDEX "OutreachActivity_prospectCompanyId_idx" ON "OutreachActivity"("prospectCompanyId");

-- CreateIndex
CREATE INDEX "OutreachActivity_createdAt_idx" ON "OutreachActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "ProspectCompany" ADD CONSTRAINT "ProspectCompany_linkedCompanyId_fkey" FOREIGN KEY ("linkedCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectCompany" ADD CONSTRAINT "ProspectCompany_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachContact" ADD CONSTRAINT "OutreachContact_prospectCompanyId_fkey" FOREIGN KEY ("prospectCompanyId") REFERENCES "ProspectCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachActivity" ADD CONSTRAINT "OutreachActivity_prospectCompanyId_fkey" FOREIGN KEY ("prospectCompanyId") REFERENCES "ProspectCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachActivity" ADD CONSTRAINT "OutreachActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
