-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('WEBSITE', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'REFERRAL', 'JOB_FAIR', 'UNIVERSITY', 'RECRUITER', 'DIRECT_APPLY', 'SOCIAL_MEDIA', 'OTHER');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "source" "ApplicationSource" DEFAULT 'DIRECT_APPLY',
ADD COLUMN     "sourceDetails" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE INDEX "Candidate_source_idx" ON "Candidate"("source");
