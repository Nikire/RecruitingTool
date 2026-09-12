# HR Dashboard

Guide to the HR Dashboard, the page every HR user lands on after signing in.

## Overview

The HR Dashboard gives you a one-screen read on your hiring activity: four counters across the top, the five most recent applications underneath, and a row of shortcuts to the work you do most often. Every counter is a live count, not a cached figure, and most of them are clickable.

**Navigate to the Dashboard:** Sidebar → **HR Dashboard**, or go directly to `/hr/dashboard`. Signing in as an HR user or a Company Owner takes you here automatically.

If your role is not HR, COMPANY_OWNER, ADMIN or SUPER_ADMIN, the page redirects you to the login screen rather than rendering.

## Statistic Cards

Four cards sit across the top of the page.

| Card | Value | Subtitle | Click target |
|------|-------|----------|--------------|
| Applications | Total applications your company has received | *{n} pending review* | `/hr/applications` |
| Candidates | Total candidates in your database | *Active in hiring processes* | `/hr/candidates` |
| Job Positions | Total job positions, all statuses | *{n} currently open* | `/hr/job-positions` |
| Pending Review | Applications with status PENDING | *Applications need attention* | Not clickable |

Two details are worth knowing before you use these numbers in a report:

- **Candidates** counts every candidate on record, not only those currently in a hiring process, despite the subtitle.
- **Job Positions** counts every position including CLOSED and CANCELLED ones; the open count is in the subtitle.

While the underlying data loads, the cards render as skeleton placeholders. If any of the three queries fails, an error banner with a **Retry** button appears above the cards and only the failed queries are refetched — the cards do not silently fall back to zero.

## Recent Applications

Below the cards, a panel lists the **five most recent applications** your company has received. Each row opens the same application detail dialog you get from the Applications page, so you can download the resume, record a status and use **Accept & Create** without leaving the dashboard. See [Applications](./applications.md#reviewing-an-application).

**View All** in the panel header takes you to `/hr/applications`.

The panel has three other states:

- **Loading** — five skeleton rows.
- **Unavailable** — *"Recent applications could not be loaded."* when the applications query failed.
- **Empty** — *"No applications yet"*, with the hint that applications appear once candidates apply to your job positions.

## Quick Actions

A **Quick Actions** row sits at the bottom of the page with four shortcuts:

| Action | What it does |
|--------|--------------|
| Add Candidate Manually | Opens the manual candidate dialog right here on the dashboard |
| Manage Job Positions | Goes to `/hr/job-positions` |
| Review Applications | Goes to `/hr/applications` |
| View Candidates | Goes to `/hr/candidates` |

**Add Candidate Manually** is the one that does work in place — it is the same dialog as **Create Candidate → Add Manually** on the Candidates page, meant for phone calls, referrals and walk-ins. See [Candidates](./candidates.md#creating-candidates).

The **Create Job Position** button in the page header navigates to the Job Positions page; it does not open the create dialog directly.

## What's New

The HR panel shows a **What's New** modal when a release note has been published that your account has not seen yet. It lists each new item with a chip marking the plan tier it applies to (all tiers, Professional and up, or Enterprise only). Closing the dialog marks those notes as seen, and the check runs only once per browsing session, so it will not reappear as you move between pages.

## Related

- [Applications](./applications.md) - The full inbox behind the Recent Applications panel
- [Candidates](./candidates.md) - Candidate profiles and manual creation
- [Job Positions](./job-positions.md) - Creating and publishing postings
- [Analytics](./analytics.md) - Deeper metrics than the dashboard counters
