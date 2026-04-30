ALTER TABLE "Subscription" ADD COLUMN "lsCustomerId" TEXT UNIQUE;
ALTER TABLE "Subscription" ADD COLUMN "lsSubscriptionId" TEXT UNIQUE;
ALTER TABLE "Subscription" ADD COLUMN "lsCustomerPortalUrl" TEXT;
