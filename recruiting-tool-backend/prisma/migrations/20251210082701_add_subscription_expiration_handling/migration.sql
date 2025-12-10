-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "gracePeriodEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Subscription_gracePeriodEndsAt_idx" ON "Subscription"("gracePeriodEndsAt");

-- CreateIndex
CREATE INDEX "Subscription_subscriptionEndsAt_idx" ON "Subscription"("subscriptionEndsAt");
