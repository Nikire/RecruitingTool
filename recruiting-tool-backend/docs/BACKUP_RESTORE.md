# Backup and Restore Procedures

## Overview

This document provides comprehensive procedures for backing up and restoring the Recruiting Tool system, including database, file storage, and configurations.

---

## Backup Strategy

### What is Backed Up?

1. **PostgreSQL Database**
   - All application data (users, job positions, candidates, applications, etc.)
   - Schema and migrations history
   - Indexes and constraints

2. **MinIO File Storage**
   - Uploaded resumes and documents
   - User profile images
   - All files in the `recruiting-tool` bucket

3. **Application Configuration**
   - Environment variables (.env files)
   - Docker configuration (docker-compose.yml)
   - Application code (version-controlled via Git)

4. **Prisma Migrations**
   - Migration history (prisma/migrations/)
   - Schema definition (prisma/schema.prisma)

### Backup Frequency

**Default Configuration:**
- **Database**: Daily full backups at 2 AM
- **Files**: Included in daily backups
- **Retention**: 30 days

**Configuration Variables:**
```bash
BACKUP_ENABLED=true           # Enable/disable automatic backups
BACKUP_CRON='0 2 * * *'       # Cron schedule (daily at 2 AM)
BACKUP_RETENTION_DAYS=30      # Keep backups for 30 days
BACKUP_PATH=/backups          # Backup storage location
MINIO_DATA_PATH=/data/minio   # MinIO data directory
```

### Backup Location

- **Local Storage**: `/backups` directory (Docker volume)
- **Backup Files**: Named with timestamp: `backup-YYYY-MM-DD_HH-MM-SS.tar.gz`
- **Off-site**: Configure S3/cloud storage for production (recommended)

---

## Manual Backup Procedures

### Full System Backup

Create a complete backup of database and files:

```bash
# 1. Create backup directory
mkdir -p ./backups

# 2. Backup PostgreSQL database
docker-compose exec -T db pg_dump -U postgres recruiting_tool_db | gzip > ./backups/db-$(date +%Y%m%d_%H%M%S).sql.gz

# 3. Backup MinIO files
docker cp $(docker-compose ps -q minio):/data ./backups/minio-data-$(date +%Y%m%d_%H%M%S)

# 4. Create archive
tar -czf ./backups/full-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  ./backups/db-*.sql.gz \
  ./backups/minio-data-* \
  ./recruiting-tool-backend/.env \
  ./recruiting-tool-frontend/.env \
  ./docker-compose.yml

# 5. Clean up temporary files
rm -rf ./backups/db-*.sql.gz ./backups/minio-data-*
```

### Database-Only Backup

Backup just the PostgreSQL database:

```bash
# Using pg_dump
docker-compose exec -T db pg_dump \
  -U postgres \
  -d recruiting_tool_db \
  -F c \
  -f /backups/recruiting_tool_db_$(date +%Y%m%d_%H%M%S).dump

# Using SQL format (human-readable)
docker-compose exec -T db pg_dump \
  -U postgres \
  -d recruiting_tool_db \
  | gzip > ./backups/db-$(date +%Y%m%d_%H%M%S).sql.gz
```

### MinIO Files-Only Backup

Backup just the file storage:

```bash
# Copy MinIO data directory
docker cp $(docker-compose ps -q minio):/data ./backups/minio-backup-$(date +%Y%m%d_%H%M%S)

# Or tar it directly
docker run --rm \
  --volumes-from $(docker-compose ps -q minio) \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-$(date +%Y%m%d_%H%M%S).tar.gz /data
```

---

## Restore Procedures

### Pre-Restore Checklist

Before restoring:
- [ ] Stop all services: `docker-compose down`
- [ ] Verify backup file integrity
- [ ] Note current system state (if needed for rollback)
- [ ] Ensure sufficient disk space
- [ ] Notify users of maintenance (production)

### Full System Restore

Restore complete system from backup archive:

