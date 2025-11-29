# Database Business Constraints

This document describes all business rule constraints implemented at the database level for data integrity enforcement.

## Overview

Business constraints ensure data integrity by enforcing rules directly in the database, preventing invalid data from being stored regardless of application logic bugs or bypass attempts.

## Implemented Constraints

### 1. Case-Insensitive Email Uniqueness

**Purpose**: Prevent duplicate accounts with different email case variations (e.g., `user@test.com` vs `USER@test.com`)

**Tables**: `User`, `Candidate`, `Application`

**Implementation**:
```sql
-- User table
CREATE UNIQUE INDEX "User_email_unique_ci" ON "User" (LOWER(email));

-- Candidate table
CREATE UNIQUE INDEX "Candidate_email_unique_ci" ON "Candidate" (LOWER(email));

-- Application table (composite with jobPositionId)
CREATE UNIQUE INDEX "Application_jobPosition_email_unique_ci" ON "Application" ("jobPositionId", LOWER("applicantEmail"));
```

**Error Handling**:
- User: "A user with this email address already exists (case-insensitive)."
- Candidate: "A candidate with this email address already exists (case-insensitive)."
- Application: "This email has already been used to apply for this job position."

### 2. Check Constraints

#### Stage Positions
**Constraint**: `Stage_position_check`
```sql
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_position_check" CHECK (position >= 0);
```
- Position must be non-negative
- Error: "Stage position must be a non-negative number."

#### File Upload Size
**Constraint**: `FileUpload_size_check`
```sql
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_size_check" CHECK (size > 0);
```
- File size must be positive (greater than 0 bytes)
- Error: "File size must be greater than 0."

#### Interview Duration
**Constraint**: `Interview_duration_check`
```sql
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_duration_check" CHECK (duration IS NULL OR duration > 0);
```
- Duration must be positive when set
- Allows NULL for unscheduled interviews
- Error: "Interview duration must be a positive number."

#### Interview Reschedule Count
**Constraint**: `Interview_rescheduledCount_check`
```sql
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_rescheduledCount_check" CHECK ("rescheduledCount" >= 0);
```
- Reschedule count cannot be negative
- Error: "Rescheduled count must be a non-negative number."

#### StageTimeLog Duration
**Constraint**: `StageTimeLog_duration_check`
```sql
ALTER TABLE "StageTimeLog" ADD CONSTRAINT "StageTimeLog_duration_check" CHECK (duration IS NULL OR duration >= 0);
```
- Duration must be non-negative when calculated
- Allows NULL for active/ongoing stages
- Error: "Stage duration must be a non-negative number."

#### HRSchedule Day of Week
**Constraint**: `HRSchedule_dayOfWeek_check`
```sql
ALTER TABLE "HRSchedule" ADD CONSTRAINT "HRSchedule_dayOfWeek_check" CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6);
```
- Day must be 0 (Sunday) through 6 (Saturday)
- Error: "Day of week must be between 0 (Sunday) and 6 (Saturday)."

#### AIQuota Limits
**Constraints**: `AIQuota_limit_check`, `AIQuota_used_check`
```sql
ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_limit_check" CHECK ("limit" > 0);
ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_used_check" CHECK (used >= 0);
```
- Limit must be positive
- Used count cannot be negative
- Errors:
  - "Quota limit must be a positive number."
  - "Quota used must be a non-negative number."

#### Scorecard Scores
**Constraint**: `Scorecard_overallScore_check`
```sql
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_overallScore_check" CHECK ("overallScore" IS NULL OR ("overallScore" >= 0 AND "overallScore" <= 100));
```
- Overall score must be between 0 and 100 when set
- Allows NULL for incomplete evaluations
- Error: "Overall score must be between 0 and 100."

#### ScorecardCriterion Max Score
**Constraint**: `ScorecardCriterion_maxScore_check`
```sql
ALTER TABLE "ScorecardCriterion" ADD CONSTRAINT "ScorecardCriterion_maxScore_check" CHECK ("maxScore" > 0);
```
- Maximum score must be positive
- Error: "Maximum score must be a positive number."

#### ScorecardScore Score
**Constraint**: `ScorecardScore_score_check`
```sql
ALTER TABLE "ScorecardScore" ADD CONSTRAINT "ScorecardScore_score_check" CHECK (score >= 0);
```
- Score cannot be negative
- Error: "Score must be a non-negative number."

#### ScorecardCategory Weight
**Constraint**: `ScorecardCategory_weight_check`
```sql
ALTER TABLE "ScorecardCategory" ADD CONSTRAINT "ScorecardCategory_weight_check" CHECK (weight > 0);
```
- Weight must be positive
- Error: "Category weight must be a positive number."

