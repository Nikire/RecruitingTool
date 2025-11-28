# Database Migration Rollback Scripts

## Overview

This directory contains SQL scripts for rolling back Prisma migrations. Each rollback script reverses the changes made by its corresponding migration.

## Usage

### Basic Rollback

```bash
# Stop backend application
docker-compose stop backend

# Apply rollback SQL
docker-compose exec -T db psql -U admin recruiting_tool < prisma/rollbacks/rollback_<migration_name>.sql

# Update Prisma migration table
docker-compose exec db psql -U admin recruiting_tool -c \
  "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '<migration_name>';"

# Restart backend
docker-compose up -d backend
```

### Test Rollback

```bash
# Use the test script to safely test rollback
./scripts/test-migration.sh <migration_name> prisma/rollbacks/rollback_<migration_name>.sql
```

## Available Rollback Scripts

### Recent Migrations (November 2025)

1. **rollback_add_audit_log_model.sql**
   - Rollback for: `20251128200000_add_audit_log_model`
   - Risk: High (deletes all audit log data)
   - Use when: Audit logging feature needs to be removed

2. **rollback_add_soft_delete_to_stages.sql**
   - Rollback for: `20251128180000_add_soft_delete_to_stages`
   - Risk: High (loses soft-deleted stages)
   - Use when: Soft delete on stages causes issues

3. **rollback_implement_soft_delete_and_cascade_behavior.sql**
   - Rollback for: `20251128140000_implement_soft_delete_and_cascade_behavior`
   - Risk: Critical (loses all soft-deleted records, reverts data preservation)
   - Use when: Major rollback needed (not recommended)

4. **rollback_fix_cascade_delete_behavior.sql**
   - Rollback for: `20251128_fix_cascade_delete_behavior`
   - Risk: High (may cause data loss on entity deletion)
   - Use when: Cascade behavior fixes cause issues (not recommended)

5. **rollback_add_critical_database_indexes.sql**
   - Rollback for: `20251127130253_add_critical_database_indexes`
   - Risk: None (performance impact only)
   - Use when: Indexes cause performance issues (rare)

6. **rollback_add_unique_constraint_hiring_process_candidate_job.sql**
   - Rollback for: `20251127130042_add_unique_constraint_hiring_process_candidate_job`
   - Risk: None (allows duplicate hiring processes)
   - Use when: Unique constraint blocks legitimate duplicates

## Warnings

### Data Loss Risks

**Critical Risk (DO NOT rollback in production without backup):**
- `rollback_implement_soft_delete_and_cascade_behavior.sql`
- `rollback_fix_cascade_delete_behavior.sql`

**High Risk (Data will be lost):**
- `rollback_add_audit_log_model.sql` (loses audit logs)
- `rollback_add_soft_delete_to_stages.sql` (loses soft-deleted stages)

**Safe (No data loss):**
- `rollback_add_critical_database_indexes.sql` (indexes only)
- `rollback_add_unique_constraint_hiring_process_candidate_job.sql` (constraint only)

### Production Rollback

**NEVER rollback in production without:**
1. Recent database backup (< 1 hour old)
2. Approval from tech lead
3. Tested rollback procedure in staging
4. Maintenance mode enabled
5. Stakeholder notification

## Rollback Decision Tree

```
Need to rollback migration?
  |
  ├─> Can we fix forward? ────> YES ────> Deploy hotfix (skip rollback)
  |
  └─> NO
      |
      ├─> Is there a rollback SQL file? ────> YES ────> Use rollback SQL
      |
      └─> NO ────> Restore from backup
```

## Creating Rollback SQL

When creating a new migration, always create a rollback SQL file:

1. **Review migration SQL**
   ```bash
   cat prisma/migrations/YYYYMMDD_migration_name/migration.sql
   ```

2. **Write inverse operations**
   - DROP tables/columns added
   - ADD tables/columns removed
   - Reverse constraint changes
   - Remove indexes added

3. **Test rollback**
   ```bash
   ./scripts/test-migration.sh <migration_name> prisma/rollbacks/rollback_<migration_name>.sql
   ```

4. **Document data loss risks**
   - Add comments to rollback SQL
   - Update this README
   - Document in `.claude/docs/MIGRATION_ROLLBACK_TESTS.md`

## Related Documentation

- **Migration History**: `.claude/docs/DATABASE_MIGRATIONS.md`
- **Rollback Procedures**: `.claude/docs/MIGRATION_ROLLBACK_PROCEDURES.md`
- **Production Checklist**: `.claude/docs/PRODUCTION_MIGRATION_CHECKLIST.md`
- **Test Results**: `.claude/docs/MIGRATION_ROLLBACK_TESTS.md`
- **Backup & Restore**: `docs/BACKUP_RESTORE.md`

## Emergency Rollback

**If production migration fails:**

1. **Stop application immediately**
   ```bash
   docker-compose stop backend
   ```

2. **Create pre-rollback backup**
   ```bash
   docker-compose exec -T db pg_dump -U admin recruiting_tool > backup_pre_rollback_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Execute rollback SQL**
   ```bash
   docker-compose exec -T db psql -U admin recruiting_tool < prisma/rollbacks/rollback_<migration_name>.sql
   ```

4. **Update migration table**
   ```bash
   docker-compose exec db psql -U admin recruiting_tool
   DELETE FROM "_prisma_migrations" WHERE migration_name = '<migration_name>';
   \q
   ```

5. **Restart application**
   ```bash
   docker-compose up -d backend
   ```

6. **Verify health**
   ```bash
   curl http://localhost:4000/api/health
   ```

7. **Notify stakeholders**

## Support

For questions or issues with rollback procedures:
- Review `.claude/docs/MIGRATION_ROLLBACK_PROCEDURES.md`
- Check `.claude/docs/MIGRATION_ROLLBACK_TESTS.md` for test results
- Contact database admin or tech lead
