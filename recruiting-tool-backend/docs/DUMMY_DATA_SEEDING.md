# Dummy Data Seeding - Idempotent Pattern

## Overview

The dummy data service (`src/modules/dummy/dummy.service.ts`) automatically seeds the database with realistic sample data when the application starts. The seeding process is **idempotent**, meaning it can be run multiple times safely without creating duplicate data.

## How It Works

### Automatic Seeding on Startup

The `DummyService` implements the `OnApplicationBootstrap` lifecycle hook, which runs automatically when the NestJS application starts:

```typescript
async onApplicationBootstrap() {
  this.logger.log('DummyService initialized');

  // Idempotent seeding - check and create only missing data
  await this.createDummyData();
}
```

### Idempotent Pattern

For each entity type, the service:

1. **Checks if data exists** - Counts existing records in the database
2. **Skips silently if data exists** - No logs, no operations
3. **Creates data if missing** - Only logs when actually creating data

**Example:**

```typescript
// Check if companies already exist
const existingCompaniesCount = await this.databaseService.company.count();

if (existingCompaniesCount === 0) {
  // Only create if missing
  this.logger.log('Creating companies...');
  for (const company of data.companies) {
    // Create company...
    this.logger.log(`Created company: ${company.name}`);
  }
} else {
  // Data exists - retrieve existing records (no log)
  createdCompanies = await this.databaseService.company.findMany({
    orderBy: { id: 'asc' },
  });
}
```

## Benefits

### 1. Safe to Run Multiple Times
- Backend container restarts don't create duplicates
- Development workflow: can rebuild/restart without data corruption
- Production deployment: safe automatic seeding on first run

### 2. Fast When Data Exists
- Instant startup when data already exists
- Only performs counts, not full data creation
- Minimal database queries

### 3. Predictable Behavior
- Logs only when creating new data
- Silent when data exists (no spam logs)
- Easy to debug: check logs to see what was created

## Entity Order

Entities are seeded in dependency order to satisfy foreign key constraints:

1. **Companies** - Base entity (no dependencies)
2. **Users** - Depends on Companies
3. **Profiles** - Depends on Users
4. **Job Positions** - Depends on Companies and Users
5. **Stages (Templates)** - Depends on Job Positions
6. **Candidates** - Independent (just email)
7. **Hiring Processes** - Depends on Candidates, Job Positions, Companies
8. **Stages (Hiring Process)** - Depends on Hiring Processes
9. **Candidate Notes** - Depends on Candidates and Users
10. **Email Templates** - Depends on Companies and Users
11. **File Uploads** - Depends on Users and Candidates
12. **Applications** - Depends on Job Positions and File Uploads
13. **Interviews** - Depends on Stages and Users
14. **Interview Interviewers** - Depends on Interviews and Users
15. **Candidate Activities** - Depends on Candidates and Users
16. **Stage Notes** - Depends on Stages and Users
17. **Stage Time Logs** - Depends on Stages and Candidates
18. **Email Logs** - Independent
19. **HR Schedules** - Depends on Users
20. **Scorecard Templates** - Depends on Companies
21. **Scorecard Categories** - Depends on Scorecard Templates
22. **Scorecard Criteria** - Depends on Scorecard Categories
23. **Candidate Scores** - Depends on Candidates and Job Positions
24. **AI Quotas** - Depends on Companies
25. **AI Usage Logs** - Depends on Companies and Users

## Temporal Patterns for Analytics

The dummy data includes realistic temporal patterns to support analytics features:

### Candidate Creation Dates
- Spread over the past **6 months**
- Creates realistic time-series data for charts
- Random distribution using `getRandomPastDate(6)`

### Stage Progression
- Candidates progress through stages over time
- 3-7 days between stages on average
- Realistic hiring funnel with drop-off rates

### Application Status Distribution
- 30% PENDING
- 35% REVIEWED
- 25% REJECTED
- 10% ACCEPTED

### Interview Status Distribution
- 20% SCHEDULED
- 60% COMPLETED
- 10% CANCELLED
- 10% NO_SHOW

## Data Source

All dummy data is defined in `src/modules/dummy/data/dummy-data.json`:

- Companies (2)
- Users (5)
- Job Positions (4)
- Candidates (6)
- Applications (18)
- And all related entities...

## Testing Idempotent Behavior