```bash
# 1. Stop all services
docker-compose down

# 2. Extract backup archive
tar -xzf ./backups/full-backup-YYYYMMDD_HHMMSS.tar.gz -C ./

# 3. Restore database (see Database Restore section below)

# 4. Restore MinIO files (see File Storage Restore section below)

# 5. Restore configuration files
cp ./backups/recruiting-tool-backend/.env ./recruiting-tool-backend/.env
cp ./backups/recruiting-tool-frontend/.env ./recruiting-tool-frontend/.env
cp ./backups/docker-compose.yml ./docker-compose.yml

# 6. Start services
docker-compose up -d

# 7. Verify system health
curl http://localhost:4000/api/health
```

### Database Restore

#### Method 1: From Custom Format Dump

```bash
# 1. Stop backend service
docker-compose stop backend

# 2. Drop existing database (DESTRUCTIVE)
docker-compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS recruiting_tool_db;"

# 3. Create fresh database
docker-compose exec db psql -U postgres -c "CREATE DATABASE recruiting_tool_db;"

# 4. Restore from dump
docker-compose exec -T db pg_restore \
  -U postgres \
  -d recruiting_tool_db \
  -v \
  /backups/recruiting_tool_db_YYYYMMDD_HHMMSS.dump

# 5. Restart backend
docker-compose start backend
```

#### Method 2: From SQL File

```bash
# 1. Stop backend service
docker-compose stop backend

# 2. Drop and recreate database
docker-compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS recruiting_tool_db;"
docker-compose exec db psql -U postgres -c "CREATE DATABASE recruiting_tool_db;"

# 3. Restore from SQL dump
gunzip -c ./backups/db-YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose exec -T db psql -U postgres -d recruiting_tool_db

# 4. Restart backend
docker-compose start backend
```

### File Storage Restore

Restore MinIO file storage:

```bash
# 1. Stop MinIO service
docker-compose stop minio

# 2. Clear existing data (DESTRUCTIVE)
docker volume rm $(docker-compose config --volumes | grep minio_data)

# 3. Extract backup to data directory
docker run --rm \
  -v $(docker-compose config --volumes | grep minio_data):/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/minio-YYYYMMDD_HHMMSS.tar.gz --strip-components=1"

# 4. Restart MinIO
docker-compose start minio
```

### Point-in-Time Recovery

For specific table or data recovery:

```bash
# 1. Restore to temporary database
docker-compose exec db psql -U postgres -c "CREATE DATABASE temp_restore;"
gunzip -c ./backups/db-YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose exec -T db psql -U postgres -d temp_restore

# 2. Extract specific data
docker-compose exec db psql -U postgres -d temp_restore -c \
  "COPY (SELECT * FROM \"User\" WHERE email = 'specific@example.com') TO '/tmp/recovered_user.csv' CSV HEADER;"

# 3. Import to production database
docker-compose exec db psql -U postgres -d recruiting_tool_db -c \
  "COPY \"User\" FROM '/tmp/recovered_user.csv' CSV HEADER;"

# 4. Clean up
docker-compose exec db psql -U postgres -c "DROP DATABASE temp_restore;"
```

---

## Automated Backup System

### Setup Automated Backups

1. **Enable in Environment Variables:**
   ```bash
   # Edit .env file
   BACKUP_ENABLED=true
   BACKUP_CRON='0 2 * * *'  # Daily at 2 AM
   BACKUP_RETENTION_DAYS=30
   ```

