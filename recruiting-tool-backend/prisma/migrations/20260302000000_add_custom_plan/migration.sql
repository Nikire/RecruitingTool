-- CreateTable
CREATE TABLE "CustomPlan" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "companyId" INTEGER,
    "name" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT true,
    "maxUsers" INTEGER NOT NULL DEFAULT 10,
    "maxJobPositions" INTEGER NOT NULL DEFAULT 10,
    "maxCandidatesPerPosition" INTEGER NOT NULL DEFAULT 100,
    "maxStorageMB" INTEGER NOT NULL DEFAULT 5000,
    "aiScoringCreditsPerMonth" INTEGER NOT NULL DEFAULT 100,
    "emailTemplatesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
    "annualPrice" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPlan_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "CustomPlan_uid_key" ON "CustomPlan"("uid");

-- CreateIndex
CREATE INDEX "CustomPlan_uid_idx" ON "CustomPlan"("uid");

-- CreateIndex
CREATE INDEX "CustomPlan_companyId_idx" ON "CustomPlan"("companyId");

-- CreateIndex
CREATE INDEX "CustomPlan_createdAt_idx" ON "CustomPlan"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomPlan" ADD CONSTRAINT "CustomPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