### Test 1: Fresh Database
```bash
# Reset database
npx prisma migrate reset --force

# Start backend - should create all data
docker-compose up -d backend

# Check logs - should see "Creating companies...", "Creating users...", etc.
docker logs recruitingtool-backend-1 | grep "Creating"
```

### Test 2: Existing Data
```bash
# Restart backend with existing data
docker restart recruitingtool-backend-1

# Check logs - should only see "DummyService initialized" and "Dummy data seeding completed!"
docker logs recruitingtool-backend-1 | grep "DummyService"
```

### Test 3: Verify No Duplicates
```bash
# Count records before restart
docker exec recruitingtool-db-1 psql -U postgres -d recruiting_tool_db -c "SELECT COUNT(*) FROM \"Company\";"

# Restart backend
docker restart recruitingtool-backend-1

# Count records after restart - should be the same
docker exec recruitingtool-db-1 psql -U postgres -d recruiting_tool_db -c "SELECT COUNT(*) FROM \"Company\";"
```

## Maintenance

### Adding New Entities

When adding a new entity to dummy data:

1. **Update the interface** in `dummy.service.ts`:
   ```typescript
   interface DummyDataStructure {
     // ... existing
     newEntities: Array<{ /* fields */ }>;
   }
   ```

2. **Add data to `dummy-data.json`**:
   ```json
   {
     "newEntities": [
       { "field": "value" }
     ]
   }
   ```

3. **Add idempotent seeding logic**:
   ```typescript
   // Check if new entities exist
   const existingNewEntitiesCount = await this.databaseService.newEntity.count();
   if (existingNewEntitiesCount === 0) {
     this.logger.log('Creating new entities...');
     for (const entity of data.newEntities) {
       // Create entity...
       this.logger.log(`Created new entity: ${entity.name}`);
     }
   }
   ```

4. **Place in correct order** based on dependencies

### Updating Existing Data

To update dummy data values:

1. **Edit `dummy-data.json`**
2. **Reset database** (development only):
   ```bash
   npx prisma migrate reset --force
   ```
3. **Restart backend** - will seed with updated values

## Production Considerations

### First Deployment
- Database is empty
- Dummy data will be created automatically on first backend start
- Logs will show all "Creating..." messages

### Subsequent Deployments
- Database already has data
- Dummy data seeding completes instantly
- No duplicate data created
- Silent operation (no "Creating..." logs)

### Disabling Dummy Data

To disable automatic dummy data seeding in production:

**Option 1: Environment Variable**
```env
ENABLE_DUMMY_DATA=false
```

Then update `dummy.service.ts`:
```typescript
async onApplicationBootstrap() {
  if (this.configService.get('ENABLE_DUMMY_DATA') !== 'true') {
    return;
  }
  // ... seeding logic
}
```

**Option 2: Remove Module**

Remove `DummyModule` from `AppModule` imports for production builds.

## Troubleshooting

### Issue: Data Not Created
**Symptoms:** Backend starts but no data in database

**Solution:**
1. Check if data already exists: `SELECT COUNT(*) FROM "Company";`
2. If empty, check backend logs for errors
3. Verify `dummy-data.json` is being read correctly
4. Check Prisma schema matches database

### Issue: Duplicate Data
**Symptoms:** Multiple copies of same data

**Solution:**
1. Should not happen with idempotent pattern
2. If it does, check if counts are correct
3. Verify unique constraints in schema
4. Reset database and reseed: `npx prisma migrate reset --force`

### Issue: Missing Data for Some Entities
**Symptoms:** Some entities created, others missing

**Solution:**
1. Check logs for errors or warnings
2. Verify dependency order (entities with foreign keys)
3. Check for null safety in idempotent retrieval logic
4. Look for missing data in `dummy-data.json`

## Related Files

- **Service:** `src/modules/dummy/dummy.service.ts`
- **Data:** `src/modules/dummy/data/dummy-data.json`
- **Module:** `src/modules/dummy/dummy.module.ts`
- **Database Service:** `src/modules/shared/modules/database/database.service.ts`
- **Schema:** `prisma/schema.prisma`

## Summary

The idempotent dummy data seeding pattern ensures:
- Safe automatic database population
- No duplicate data on restarts
- Fast startup when data exists
- Realistic temporal patterns for analytics
- Easy maintenance and testing
