-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "maxJobPositions" INTEGER NOT NULL,
    "maxCandidatesPerPosition" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxStorageMB" INTEGER NOT NULL,
    "aiScoringEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiScoringCreditsPerMonth" INTEGER NOT NULL,
    "emailTemplatesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "PlanLimit_uid_key" ON "PlanLimit"("uid");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "PlanLimit_planType_key" ON "PlanLimit"("planType");

-- CreateIndex
CREATE INDEX "PlanLimit_planType_idx" ON "PlanLimit"("planType");
