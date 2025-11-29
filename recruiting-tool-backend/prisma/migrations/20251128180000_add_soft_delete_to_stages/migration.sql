-- AlterTable
ALTER TABLE "Stage" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Stage_deletedAt_idx" ON "Stage"("deletedAt");
