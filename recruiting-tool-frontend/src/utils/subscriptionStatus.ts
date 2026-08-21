import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../types/subscription.types";

/**
 * Plans that are considered paid (i.e. money changed hands).
 * Mirrors `PAID_SUBSCRIPTION_PLANS` in the backend
 * (src/utils/subscription-status.helper.ts).
 */
export const PAID_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  SubscriptionPlan.PROFESSIONAL,
  SubscriptionPlan.ENTERPRISE,
];

/**
 * Returns true when the company is currently entitled to paid-plan perks.
 *
 * This is the frontend mirror of the backend's `hasActivePaidSubscription`
 * helper, which decides whether a newly created job posting is auto-approved
 * or lands in the moderation queue. Keeping the rules identical means the
 * upgrade prompt is only shown to companies that would actually benefit.
 *
 * @param subscription The company's subscription, or undefined while loading /
 *                     when the company has never subscribed.
 */
export function hasActivePaidSubscription(
  subscription: Subscription | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!subscription) {
    return false;
  }

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
      return (
        !!subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd) > now
      );

    // Payment failed: perk survives only while the grace period is running.
    case SubscriptionStatus.PAST_DUE:
      return (
        !!subscription.gracePeriodEndsAt &&
        new Date(subscription.gracePeriodEndsAt) > now
      );

    case SubscriptionStatus.UNPAID:
    case SubscriptionStatus.EXPIRED:
    default:
      return false;
  }
}
