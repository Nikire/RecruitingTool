-- AlterTable: Add rating and hiringProcessId to StageNote
ALTER TABLE "StageNote" ADD COLUMN "hiringProcessId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 3;

-- Remove default after adding (we only needed it for the migration of existing rows)
ALTER TABLE "StageNote" ALTER COLUMN "hiringProcessId" DROP DEFAULT;
ALTER TABLE "StageNote" ALTER COLUMN "rating" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "StageNote_hiringProcessId_idx" ON "StageNote"("hiringProcessId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "StageNote_stageId_hiringProcessId_key" ON "StageNote"("stageId", "hiringProcessId");

-- AddForeignKey
ALTER TABLE "StageNote" ADD CONSTRAINT "StageNote_hiringProcessId_fkey" FOREIGN KEY ("hiringProcessId") REFERENCES "HiringProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
