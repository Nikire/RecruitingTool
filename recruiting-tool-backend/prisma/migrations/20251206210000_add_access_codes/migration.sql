-- AlterTable
ALTER TABLE "HiringProcess" ADD COLUMN     "accessCode" TEXT,
ADD COLUMN     "codeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "accessCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "HiringProcess_accessCode_key" ON "HiringProcess"("accessCode");

-- CreateIndex
CREATE INDEX "HiringProcess_accessCode_idx" ON "HiringProcess"("accessCode");

-- CreateIndex
CREATE INDEX "HiringProcess_codeExpiresAt_idx" ON "HiringProcess"("codeExpiresAt");
