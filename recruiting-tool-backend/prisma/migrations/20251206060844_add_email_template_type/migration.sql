-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_REJECTED', 'APPLICATION_SHORTLISTED', 'INTERVIEW_INVITATION', 'INTERVIEW_REMINDER', 'OFFER_LETTER', 'CUSTOM');

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "type" "EmailTemplateType";

-- CreateIndex
CREATE INDEX "EmailTemplate_type_idx" ON "EmailTemplate"("type");
