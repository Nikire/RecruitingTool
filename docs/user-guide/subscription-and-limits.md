# Subscription and Limits

Guide to plan limits, quota banners, and upgrading your Borderless subscription.

## Overview

Every Borderless company account is on a subscription plan that governs how many job positions, candidates, users, and storage you can use, as well as access to premium features such as AI scoring and analytics. When you approach a limit, quota banners appear directly on the affected pages so you know before you hit a wall.

## Plans

### Free

The Free plan is designed for small teams getting started with structured hiring.

| Limit | Value |
|-------|-------|
| Job positions | 3 |
| Candidates per position | 50 |
| Users | 3 |
| Storage | 500 MB |
| AI scoring credits / month | 20 |
| Analytics | Not included |
| Email templates | Included |

### Professional

The Professional plan suits growing teams running multiple active searches.

| Limit | Value |
|-------|-------|
| Job positions | 15 |
| Candidates per position | 200 |
| Users | 10 |
| Storage | 10,000 MB (10 GB) |
| AI scoring credits / month | 200 |
| Analytics | Included |
| Email templates | Included |

### Enterprise

The Enterprise plan removes all limits and unlocks every feature.

| Limit | Value |
|-------|-------|
| Job positions | Unlimited |
| Candidates per position | Unlimited |
| Users | Unlimited |
| Storage | Unlimited |
| AI scoring credits / month | Unlimited |
| Analytics | Included |
| Email templates | Included |

Enterprise customers can also request a **Custom Plan** with pricing and limits tailored to their organization.

## Quota Banners

Quota banners appear at the top of relevant pages to show your current usage relative to your plan's limit. The progress bar changes color as you approach the ceiling:

- **Green** — below 70% used
- **Yellow** — between 70% and 90% used
- **Red** — above 90% used or limit exceeded

When a plan is Enterprise (unlimited), the banner shows your current usage without a progress bar.

### Where Quota Banners Appear

| Page | Resource tracked |
|------|-----------------|
| Job Positions (`/hr/job-positions`) | Number of active job positions vs. plan limit |
| Hiring Processes (`/hr/hiring-processes`) | AI scoring credits used this month |
| Team (`/hr/team`) | Number of active users vs. plan limit |
| Files (`/hr/files`) | Storage used (MB) vs. plan limit |

## AI Scoring Credits

AI scoring credits are consumed each time you run or re-run an AI resume analysis on a candidate-position pair. The credit counter resets at the start of each calendar month.

**Who can trigger AI scoring:** HR Manager, Company Owner, Admin, and Super Admin roles.

**Where AI scoring runs:** From the Hiring Processes grouped list, click the sparkle icon next to a candidate to score their resume against the job position requirements. You can also re-score by clicking the refresh icon on an existing score chip.

If you run out of credits before the month resets, you must upgrade to a higher plan or wait for the monthly credit refresh.

## Storage Limits

Storage is measured in megabytes and counts all files associated with your company: resumes, cover letters, portfolio documents, and any other uploads attached to candidate profiles or submitted through the public careers page.

Deleting files from the File Manager frees up storage immediately.

## How to Upgrade

1. Navigate to **Billing** at `/hr/billing`.
2. Review the available plans.
3. Select the plan that meets your needs and follow the checkout flow.

After upgrading, limits update immediately and all quota banners reflect the new values.

## Feature Availability by Plan

| Feature | Free | Professional | Enterprise |
|---------|------|--------------|------------|
| Job Positions | Up to 3 | Up to 15 | Unlimited |
| Candidates per Position | Up to 50 | Up to 200 | Unlimited |
| Users | Up to 3 | Up to 10 | Unlimited |
| Storage | 500 MB | 10,000 MB | Unlimited |
| AI Scoring | 20 credits/mo | 200 credits/mo | Unlimited |
| Analytics Dashboard | ❌ | ✅ | ✅ |
| Email Templates | ✅ | ✅ | ✅ |
| Custom Plan | ❌ | ❌ | ✅ |

## Next Steps

- [File Manager](./file-manager.md) - Monitor and manage your storage usage
- [Job Positions](./job-positions.md) - Understand the job position quota
- [Team Management](./team-management.md) - Understand the user seat quota
- [Analytics](./analytics.md) - Available on Professional and Enterprise plans