2. **Create Backup Script:**
   Create `scripts/backup.sh`:
   ```bash
   #!/bin/bash
   BACKUP_DIR=/backups
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)

   # Database backup
   docker-compose exec -T db pg_dump -U postgres recruiting_tool_db | \
     gzip > $BACKUP_DIR/db-$TIMESTAMP.sql.gz

   # MinIO backup
   docker cp $(docker-compose ps -q minio):/data $BACKUP_DIR/minio-$TIMESTAMP
   tar -czf $BACKUP_DIR/minio-$TIMESTAMP.tar.gz $BACKUP_DIR/minio-$TIMESTAMP
   rm -rf $BACKUP_DIR/minio-$TIMESTAMP

   # Create full archive
   tar -czf $BACKUP_DIR/backup-$TIMESTAMP.tar.gz \
     $BACKUP_DIR/db-$TIMESTAMP.sql.gz \
     $BACKUP_DIR/minio-$TIMESTAMP.tar.gz

   # Cleanup
   find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete

   echo "Backup completed: backup-$TIMESTAMP.tar.gz"
   ```

3. **Schedule with Cron:**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/recruiting-tool/scripts/backup.sh
   ```

### Verify Backup Automation

```bash
# Check backup files
ls -lh /backups/

# Test restore from latest backup
LATEST_BACKUP=$(ls -t /backups/backup-*.tar.gz | head -1)
echo "Latest backup: $LATEST_BACKUP"

# Verify backup file integrity
tar -tzf $LATEST_BACKUP > /dev/null && echo "Backup OK" || echo "Backup CORRUPTED"
```

---

## Disaster Recovery Runbook

### Scenario 1: Database Corruption

**Symptoms:** Database errors, data inconsistencies, failed queries

**Recovery Steps:**
1. Identify latest valid backup: `ls -t /backups/db-*.sql.gz | head -1`
2. Stop backend: `docker-compose stop backend`
3. Restore database from backup (see Database Restore)
4. Run Prisma migrations: `docker-compose exec backend npx prisma migrate deploy`
5. Restart services: `docker-compose up -d`
6. Verify data integrity: Check recent records, run test queries

**Recovery Time Objective (RTO):** 15-30 minutes
**Recovery Point Objective (RPO):** Last daily backup (max 24 hours data loss)

### Scenario 2: File Storage Loss

**Symptoms:** Missing files, 404 errors on file downloads, MinIO errors

**Recovery Steps:**
1. Stop MinIO: `docker-compose stop minio`
2. Restore MinIO data (see File Storage Restore)
3. Restart MinIO: `docker-compose start minio`
4. Verify file access: Test file download via API

**RTO:** 10-20 minutes
**RPO:** Last daily backup

### Scenario 3: Complete System Failure

**Symptoms:** Server crash, data center failure, Docker host failure

**Recovery Steps:**
1. Provision new server/environment
2. Install Docker and Docker Compose
3. Clone application repository
4. Restore .env files
5. Restore database and files (see Full System Restore)
6. Start all services: `docker-compose up -d`
7. Run smoke tests: Authentication, file upload, create job position

**RTO:** 1-2 hours
**RPO:** Last daily backup

---

## Backup Testing Procedures

**Test backups monthly to ensure recoverability.**

### Test Restore (Isolated Environment)

1. **Create test environment:**
   ```bash
   # Clone production docker-compose for testing
   cp docker-compose.yml docker-compose.test.yml

   # Modify ports to avoid conflicts
   sed -i 's/5432:5432/5433:5432/g' docker-compose.test.yml
   sed -i 's/4000:4000/4001:4000/g' docker-compose.test.yml
   ```

2. **Restore backup to test environment:**
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   # Follow restore procedures above
   ```

3. **Verify data:**
   ```bash
   # Check user count
   docker-compose -f docker-compose.test.yml exec db psql -U postgres -d recruiting_tool_db -c "SELECT COUNT(*) FROM \"User\";"

   # Check recent records
   docker-compose -f docker-compose.test.yml exec db psql -U postgres -d recruiting_tool_db -c "SELECT * FROM \"JobPosition\" ORDER BY \"createdAt\" DESC LIMIT 5;"
   ```

4. **Test application functionality:**
   - Login at http://localhost:4001/api
   - Create test job position
   - Upload test file
   - Create test candidate

