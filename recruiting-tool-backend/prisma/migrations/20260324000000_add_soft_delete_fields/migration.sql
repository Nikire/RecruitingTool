-- Add deletedAt field to HiringProcess for soft deletes
ALTER TABLE "HiringProcess" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add deletedAt field to StageNote for soft deletes
ALTER TABLE "StageNote" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add indexes for soft delete filtering
CREATE INDEX "HiringProcess_deletedAt_idx" ON "HiringProcess"("deletedAt");
CREATE INDEX "StageNote_deletedAt_idx" ON "StageNote"("deletedAt");
