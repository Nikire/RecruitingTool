-- Rollback for migration: 20251127130042_add_unique_constraint_hiring_process_candidate_job
-- WARNING: Removing this constraint allows duplicate hiring processes for same candidate+job
-- This could lead to data integrity issues if not carefully managed

-- Drop unique constraint
ALTER TABLE "HiringProcess" DROP CONSTRAINT IF EXISTS "HiringProcess_candidateId_jobPositionId_key";
