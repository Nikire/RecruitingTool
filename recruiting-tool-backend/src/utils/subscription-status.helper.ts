import { Subscription, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

/**
 * Helpers for answering "does this company have an active PAID subscription?"
 *
 * The rules below deliberately mirror the behaviour that already exists in the
 * codebase so there is a single notion of "active":
 *  - TRIALING / ACTIVE / CANCELED-until-period-end / PAST_DUE-within-grace count
 *    as usable; EXPIRED (or PAST_DUE past its grace period) does not. These rules
 *    were inherited from the former `SubscriptionGuard`, which lived in the
 *    Stripe module and was deleted along with it during the Dodo Payments
 *    migration. The guard was only ever registered as a provider and never
 *    applied to a route with `@UseGuards`, so no enforcement was lost — but that
 *    also makes THIS module the only remaining definition of "active", so change
 *    it deliberately.
 *  - `QuotaService` treats a missing Subscription row as the FREE plan.
 *
 * On top of that we require the plan to be a PAID plan (not FREE), because the
 * FREE tier is exactly the tier the moderation queue exists to police.
 */

/** Plans that are considered paid (i.e. money changed hands). */
export const PAID_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [SubscriptionPlan.PROFESSIONAL, SubscriptionPlan.ENTERPRISE];

/**
 * Minimal shape needed to evaluate a subscription. Accepts the full Prisma
 * `Subscription` model or any object carrying the same fields.
 */
export type SubscriptionLike = Pick<Subscription, 'status' | 'plan' | 'currentPeriodEnd' | 'gracePeriodEndsAt'>;

/**
 * Returns true when the company is currently entitled to paid-plan benefits.
 *
 * @param subscription The company's Subscription row, or null/undefined when the
 *                     company has never subscribed (implicit FREE plan).
 * @param now          Injectable clock, defaults to the current time.
 */
export function hasActivePaidSubscription(subscription: SubscriptionLike | null | undefined, now: Date = new Date()): boolean {
  if (!subscription) {
    return false;
  }

  // FREE plan is never a "paid" subscription, whatever the status says.
  if (!PAID_SUBSCRIPTION_PLANS.includes(subscription.plan)) {
    return false;
  }

  switch (subscription.status) {
    case SubscriptionStatus.ACTIVE:
      return true;

    // A paid plan in trial has gone through checkout, so it keeps the perk.
    case SubscriptionStatus.TRIALING:
      return true;

    // Cancelled but paid until the end of the current period.
    case SubscriptionStatus.CANCELED:
      return !!subscription.currentPeriodEnd && subscription.currentPeriodEnd > now;

    // Payment failed: keep the perk only while the grace period is still running.
    case SubscriptionStatus.PAST_DUE:
      return !!subscription.gracePeriodEndsAt && subscription.gracePeriodEndsAt > now;

    case SubscriptionStatus.UNPAID:
    case SubscriptionStatus.EXPIRED:
    default:
      return false;
  }
}