5. **Cleanup:**
   ```bash
   docker-compose -f docker-compose.test.yml down -v
   rm docker-compose.test.yml
   ```

---

## Monitoring and Alerts

### Backup Monitoring

**Check backup status:**
```bash
# List recent backups
ls -lht /backups/ | head -10

# Check backup size trends
du -sh /backups/backup-*.tar.gz

# Verify latest backup is recent (within 25 hours)
LATEST_BACKUP=$(find /backups -name "backup-*.tar.gz" -mtime -1)
[ -z "$LATEST_BACKUP" ] && echo "WARNING: No recent backup found!"
```

### Alerts to Configure

1. **Backup Failure Alert:** Email if backup script fails
2. **Storage Alert:** Email if backup directory > 90% full
3. **Old Backup Alert:** Email if latest backup > 25 hours old

**Example monitoring script:**
```bash
#!/bin/bash
# Check if backup is recent
LATEST_BACKUP=$(find /backups -name "backup-*.tar.gz" -mtime -1)
if [ -z "$LATEST_BACKUP" ]; then
  echo "ALERT: No backup in last 24 hours!" | mail -s "Backup Alert" admin@example.com
fi

# Check backup directory size
USAGE=$(df -h /backups | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $USAGE -gt 90 ]; then
  echo "ALERT: Backup directory 90% full!" | mail -s "Storage Alert" admin@example.com
fi
```

---

## Production Best Practices

1. **3-2-1 Backup Rule:**
   - 3 copies of data (production + 2 backups)
   - 2 different storage types (local + cloud)
   - 1 off-site backup

2. **Off-Site Backups:**
   - Configure AWS S3/Azure Blob for backup storage
   - Use `s3cmd` or `rclone` to sync backups to cloud

   ```bash
   # Example: Sync to S3
   s3cmd sync /backups/ s3://my-recruiting-tool-backups/$(date +%Y-%m)/
   ```

3. **Encryption:**
   - Encrypt backups before uploading to cloud
   ```bash
   # Encrypt backup
   gpg --symmetric --cipher-algo AES256 backup-YYYYMMDD.tar.gz
   ```

4. **Access Control:**
   - Restrict backup directory permissions: `chmod 700 /backups`
   - Use separate credentials for backup storage

5. **Backup Verification:**
   - Automated integrity checks (checksum verification)
   - Monthly test restores to staging environment

6. **Documentation:**
   - Document backup locations
   - Maintain runbook for disaster recovery
   - Keep contact list for emergency response

---

## Troubleshooting

### Backup Script Fails

**Check logs:**
```bash
docker-compose logs backend | grep backup
journalctl -u docker | grep backup
```

**Common issues:**
- Insufficient disk space → Clean old backups, expand volume
- Permission denied → Check Docker volume permissions
- Database connection timeout → Increase pg_dump timeout

### Restore Fails

**"Database already exists":**
```bash
docker-compose exec db psql -U postgres -c "DROP DATABASE recruiting_tool_db;"
```

**"Permission denied":**
```bash
# Ensure postgres user owns the dump file
docker-compose exec db chown postgres:postgres /backups/*.dump
```

**"pg_restore: error: could not execute query":**
- Check PostgreSQL version compatibility
- Ensure dump format matches (custom vs SQL)

---

## Related Documentation

- **Docker Configuration:** `docker-compose.yml`
- **Database Schema:** `recruiting-tool-backend/prisma/schema.prisma`
- **Environment Variables:** `recruiting-tool-backend/.env.example`
- **MinIO Documentation:** https://min.io/docs/minio/linux/operations/data-recovery.html

---

## Support

For backup/restore issues:
1. Check this documentation
2. Review Docker logs: `docker-compose logs`
3. Verify backup file integrity: `tar -tzf backup.tar.gz`
4. Test restore in isolated environment first
5. Contact infrastructure team for production issues

**Emergency Contacts:**
- Database Administrator: [TBD]
- System Administrator: [TBD]
- On-Call Engineer: [TBD]