#### CandidateScore Scores
**Constraints**: Multiple score checks
```sql
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_overallScore_check" CHECK ("overallScore" >= 0 AND "overallScore" <= 100);
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_skillsScore_check" CHECK ("skillsScore" >= 0 AND "skillsScore" <= 100);
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_experienceScore_check" CHECK ("experienceScore" >= 0 AND "experienceScore" <= 100);
ALTER TABLE "CandidateScore" ADD CONSTRAINT "CandidateScore_educationScore_check" CHECK ("educationScore" >= 0 AND "educationScore" <= 100);
```
- All scores must be between 0 and 100
- Error: "Candidate scores must be between 0 and 100."

#### BatchScoringJob Counts
**Constraints**: Multiple count checks
```sql
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_totalCandidates_check" CHECK ("totalCandidates" >= 0);
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_processedCount_check" CHECK ("processedCount" >= 0);
ALTER TABLE "BatchScoringJob" ADD CONSTRAINT "BatchScoringJob_failedCount_check" CHECK ("failedCount" >= 0);
```
- All counts must be non-negative
- Error: "Batch scoring job counts must be non-negative numbers."

### 3. Existing Unique Constraints (from Schema)

These unique constraints are defined in the Prisma schema and enforced by the database:

- **Stage**: `@@unique([hiringProcessId, position])` - Prevents duplicate stage positions in a hiring process
- **InterviewInterviewer**: `@@unique([interviewId, userId])` - Prevents duplicate interviewer assignments
- **ScorecardScore**: `@@unique([scorecardId, criterionId])` - One score per criterion per scorecard
- **CandidateScore**: `@@unique([candidateId, jobPositionId])` - One score per candidate per job
- **AIQuota**: `@@unique([companyId, quotaType])` - One quota per type per company

### 4. Foreign Key Cascade Behaviors

All foreign key relationships have defined cascade behaviors:

- **CASCADE**: Child records deleted when parent deleted
  - Application → JobPosition
  - Stage → HiringProcess, JobPosition
  - Interview → Stage
  - FileUpload → Candidate
  - All child entities cascade from parents

- **RESTRICT**: Prevents parent deletion if children exist
  - HiringProcess → Candidate
  - HiringProcess → Company
  - JobPosition → Company, User (creator)

- **SET NULL**: Sets FK to null when parent deleted
  - Application → FileUpload (resume)
  - Application → User (reviewer)

## Error Handling

The `PrismaExceptionFilter` (`src/common/filters/prisma-exception.filter.ts`) catches all Prisma constraint violations and returns user-friendly error messages.

### Prisma Error Codes

- **P2002**: Unique constraint violation
- **P2003**: Foreign key constraint violation
- **P2004**: Check constraint violation
- **P2014**: Dependent records exist (restrict delete)
- **P2011**: Null constraint violation
- **P2016/P2025**: Record not found
- **P2018**: Related record not found

### Example Error Response

```json
{
  "success": false,
  "statusCode": 409,
  "message": "A user with this email address already exists (case-insensitive).",
  "error": "UniqueConstraintViolation",
  "timestamp": "2025-11-26T19:00:00.000Z",
  "path": "/api/users"
}
```

## Testing Constraints

### Test Case-Insensitive Emails

```typescript
// Should fail - duplicate email with different case
await prisma.user.create({
  data: {
    name: 'Test User',
    email: 'USER@TEST.COM', // Already exists as 'user@test.com'
    password: 'hashed',
  },
});
// Expected: P2002 - UniqueConstraintViolation
```

### Test Negative Values

```typescript
// Should fail - negative stage position
await prisma.stage.create({
  data: {
    title: 'Test Stage',
    position: -1, // Invalid
    // ... other fields
  },
});
// Expected: P2004 - CheckConstraintViolation
```

### Test Invalid Score Ranges

```typescript
// Should fail - score out of range
await prisma.candidateScore.create({
  data: {
    overallScore: 150, // Invalid (must be 0-100)
    // ... other fields
  },
});
// Expected: P2004 - CheckConstraintViolation
```

## Migration History

- **20251126070000_add_business_constraints**: Initial implementation of all business constraints
  - Case-insensitive email uniqueness
  - Check constraints for valid ranges
  - Verified all foreign key cascade behaviors

## Maintenance

When adding new constraints:

1. Update `schema.prisma` with Prisma-compatible constraints (`@@unique`, `@default`, etc.)
2. Create migration with raw SQL for advanced constraints (case-insensitive, check constraints)
3. Update `PrismaExceptionFilter` with user-friendly error messages
4. Document constraints in this file
5. Add test cases to verify constraint behavior

## Notes

- Check constraints are not natively supported by Prisma, so they must be added via raw SQL
- Case-insensitive constraints use PostgreSQL's `LOWER()` function
- All constraints are idempotent (can be applied multiple times safely)
- Constraints that reference tables created in future migrations use conditional DO blocks
