# Billing

Guide to the Billing screen: your current subscription status, the payment portal, and your invoice history.

## Overview

The Billing page shows what you are currently subscribed to and every payment Borderless has recorded for your company. It is a read-only record plus one door out to the payment provider's portal. **You cannot change plans here** — plan selection and checkout live on **Subscription** (`/profile/subscription`). See [Subscription and Limits](./subscription-and-limits.md).

**Navigate to Billing:** Sidebar → **Settings** → **Billing**, or go directly to `/hr/billing`.

## Who Can See It

`/hr/billing` is guarded to the **COMPANY_OWNER** role only, and the sidebar item is hidden from every other role. Anyone else who navigates to the URL is turned away by the route guard.

This is stricter than the rest of the HR panel — an ADMIN or SUPER_ADMIN cannot open it either.

## Current Subscription Card

The card at the top of the page appears once your subscription record loads. It shows:

| Element | What it shows |
|---------|---------------|
| **Plan** | Your plan name (Free, Professional, Enterprise) |
| Status chip | Your subscription status, color-coded (see below) |
| **Billing period ends** | The end date of the current period, when one is set |
| **Manage Billing** button | Opens the payment provider's hosted customer portal |

### Status chips

| Status | Chip color | Meaning |
|--------|-----------|---------|
| `ACTIVE` | Green | Paid and current |
| `TRIALING` | Blue | In a trial period |
| `PAST_DUE` | Amber | A payment failed; you are in the grace period |
| `EXPIRED` | Red | The subscription has lapsed |
| `CANCELED` | Red | Cancelled |
| `UNPAID` | Red | Unpaid |

### Alerts

Two alerts can appear inside the card:

- **Grace period expires: *date*** — shown only when the status is `PAST_DUE` and a grace-period end date is set. Update your payment method before that date.
- **Your subscription has expired. Please update your payment method to restore access.** — shown when the status is `EXPIRED`.

## Manage Billing

Click **Manage Billing** to open the payment provider's customer portal in a new context. Use the portal to update your card, change your billing address, and download receipts held by the provider.

If the portal cannot be opened, the page shows "Failed to open billing portal. Please try again." beneath the button and a toast with the same message. Retry; if it persists, the company may not have a provider customer record yet, which happens when you have never completed a paid checkout.

## Invoice History

Below the subscription card is a table of every recorded payment.

| Column | Description |
|--------|-------------|
| Payment Reference | The provider's payment identifier |
| Date | The date the payment record was created |
| Amount | Formatted in the invoice currency using your interface language |
| Status | A color-coded chip (see below) |
| Actions | **View Invoice** — opens the provider's invoice in a new tab; disabled when no invoice URL is available |

A line beneath the table reports the total number of invoices.

### Invoice status chips

| Status | Chip color |
|--------|-----------|
| Paid, Succeeded | Green |
| Open, Draft, Processing | Amber |
| Void, Uncollectible, Failed, Cancelled | Red |
| Anything else | Grey |

### Empty state

If there are no invoices, the table is replaced by a panel reading **No Invoices Available** — "You don't have any invoices yet. Invoices will appear here once you subscribe to a paid plan."

### Load failure

If the invoice request fails, the whole page body is replaced by an error alert: "Failed to load invoices. Please try again later."

## Where to Change Your Plan

| Task | Where |
|------|-------|
| Compare plans, upgrade, start checkout | `/profile/subscription` |
| Cancel a paid subscription | `/profile/subscription` |
| See current status and invoices | `/hr/billing` |
| Update the card on file | **Manage Billing** on either page |

Both pages read the same subscription record, so the plan and status shown are always the same.

## Endpoints Behind the Page

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/billing/subscription` | Current subscription for the company |
| GET | `/api/billing/invoices` | Invoice history |
| POST | `/api/billing/customer-portal` | Create a portal session and redirect |
| POST | `/api/billing/checkout` | Start a checkout (used by the Subscription page) |
| POST | `/api/billing/cancel` | Cancel at period end (used by the Subscription page) |

## Next Steps

- [Subscription and Limits](./subscription-and-limits.md) - Plans, prices, quotas and upgrading
- [Roles and Permissions](./roles-and-permissions.md) - Why only the Company Owner sees this page
- [Company Settings](./company-settings.md) - Company profile and careers page
