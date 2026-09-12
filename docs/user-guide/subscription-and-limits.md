# Subscription and Limits

Guide to plan limits, quota banners, AI scoring credits, and how to change your Borderless plan.

## Overview

Every Borderless company account is on a subscription plan that governs how many job positions, candidates, users, and storage you can use, as well as access to premium features such as AI scoring and analytics. When you approach a limit, quota banners appear directly on the affected pages so you know before you hit a wall.

Plan changes and checkout happen on **Subscription** (`/profile/subscription`). The **Billing** page (`/hr/billing`) shows your current subscription and invoices only — see [Billing](./billing.md).

## Plans

Limits are enforced from `PLAN_LIMITS` in `recruiting-tool-backend/src/modules/quota/config/plan-limits.config.ts`. A value of `-1` in that file means unlimited.

### Free

The Free plan is a permanent tier, not a trial. One active position, one seat, and a hosted careers page.

| Limit | Value |
|-------|-------|
| Job positions | 1 |
| Candidates per position | 50 |
| Users | 1 |
| Storage | 500 MB |
| AI scoring | Not included (0 credits / month) |
| Analytics | Not included |
| Email templates | Included |

### Professional

| Limit | Value |
|-------|-------|
| Job positions | 15 |
| Candidates per position | 200 |
| Users | Unlimited |
| Storage | 10,000 MB (10 GB) |
| AI scoring credits / month | 200 |
| Analytics | Included |
| Email templates | Included |

### Enterprise

| Limit | Value |
|-------|-------|
| Job positions | Unlimited |
| Candidates per position | Unlimited |
| Users | Unlimited |
| Storage | Unlimited |
| AI scoring credits / month | Unlimited |
| Analytics | Included |
| Email templates | Included |

### Agency (contact sales)

Agency is advertised on the public landing page as a contact-sales tier. It is **not** a plan your account can be switched to inside the product: the database `SubscriptionPlan` enum contains only `FREE`, `PROFESSIONAL` and `ENTERPRISE`, there is no Agency product at the payment provider, and the Subscription page renders only the three cards above.

The Agency limits seeded for the Super Admin **Plan Limits** screen are:

| Limit | Value |
|-------|-------|
| Job positions | 50 |
| Candidates per position | 500 |
| Users | Unlimited |
| Storage | 50,000 MB (50 GB) |
| AI scoring credits / month | 750 |
| Analytics | Included |
| Email templates | Included |

## Feature Availability by Plan

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|------------|
| Job Positions | 1 | 15 | Unlimited |
| Candidates per Position | 50 | 200 | Unlimited |
| Users | 1 | Unlimited | Unlimited |
| Storage | 500 MB | 10,000 MB | Unlimited |
| AI Scoring | ❌ (0 credits) | 200 credits/mo | Unlimited |
| Analytics Dashboard | ❌ | ✅ | ✅ |
| Email Templates | ✅ | ✅ | ✅ |

## Pricing

| Plan | Monthly | Annual (charged up front) |
|------|---------|---------------------------|
| Free | $0 | $0 |
| Professional | $79 | $799 |
| Enterprise | $249 | $2,499 |

The Subscription page defaults to the **annual** billing toggle. Prices are transcribed from the live payment-provider products into `recruiting-tool-frontend/src/config/pricing.ts`.

## Quota Banners

Quota banners appear at the top of relevant pages to show your current usage relative to your plan's limit. The progress bar changes color as you approach the ceiling:

- **Green** — below 70% used
- **Yellow** — between 70% and 90% used
- **Red** — 90% or more used, or limit exceeded

When a limit is unlimited, the banner shows your current usage with the bar at zero and no limit figure.

### Where Quota Banners Appear

| Page | Route | Resource tracked |
|------|-------|-----------------|
| Job Positions | `/hr/job-positions` | Active job positions vs. plan limit |
| Hiring Processes | `/hr/hiring-processes` | AI scoring credits used this month |
| Team | `/settings/team` | Active users vs. plan limit |
| Files | `/hr/files` | Storage used (MB) vs. plan limit |

## AI Scoring Credits

AI scoring credits are consumed each time you run or re-run an AI resume analysis on a candidate–position pair. The counter resets at midnight on the first day of the following month.

