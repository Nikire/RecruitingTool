-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "WorkLocation" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE');

-- CreateEnum
CREATE TYPE "SalaryPeriod" AS ENUM ('HOURLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');

-- AlterTable
ALTER TABLE "JobPosition" ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobCategory" TEXT,
ADD COLUMN     "jobType" "JobType",
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "salaryPeriod" "SalaryPeriod",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "workLocation" "WorkLocation";

-- CreateIndex
CREATE INDEX "JobPosition_jobCategory_idx" ON "JobPosition"("jobCategory");

-- CreateIndex
CREATE INDEX "JobPosition_jobType_idx" ON "JobPosition"("jobType");

-- CreateIndex
CREATE INDEX "JobPosition_workLocation_idx" ON "JobPosition"("workLocation");

-- CreateIndex
CREATE INDEX "JobPosition_experienceLevel_idx" ON "JobPosition"("experienceLevel");

-- CreateIndex
CREATE INDEX "JobPosition_isUrgent_idx" ON "JobPosition"("isUrgent");

-- CreateIndex
CREATE INDEX "JobPosition_isFeatured_idx" ON "JobPosition"("isFeatured");

-- CreateIndex
CREATE INDEX "JobPosition_applicationDeadline_idx" ON "JobPosition"("applicationDeadline");
