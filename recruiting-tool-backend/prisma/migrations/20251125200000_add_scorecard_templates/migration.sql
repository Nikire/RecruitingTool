-- CreateTable
CREATE TABLE "ScorecardTemplate" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardCategory" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "templateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScorecardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardCriterion" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScorecardCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorecard" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "templateId" INTEGER NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "evaluatorId" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardScore" (
    "id" SERIAL NOT NULL,
    "scorecardId" INTEGER NOT NULL,
    "criterionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScorecardScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardTemplate_uid_key" ON "ScorecardTemplate"("uid");

-- CreateIndex
CREATE INDEX "ScorecardTemplate_companyId_idx" ON "ScorecardTemplate"("companyId");

-- CreateIndex
CREATE INDEX "ScorecardTemplate_isActive_idx" ON "ScorecardTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardCategory_uid_key" ON "ScorecardCategory"("uid");

-- CreateIndex
CREATE INDEX "ScorecardCategory_templateId_idx" ON "ScorecardCategory"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardCriterion_uid_key" ON "ScorecardCriterion"("uid");

-- CreateIndex
CREATE INDEX "ScorecardCriterion_categoryId_idx" ON "ScorecardCriterion"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Scorecard_uid_key" ON "Scorecard"("uid");

-- CreateIndex
CREATE INDEX "Scorecard_templateId_idx" ON "Scorecard"("templateId");

-- CreateIndex
CREATE INDEX "Scorecard_interviewId_idx" ON "Scorecard"("interviewId");

-- CreateIndex
CREATE INDEX "Scorecard_evaluatorId_idx" ON "Scorecard"("evaluatorId");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardScore_scorecardId_criterionId_key" ON "ScorecardScore"("scorecardId", "criterionId");

-- CreateIndex
CREATE INDEX "ScorecardScore_scorecardId_idx" ON "ScorecardScore"("scorecardId");

-- AddForeignKey
ALTER TABLE "ScorecardTemplate" ADD CONSTRAINT "ScorecardTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardCategory" ADD CONSTRAINT "ScorecardCategory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ScorecardTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardCriterion" ADD CONSTRAINT "ScorecardCriterion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScorecardCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ScorecardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardScore" ADD CONSTRAINT "ScorecardScore_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
