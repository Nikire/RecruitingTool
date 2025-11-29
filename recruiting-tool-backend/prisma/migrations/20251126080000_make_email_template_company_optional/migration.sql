-- AlterTable: Make companyId optional in EmailTemplate
ALTER TABLE "EmailTemplate" ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateIndex: Add index on isDefault for better query performance
CREATE INDEX "EmailTemplate_isDefault_idx" ON "EmailTemplate"("isDefault");
