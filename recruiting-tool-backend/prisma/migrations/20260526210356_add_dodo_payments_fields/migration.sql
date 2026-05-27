-- AlterTable: Add Dodo Payments fields to Subscription
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "doCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "doSubscriptionId" TEXT;

-- CreateIndex: Unique constraints for Dodo Payments IDs
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_doCustomerId_key" ON "Subscription"("doCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_doSubscriptionId_key" ON "Subscription"("doSubscriptionId");

-- CreateIndex: Regular indexes for performance
CREATE INDEX IF NOT EXISTS "Subscription_doCustomerId_idx" ON "Subscription"("doCustomerId");
CREATE INDEX IF NOT EXISTS "Subscription_doSubscriptionId_idx" ON "Subscription"("doSubscriptionId");
