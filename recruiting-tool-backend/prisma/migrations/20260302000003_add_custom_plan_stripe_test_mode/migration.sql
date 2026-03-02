-- Track whether each custom plan was synced using a Stripe test key or live key
ALTER TABLE "CustomPlan" ADD COLUMN "stripeIsTestMode" BOOLEAN;
