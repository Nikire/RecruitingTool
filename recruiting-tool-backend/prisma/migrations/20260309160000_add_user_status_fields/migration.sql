-- Add isActive, deactivatedAt, lastLoginAt to User model
-- These columns were previously added via raw SQL in migration 20251126030000_add_performance_indexes
-- This migration reconciles the Prisma schema with the existing database state
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Indexes (already exist, using IF NOT EXISTS to be safe)
CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive");
CREATE INDEX IF NOT EXISTS "User_lastLoginAt_idx" ON "User"("lastLoginAt");
