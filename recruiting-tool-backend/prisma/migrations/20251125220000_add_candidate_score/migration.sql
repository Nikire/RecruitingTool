-- CreateTable
CREATE TABLE "CandidateScore" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidateId" INTEGER NOT NULL,
    "jobPositionId" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "skillsScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "educationScore" DOUBLE PRECISION NOT NULL,
    "analysis" JSONB,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateScore_uid_key" ON "CandidateScore"("uid");

-- CreateIndex
CREATE INDEX "CandidateScore_jobPositionId_idx" ON "CandidateScore"("jobPositionId");

-- CreateIndex
CREATE INDEX "CandidateScore_overallScore_idx" ON "CandidateScore"("overallScore");

-- CreateIndex
CREATE INDEX "CandidateScore_candidateId_idx" ON "CandidateScore"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateScore_candidateId_jobPositionId_key" ON "CandidateScore"("candidateId", "jobPositionId");

-- AddForeignKey
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "JobPosition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
