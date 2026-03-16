-- Migration: add_interview_organizer
-- Adds organizerId (optional FK to User) to Interview for calendar color-coding and filtering by HR member.

ALTER TABLE "Interview" ADD COLUMN IF NOT EXISTS "organizerId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Interview_organizerId_fkey'
  ) THEN
    ALTER TABLE "Interview"
      ADD CONSTRAINT "Interview_organizerId_fkey"
      FOREIGN KEY ("organizerId")
      REFERENCES "User"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Interview_organizerId_idx" ON "Interview"("organizerId");
