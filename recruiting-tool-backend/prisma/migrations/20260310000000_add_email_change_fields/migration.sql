-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailChangeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailChangeToken" TEXT,
ADD COLUMN     "pendingEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_emailChangeToken_key" ON "User"("emailChangeToken");
