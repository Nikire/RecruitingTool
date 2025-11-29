#!/bin/bash
# Automated database backup script
# Usage: ./backup-database.sh [--compress]

set -e

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print info
info() {
  echo -e "${YELLOW}→ $1${NC}"
}

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/recruiting_tool_backup_$TIMESTAMP.sql"
COMPRESS=false

# Parse arguments
if [ "$1" = "--compress" ]; then
  COMPRESS=true
fi

# Check if running in correct directory
if [ ! -f "docker-compose.yml" ]; then
  error "Must run this script from the project root directory"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database container is running
DB_STATUS=$(docker-compose ps -q db)
if [ -z "$DB_STATUS" ]; then
  error "Database container is not running"
  echo "Start it with: docker-compose up -d db"
  exit 1
fi

# Create backup
info "Creating database backup..."
echo "  Database: recruiting_tool"
echo "  Timestamp: $TIMESTAMP"
echo "  Output: $BACKUP_FILE"
echo ""

docker-compose exec -T db pg_dump -U admin recruiting_tool > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
  success "Backup created successfully"
else
  error "Backup failed"
  exit 1
fi

# Verify backup file exists and has content
if [ ! -s "$BACKUP_FILE" ]; then
  error "Backup file is empty or does not exist"
  exit 1
fi

# Get backup file size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  Backup size: $BACKUP_SIZE"

# Compress backup if requested
if [ "$COMPRESS" = true ]; then
  info "Compressing backup..."
  gzip "$BACKUP_FILE"

  if [ $? -eq 0 ]; then
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    success "Backup compressed: $COMPRESSED_FILE"
    echo "  Compressed size: $COMPRESSED_SIZE"
    BACKUP_FILE="$COMPRESSED_FILE"
  else
    error "Compression failed"
  fi
fi

# Get record counts for verification
info "Verifying backup contents..."

RECORD_COUNTS=$(docker-compose exec -T db psql -U admin recruiting_tool -t -c "
  SELECT json_build_object(
    'users', (SELECT count(*) FROM \"User\"),
    'candidates', (SELECT count(*) FROM \"Candidate\"),
    'jobPositions', (SELECT count(*) FROM \"JobPosition\"),
    'hiringProcesses', (SELECT count(*) FROM \"HiringProcess\"),
    'applications', (SELECT count(*) FROM \"Application\")
  );" 2>/dev/null | tr -d ' \n')

if [ -n "$RECORD_COUNTS" ]; then
  echo "  $RECORD_COUNTS"
  success "Backup contents verified"
else
  error "Could not verify backup contents"
fi

# Keep only last N days of backups
RETENTION_DAYS=7
info "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."

# Find and delete backups older than retention period
DELETED_COUNT=0
if command -v find &> /dev/null; then
  DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.sql" -mtime +$RETENTION_DAYS -delete -print | wc -l)
  DELETED_COUNT=$((DELETED_COUNT + $(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)))
fi

if [ "$DELETED_COUNT" -gt 0 ]; then
  success "Deleted $DELETED_COUNT old backup(s)"
else
  echo "  No old backups to delete"
fi

# List current backups
echo ""
info "Current backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'

# Summary
echo ""
success "Backup Complete"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""
echo "To restore from this backup:"
echo "  1. Stop backend: docker-compose stop backend"
echo "  2. Restore backup:"

if [ "$COMPRESS" = true ]; then
  echo "     gunzip -c $BACKUP_FILE | docker-compose exec -T db psql -U admin recruiting_tool"
else
  echo "     docker-compose exec -T db psql -U admin recruiting_tool < $BACKUP_FILE"
fi

echo "  3. Restart backend: docker-compose up -d backend"
echo ""
