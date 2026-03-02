-- Add Stripe Payment Link URL columns to CustomPlan
ALTER TABLE "CustomPlan" ADD COLUMN "monthlyPaymentLink" TEXT;
ALTER TABLE "CustomPlan" ADD COLUMN "annualPaymentLink" TEXT;
