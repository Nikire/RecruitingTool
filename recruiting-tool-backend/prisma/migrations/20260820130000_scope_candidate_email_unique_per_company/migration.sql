-- =============================================================================
-- Scope Candidate.email uniqueness to the owning tenant (company).
--
-- WHY
-- ---
-- `Candidate.email` was GLOBALLY unique (index "Candidate_email_key"), plus a
-- global case-insensitive expression index ("Candidate_email_unique_ci" on
-- LOWER(email), added by 20251126070000_add_business_constraints).
--
-- Borderless is multi-tenant. In the LATAM nearshore staffing market the same
-- engineer sitting in five different agencies' databases is the NORMAL case.
-- Under global uniqueness, once agency A stored maria@example.com, agency B's
-- insert failed with P2002 — and any lookup by email could return another
-- tenant's row. This replaces both global indexes with per-company ones,
-- matching the convention already used by "User" (@@unique([email, companyId])).
--
-- SAFETY OF THE BACKFILL
-- ----------------------
-- A composite unique index cannot be created if duplicate (email, companyId)
-- pairs already exist. They CANNOT exist in any database that reached this
-- migration, because email was globally unique up to this point: a stricter
-- constraint (unique on email alone) logically implies the weaker one (unique
-- on email + companyId). So this migration is a no-op backfill on real data.
--
-- That reasoning holds only for data that actually went through the old
-- constraint. If this ever runs against a database where the old index was
-- dropped manually, restored from a merged dump, or seeded around the
-- constraint, we want a LOUD failure and a rolled-back migration rather than a
-- silently skipped index that would leave the tenancy invariant unenforced.
-- The guards below raise an exception; earlier migrations in this project used
-- `EXCEPTION WHEN unique_violation THEN RAISE NOTICE ...` to swallow exactly
-- this situation — that pattern is deliberately NOT used here.
-- =============================================================================

-- Guard 1: exact-match duplicates within a tenant.
DO $$
DECLARE
    dupe_count integer;
    sample     text;
BEGIN
    SELECT COUNT(*), MIN(LOWER("email"))
      INTO dupe_count, sample
      FROM (
        SELECT "email", "companyId"
          FROM "Candidate"
         GROUP BY "email", "companyId"
        HAVING COUNT(*) > 1
      ) d;

    IF dupe_count > 0 THEN
        RAISE EXCEPTION
          'Cannot scope Candidate.email per company: % duplicate (email, companyId) pair(s) already exist (e.g. %). Merge or soft-delete the duplicate Candidate rows, then re-run this migration.',
          dupe_count, sample;
    END IF;
END $$;

-- Guard 2: case-insensitive duplicates within a tenant. The replacement CI
-- index below is stricter than the plain composite index, so it needs its own
-- pre-check or it would be the statement that fails, with a less useful message.
DO $$
DECLARE
    dupe_count integer;
    sample     text;
BEGIN
    SELECT COUNT(*), MIN(e)
      INTO dupe_count, sample
      FROM (
        SELECT LOWER("email") AS e, "companyId"
          FROM "Candidate"
         GROUP BY LOWER("email"), "companyId"
        HAVING COUNT(*) > 1
      ) d;

    IF dupe_count > 0 THEN
        RAISE EXCEPTION
          'Cannot scope Candidate.email per company: % case-insensitive duplicate (LOWER(email), companyId) pair(s) already exist (e.g. %). Merge or soft-delete the duplicate Candidate rows, then re-run this migration.',
          dupe_count, sample;
    END IF;
END $$;

-- DropIndex: the global Prisma @unique on Candidate.email.
DROP INDEX IF EXISTS "Candidate_email_key";

-- DropIndex: the global case-insensitive expression index.
DROP INDEX IF EXISTS "Candidate_email_unique_ci";

-- CreateIndex: per-tenant uniqueness (this is the index Prisma's
-- @@unique([email, companyId]) maps to — the name must stay exactly this).
-- No IF NOT EXISTS and no EXCEPTION handler: if this cannot be created, the
-- migration must fail and roll back.
CREATE UNIQUE INDEX "Candidate_email_companyId_key" ON "Candidate"("email", "companyId");

-- CreateIndex: per-tenant case-insensitive uniqueness, replacing the global one.
CREATE UNIQUE INDEX "Candidate_email_companyId_unique_ci" ON "Candidate" (LOWER("email"), "companyId");

-- NOTE ON NULL companyId
-- ----------------------
-- "Candidate"."companyId" is nullable, and PostgreSQL treats NULLs as distinct
-- in unique indexes, so unclaimed candidates (companyId IS NULL) are NOT
-- deduped by these indexes. This matches the existing behaviour of
-- "User"."companyId" exactly. Application code must therefore always set
-- companyId when creating a Candidate; every write path was updated alongside
-- this migration. Making the column NOT NULL requires backfilling legacy rows
-- and is deliberately left as separate work.
