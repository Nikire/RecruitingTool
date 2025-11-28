-- Rollback for migration: 20251128180000_add_soft_delete_to_stages
-- WARNING: Cannot restore soft-deleted stages, only removes deletedAt column
-- Soft-deleted stages will be permanently lost after this rollback

-- Drop index
DROP INDEX IF EXISTS "Stage_deletedAt_idx";

-- Drop deletedAt column from Stage table
ALTER TABLE "Stage" DROP COLUMN IF EXISTS "deletedAt";
