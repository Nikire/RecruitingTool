# Subscription & Billing

**Route:** `/profile/subscription` (all users) · `/hr/billing` (COMPANY_OWNER only)
**Access:** COMPANY_OWNER for billing management; all users for viewing

## Plans

| Plan | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 | Limited users, positions, storage, AI credits |
| **Professional** | $79/month or $799/year | Standard limits, email templates, analytics |
| **Enterprise** | $249/month or $2,499/year | High limits, advanced AI, custom features |

> Annual billing saves approximately 20%.

## Subscription Lifecycle

1. **Trial** — New accounts start with a 14-day free trial (TRIALING status)
2. **Active** — Paid subscription running normally
3. **Past Due** — Payment failed, grace period active
4. **Cancelled** — Subscription cancelled at period end
5. **Expired** — Trial or subscription has ended

## Quota Usage

The Subscription page shows real-time usage for:
- **Users** — Active team members vs. plan limit
- **Job Positions** — Active positions vs. plan limit
- **Candidates per Position** — Per-position candidate limit
- **Storage** — File storage used vs. plan limit
- **AI Scoring Credits** — Credits used this month vs. plan limit

## Upgrading

Only `COMPANY_OWNER` can upgrade the plan. Go to `/hr/billing` → select plan → Stripe Checkout.

After payment, Stripe sends a webhook and the subscription is activated within seconds.

## Cancelling

Cancellations take effect at the **end of the current billing period** — you keep access until then.

## Custom Plans

SUPER_ADMIN can create custom plans with specific limits assigned to individual companies at `/admin/custom-plans`.
