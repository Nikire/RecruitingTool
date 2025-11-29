-- AlterTable
ALTER TABLE "FileUpload"
  ADD COLUMN "uploadedByPublic" BOOLEAN NOT NULL DEFAULT false,
  ALTER COLUMN "uploadedById" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "FileUpload_uploadedByPublic_idx" ON "FileUpload"("uploadedByPublic");
