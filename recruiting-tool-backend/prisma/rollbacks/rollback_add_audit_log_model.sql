-- Rollback for migration: 20251128200000_add_audit_log_model
-- WARNING: This will permanently delete all audit log data
-- Only use this rollback if you need to completely remove the audit logging feature

-- Drop indexes first (order matters for foreign key constraints)
DROP INDEX IF EXISTS "AuditLog_uid_idx";
DROP INDEX IF EXISTS "AuditLog_action_idx";
DROP INDEX IF EXISTS "AuditLog_timestamp_idx";
DROP INDEX IF EXISTS "AuditLog_userId_idx";
DROP INDEX IF EXISTS "AuditLog_entityType_entityUid_idx";
DROP INDEX IF EXISTS "AuditLog_uid_key";

-- Drop foreign key constraint
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";

-- Drop primary key constraint
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_pkey";

-- Drop table
DROP TABLE IF EXISTS "AuditLog";
