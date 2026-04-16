-- CreateTable
CREATE TABLE "CompanyScoringWeights" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" INTEGER NOT NULL,
    "skillsWeight" INTEGER NOT NULL DEFAULT 40,
    "experienceWeight" INTEGER NOT NULL DEFAULT 35,
    "educationWeight" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CompanyScoringWeights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScoringWeights_uid_key" ON "CompanyScoringWeights"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyScoringWeights_companyId_key" ON "CompanyScoringWeights"("companyId");

-- CreateIndex
CREATE INDEX "CompanyScoringWeights_companyId_idx" ON "CompanyScoringWeights"("companyId");

-- CreateIndex
CREATE INDEX "CompanyScoringWeights_uid_idx" ON "CompanyScoringWeights"("uid");

-- AddForeignKey
ALTER TABLE "CompanyScoringWeights" ADD CONSTRAINT "CompanyScoringWeights_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
