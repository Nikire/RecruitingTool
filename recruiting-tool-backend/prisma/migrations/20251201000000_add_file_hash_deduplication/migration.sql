-- AlterTable
ALTER TABLE "FileUpload" ADD COLUMN "hash" TEXT;

-- CreateIndex
CREATE INDEX "FileUpload_hash_idx" ON "FileUpload"("hash");
