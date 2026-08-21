-- P3-6: The Client model.
--
-- An agency (`Company`) recruits on behalf of end clients. Before this migration a
-- JobPosition could only be attributed to the agency itself, so "show me every open
-- role for Acme" was unanswerable.
--
-- SAFETY: `JobPosition.clientId` is NULLABLE with NO DEFAULT. A NOT NULL FK carrying a
-- numeric default has previously broken an EC2 deploy (existing rows get an FK value
-- that points at nothing). Every pre-existing posting simply keeps clientId = NULL.

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logoUrl" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_uid_key" ON "Client"("uid");

-- CreateIndex
CREATE INDEX "Client_companyId_idx" ON "Client"("companyId");

-- CreateIndex
CREATE INDEX "Client_uid_idx" ON "Client"("uid");

-- CreateIndex
CREATE INDEX "Client_deletedAt_idx" ON "Client"("deletedAt");

-- CreateIndex
CREATE INDEX "Client_companyId_deletedAt_idx" ON "Client"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
-- Slug is unique per agency, not globally. NULL slugs stay distinct in Postgres,
-- so any number of clients may have no slug at all.
CREATE UNIQUE INDEX "Client_slug_companyId_key" ON "Client"("slug", "companyId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: nullable, no default. Existing rows keep NULL.
ALTER TABLE "JobPosition" ADD COLUMN "clientId" INTEGER;

-- CreateIndex
CREATE INDEX "JobPosition_clientId_idx" ON "JobPosition"("clientId");

-- CreateIndex
CREATE INDEX "JobPosition_clientId_deletedAt_idx" ON "JobPosition"("clientId", "deletedAt");

-- AddForeignKey
ALTER TABLE "JobPosition" ADD CONSTRAINT "JobPosition_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
