-- AlterTable: Add unique constraint to prevent duplicate hiring processes for same candidate+job combination
-- This ensures a candidate cannot apply to the same job position multiple times

-- Add unique constraint on HiringProcess table
ALTER TABLE "HiringProcess" ADD CONSTRAINT "HiringProcess_candidateId_jobPositionId_key" UNIQUE ("candidateId", "jobPositionId");
