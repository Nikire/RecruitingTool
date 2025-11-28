#!/bin/bash
# Test migration and rollback procedure
# Usage: ./test-migration.sh [migration_name] [rollback_sql_file]

set -e

echo "=== Migration Rollback Test ==="
echo ""

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

# Function to print warning
warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running in correct directory
if [ ! -f "docker-compose.yml" ]; then
  error "Must run this script from the project root directory"
  exit 1
fi

# 1. Create database backup
echo "1. Creating database backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="test_backup_${TIMESTAMP}.sql"

docker-compose exec -T db pg_dump -U admin recruiting_tool > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
  success "Backup created: $BACKUP_FILE"
else
  error "Backup failed"
  exit 1
fi

# Verify backup file exists and has content
if [ ! -s "$BACKUP_FILE" ]; then
  error "Backup file is empty or does not exist"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  Backup size: $BACKUP_SIZE"

# 2. Apply migration (if migration name provided)
if [ -n "$1" ]; then
  echo ""
  echo "2. Applying migration: $1"

  cd recruiting-tool-backend
  npx prisma migrate deploy > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    success "Migration applied successfully"
  else
    error "Migration failed"
    cd ..
    exit 1
  fi

  cd ..
else
  echo ""
  echo "2. Skipping migration (no migration name provided)"
fi

# 3. Test application
echo ""
echo "3. Testing application..."

# Restart backend to ensure it connects to updated schema
docker-compose up -d backend > /dev/null 2>&1
sleep 5

# Test health endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health)

if [ "$HTTP_CODE" = "200" ]; then
  success "Application health check passed"
else
  warning "Health check returned HTTP $HTTP_CODE (expected 200)"
fi

# 4. Test rollback (if rollback SQL provided)
if [ -n "$2" ]; then
  echo ""
  echo "4. Testing rollback..."

  # Check if rollback file exists
  if [ ! -f "$2" ]; then
    error "Rollback SQL file not found: $2"
    exit 1
  fi

  # Apply rollback SQL
  docker-compose exec -T db psql -U admin recruiting_tool < "$2" > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    success "Rollback SQL applied successfully"
  else
    error "Rollback SQL failed"
    exit 1
  fi

  # Update Prisma migration table (if migration name provided)
  if [ -n "$1" ]; then
    echo "  Updating migration table..."
    docker-compose exec db psql -U admin recruiting_tool -c \
      "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '$1';" > /dev/null 2>&1
    success "Migration table updated"
  fi

  echo ""
  echo "5. Verifying application after rollback..."

  # Restart backend after rollback
  docker-compose restart backend > /dev/null 2>&1
  sleep 5

  # Test health endpoint again
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health)

  if [ "$HTTP_CODE" = "200" ]; then
    success "Application health check passed after rollback"
  else
    warning "Health check returned HTTP $HTTP_CODE after rollback"
  fi
else
  echo ""
  echo "4. Skipping rollback test (no rollback SQL file provided)"
fi

# 6. Verify database schema
echo ""
echo "6. Verifying database schema..."

# Get table count
TABLE_COUNT=$(docker-compose exec -T db psql -U admin recruiting_tool -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' \n')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
  success "Database has $TABLE_COUNT tables"
else
  error "Could not verify database schema"
fi

# 7. Check for errors in logs
echo ""
echo "7. Checking backend logs for errors..."

ERROR_COUNT=$(docker-compose logs backend --tail=50 | grep -i "error" | wc -l)

if [ "$ERROR_COUNT" -eq 0 ]; then
  success "No errors found in recent logs"
else
  warning "Found $ERROR_COUNT error messages in logs (review docker-compose logs backend)"
fi

# 8. Summary
echo ""
echo "=== Test Summary ==="
echo ""
echo "Backup file: $BACKUP_FILE ($BACKUP_SIZE)"

if [ -n "$1" ]; then
  echo "Migration tested: $1"
fi

if [ -n "$2" ]; then
  echo "Rollback tested: $2"
fi

echo ""
success "Test Complete"
echo ""
echo "Next steps:"
echo "  1. Review test results above"
echo "  2. Check application functionality manually"
echo "  3. Delete test backup if satisfied: rm $BACKUP_FILE"
echo "  4. Or restore from backup: docker-compose exec -T db psql -U admin recruiting_tool < $BACKUP_FILE"
echo ""
