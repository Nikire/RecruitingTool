/**
 * Single source of truth for advertised subscription prices.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * These numbers were previously derived from an `ANNUAL_MONTHS_CHARGED = 10`
 * multiplier duplicated in both LandingPage.tsx and SubscriptionPage.tsx. That
 * produced a clean "ten months for twelve" story ($790 / $2,490) which did not
 * match what Dodo Payments actually charges ($799 / $2,499) — so the site
 * advertised one price and billed another.
 *
 * The prices below are transcribed from the LIVE Dodo products. Verified
 * 2026-08-20 against `GET https://live.dodopayments.com/products/{id}`:
 *
 *   Professional monthly  pdt_0Nfit01VnAKPxEAozm1mo    7900 USD / 1 Month
 *   Professional annual   pdt_0Nfit05R5SEiVp1rYWbrm   79900 USD / 1 Year
 *   Enterprise   monthly  pdt_0Nfit0C4n5T8kfQxOIOBa   24900 USD / 1 Month
 *   Enterprise   annual   pdt_0Nfit0FQXucDgvi84CRmK  249900 USD / 1 Year
 *
 * DODO IS THE SOURCE OF TRUTH. If you change a price, change it in the Dodo
 * dashboard first, then mirror it here — never the other way round. The env
 * vars naming those products live in the backend `.env`
 * (DODO_PAYMENTS_*_PRODUCT_ID) and are resolved by
 * `dodo-payments.service.ts#getProductId`.
 *
 * AGENCY is deliberately absent. It is displayed as a contact-sales card
 * because the Prisma `SubscriptionPlan` enum has no AGENCY member, so no
 * subscription row could record the purchase and no Dodo product exists for it.
 */

export type PricedPlan = "PROFESSIONAL" | "ENTERPRISE";

export interface PlanPrice {
  /** Advertised monthly rate, in whole USD. */
  monthly: number;
  /** Amount actually charged up front for a year, in whole USD. */
  annual: number;
}

export const PLAN_PRICING: Record<PricedPlan, PlanPrice> = {
  PROFESSIONAL: { monthly: 79, annual: 799 },
  ENTERPRISE: { monthly: 249, annual: 2499 },
};

/** Monthly rate shown on the Agency card. Contact-sales only — never charged. */
export const AGENCY_MONTHLY_PRICE = 149;

/**
 * Saving from paying annually, as a whole percent, for one plan.
 * Professional: 1 - 799/948  = 15.7%
 * Enterprise:   1 - 2499/2988 = 16.4%
 */
export function annualDiscountPercent(plan: PricedPlan): number {
  const { monthly, annual } = PLAN_PRICING[plan];
  return Math.round((1 - annual / (monthly * 12)) * 100);
}

/**
 * The single figure advertised on the monthly/annual toggle. Both plans round
 * to the same number today; if they ever diverge this returns the smaller one,
 * so the headline claim is never larger than what any individual plan delivers.
 */
export const ANNUAL_DISCOUNT_PERCENT = Math.min(
  annualDiscountPercent("PROFESSIONAL"),
  annualDiscountPercent("ENTERPRISE"),
);

/** Effective monthly rate when billed annually, rounded for display. */
export function effectiveMonthlyRate(annual: number): number {
  return Math.round(annual / 12);
}
