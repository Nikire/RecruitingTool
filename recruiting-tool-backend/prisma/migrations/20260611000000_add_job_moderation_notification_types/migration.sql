-- AlterEnum
-- Adds the notification types used by the job posting moderation flow.
-- Kept in its own migration: PostgreSQL forbids using a newly added enum value
-- inside the same transaction that added it.
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOB_POSITION_PENDING_APPROVAL';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOB_POSITION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOB_POSITION_REJECTED';
