# Migration Rollback - Quick Reference

## Emergency Rollback (Production)

### 1. Stop Application
```bash
docker-compose stop backend
```

### 2. Create Pre-Rollback Backup
```bash
docker-compose exec -T db pg_dump -U admin recruiting_tool > backup_emergency_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Apply Rollback SQL
```bash
docker-compose exec -T db psql -U admin recruiting_tool < prisma/rollbacks/rollback_<migration_name>.sql
```

### 4. Update Migration Table
```bash
docker-compose exec db psql -U admin recruiting_tool
DELETE FROM "_prisma_migrations" WHERE migration_name = '<migration_name>';
\q
```

### 5. Restart Application
```bash
docker-compose up -d backend
```

### 6. Verify Health
```bash
curl http://localhost:4000/api/health
```

---

## Automated Backup

```bash
# Basic backup
./recruiting-tool-backend/scripts/backup-database.sh

# Compressed backup (recommended)
./recruiting-tool-backend/scripts/backup-database.sh --compress
```

**Location**: `recruiting-tool-backend/backups/`
**Retention**: 7 days (auto-cleanup)

---

## Test Rollback (Development)

```bash
./recruiting-tool-backend/scripts/test-migration.sh \
  <migration_name> \
  prisma/rollbacks/rollback_<migration_name>.sql
```

**Features**:
- Creates test backup
- Applies migration
- Tests health
- Applies rollback
- Verifies health after rollback

---

## Available Rollback SQL

| Migration | Rollback SQL File | Risk |
|-----------|------------------|------|
| `add_audit_log_model` | `rollback_add_audit_log_model.sql` | High |
| `add_soft_delete_to_stages` | `rollback_add_soft_delete_to_stages.sql` | High |
| `implement_soft_delete_and_cascade_behavior` | `rollback_implement_soft_delete_and_cascade_behavior.sql` | Critical |
| `fix_cascade_delete_behavior` | `rollback_fix_cascade_delete_behavior.sql` | High |
| `add_critical_database_indexes` | `rollback_add_critical_database_indexes.sql` | None |
| `add_unique_constraint_hiring_process_candidate_job` | `rollback_add_unique_constraint_hiring_process_candidate_job.sql` | None |

---

## Restore from Backup

### Full Database Restore

```bash
# Stop backend
docker-compose stop backend

# Restore
docker-compose exec -T db psql -U admin recruiting_tool < backup_file.sql

# Restart backend
docker-compose up -d backend
```

### Compressed Backup Restore

```bash
gunzip -c backup_file.sql.gz | docker-compose exec -T db psql -U admin recruiting_tool
```

---

## Common Commands

### Check Migration Status
```bash
cd recruiting-tool-backend
npx prisma migrate status
```

### List Recent Migrations
```bash
docker-compose exec db psql -U admin recruiting_tool -c \
  "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```

### Check Database Size
```bash
docker-compose exec db psql -U admin recruiting_tool -c \
  "SELECT pg_size_pretty(pg_database_size('recruiting_tool'));"
```

### List Backups
```bash
ls -lh recruiting-tool-backend/backups/
```

---

## Decision Tree

```
Migration Failed?
  |
  ├─> Can fix forward? ───> YES ───> Deploy hotfix
  |
  └─> NO
      |
      ├─> Rollback SQL exists? ───> YES ───> Use Method 1 (SQL Rollback)
      |
      └─> NO ───> Use Method 2 (Restore from Backup)
```

---

## Risk Levels

**Critical**: Do NOT rollback without CTO approval
- `rollback_implement_soft_delete_and_cascade_behavior.sql`
- `rollback_fix_cascade_delete_behavior.sql`

**High**: Data will be lost
- `rollback_add_audit_log_model.sql` (loses audit logs)
- `rollback_add_soft_delete_to_stages.sql` (loses soft-deleted stages)

**Safe**: No data loss
- `rollback_add_critical_database_indexes.sql` (indexes only)
- `rollback_add_unique_constraint_hiring_process_candidate_job.sql` (constraint only)

---

## Production Checklist

Before rollback:
- [ ] Tech lead approval
- [ ] Pre-rollback backup created
- [ ] Stakeholders notified
- [ ] Rollback tested in staging
- [ ] Maintenance mode enabled

After rollback:
- [ ] Application health verified
- [ ] Logs checked for errors
- [ ] Stakeholders notified
- [ ] Incident documented
- [ ] Post-mortem scheduled

---

## Documentation

**Full Documentation**:
- `.claude/docs/DATABASE_MIGRATIONS.md` - Migration history
- `.claude/docs/MIGRATION_ROLLBACK_PROCEDURES.md` - Detailed procedures
- `.claude/docs/PRODUCTION_MIGRATION_CHECKLIST.md` - Pre/post migration steps
- `.claude/docs/MIGRATION_ROLLBACK_TESTS.md` - Test results
- `prisma/rollbacks/README.md` - Rollback SQL documentation

**Scripts**:
- `scripts/test-migration.sh` - Test migrations and rollbacks
- `scripts/backup-database.sh` - Automated backups

---

## Emergency Contacts

**Production Issues**:
1. Stop application
2. Create backup
3. Contact tech lead
4. Assess: fix forward or rollback
5. Execute plan
6. Notify stakeholders

---

## Notes

- **NEVER** rollback in production without a backup
- **ALWAYS** test rollback in staging first
- **COMMUNICATE** with stakeholders before/after
- **DOCUMENT** everything
- When in doubt, **RESTORE FROM BACKUP**