**Where AI scoring runs:** From the Hiring Processes grouped list (`/hr/hiring-processes`), click the sparkle icon next to a candidate to score their resume against the job position requirements. You can also re-score by clicking the refresh icon on an existing score chip.

### Who can trigger AI scoring

The backend is authoritative. `POST /api/ai/score-candidate` is declared `@Auth([HR, ADMIN, SUPER_ADMIN])`, and the backend role guard reads that as **"HR and every role above HR"** — so HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN are all accepted. RECRUITER and USER are refused with 403.

The front end shows the sparkle icon to a narrower list, so two roles the API would accept never get the button:

| Role | Sees the sparkle icon | Backend accepts the request |
|------|:---------------------:|:---------------------------:|
| HR | ❌ | ✅ |
| HR_MANAGER | ✅ | ✅ |
| RECRUITER | ❌ | ❌ (403) |
| COMPANY_OWNER | ✅ | ✅ |
| COMPANY_ADMIN | ❌ | ✅ |
| ADMIN | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ |

A plain HR user or a COMPANY_ADMIN is allowed to score by the API but sees no icon in the Hiring Processes list. See [Roles and Permissions](./roles-and-permissions.md) for how the ladder works.

### Rate limits

Credits are not the only ceiling. The AI endpoints are throttled per hour, and you will usually hit the throttle long before a monthly credit balance runs out.

| Endpoint | Limit |
|----------|-------|
| `POST /api/ai/score-candidate` | 10 requests / hour |
| `POST /api/ai/parse-resume` | 10 requests / hour |
| `POST /api/ai/compare-candidates` | 5 requests / hour |
| `POST /api/ai/batch-score` | 5 batch jobs / hour |

Exceeding the throttle returns HTTP 429. Exhausting your monthly credits returns HTTP 400 with "AI scoring quota exceeded for this month".

## Storage Limits

Storage is measured in megabytes and counts all files associated with your company: resumes, cover letters, portfolio documents, async stage submissions, and any other uploads attached to candidate profiles or submitted through the public careers page.

Deleting files from the File Manager frees up storage immediately.

## User Seats

The user quota counts **active users plus pending invitations**. If inviting one more person would exceed your plan's seat limit, the invitation is rejected with HTTP 402 and the message "User limit reached for your plan". On the Free plan, which allows a single user, you cannot invite anyone until you upgrade.

## How to Upgrade

1. Open the profile menu and go to **Subscription** (`/profile/subscription`).
2. Choose **Monthly** or **Annual** on the billing toggle. Annual is selected by default.
3. On the plan card you want, click the upgrade button and confirm in the dialog.
4. You are redirected to the payment provider's hosted checkout.

After a successful checkout you return to `/profile/subscription?success=true` and the subscription and quota data are refetched. Limits update as soon as the provider's webhook is processed, so a banner can lag by a few seconds.

There is **no plan picker on `/hr/billing`** — that page only displays your current subscription, invoices, and a portal button.

## Cancelling

On `/profile/subscription`, **Cancel Subscription** appears only when your plan is paid, the status is `ACTIVE`, and it is not already scheduled to cancel. Cancelling ends the subscription at the end of the current billing period; the page then shows a warning that it will cancel.

## Note for Operators

Two files hold plan limits:

| File | Used for |
|------|----------|
| `src/modules/quota/config/plan-limits.config.ts` | Runtime enforcement and `GET /api/quota/plan-limits`. **This file wins.** |
| `src/modules/plan-limits/plan-limits.service.ts` (`DEFAULT_PLAN_LIMITS`) | Seeds the `PlanLimit` table behind the Super Admin **Plan Limits** screen |

Seeding only creates tiers that are missing. Changing a default value in `DEFAULT_PLAN_LIMITS` does **not** update a `PlanLimit` row that already exists, and does not change enforcement.

## Next Steps

- [Billing](./billing.md) - Invoices, subscription status and the payment portal
- [Roles and Permissions](./roles-and-permissions.md) - Which role can do what
- [File Manager](./file-manager.md) - Monitor and manage your storage usage
- [Job Positions](./job-positions.md) - Understand the job position quota
- [Team Management](./team-management.md) - Understand the user seat quota
- [Analytics](./analytics.md) - Available on Professional and Enterprise plans
