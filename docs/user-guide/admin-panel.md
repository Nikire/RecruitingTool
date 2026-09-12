# Admin Panel

Map of the platform-level Admin Panel: which screens exist, which of them need SUPER_ADMIN, and where the full per-screen guide lives.

## Overview

The Admin Panel at `/admin` is the platform control center. It is **not** part of the HR panel: it manages every company on the installation, not just yours. HR users, including a Company Owner, cannot reach it.

**Access:** the `/admin/**` route group is guarded to **ADMIN and SUPER_ADMIN**. Anyone holding either role also lands on `/admin` by default after signing in.

## Which Document Is Authoritative

The canonical per-screen guide is the in-app document at **`recruiting-tool-frontend/src/docs/admin-panel.md`**, rendered inside the product at `/admin/docs` (Configuration → **Documentation**, SUPER_ADMIN only) in English and Spanish.

**Edit that file, not this one.** This page is a repo-facing index: it lists the screens the router and sidebar actually declare, and points at the canonical copy for the description of each. If the two disagree about what a screen does, the in-app copy wins; if they disagree about which screens exist, the router wins.

## Screens

Grouped as the Admin sidebar groups them. "SUPER_ADMIN" in the last column means the sidebar hides the item from a plain ADMIN.

### Top level

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Dashboard | `/admin` | ❌ |

### Outreach

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Prospect CRM | `/admin/outreach-crm` | ❌ |
| Outreach Templates | `/admin/outreach-templates` | ❌ |
| Outreach Campaigns | `/admin/outreach-campaigns` | ❌ |

### Management

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Companies | `/admin/companies` | ✅ |
| Users | `/admin/users` | ✅ |
| Subscriptions | `/admin/subscriptions` | ❌ |
| Deleted Records | `/admin/deleted-records` | ❌ |
| Contact Messages | `/admin/contact-messages` | ❌ |
| Email Logs | `/admin/email-logs` | ✅ |

### Business Intelligence

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Revenue Dashboard | `/admin/revenue` | ❌ |
| Quota Inspector | `/admin/quota-inspector` | ❌ |
| Company Health | `/admin/health` | ❌ |
| Trial Tracker | `/admin/trials` | ❌ |
| Pipeline Analytics | `/admin/pipeline-analytics` | ❌ |

### Operations

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Job Moderation | `/admin/job-moderation` | ✅ |
| Demo Bookings | `/admin/demos` | ❌ |
| Email Health | `/admin/email-deliverability` | ❌ |
| Changelog | `/admin/changelog` | ❌ |
| Task Tracker | `/admin/tasks` | ❌ |

### Configuration

| Screen | Route | SUPER_ADMIN only |
|--------|-------|:----------------:|
| Plan Limits | `/admin/plan-limits` | ✅ |
| Feature Flags | `/admin/feature-flags` | ✅ |
| General Settings | `/admin/general-settings` | ✅ |
| Webhooks & API Keys | `/admin/webhooks` | ✅ |
| Custom Plans | `/admin/custom-plans` | ✅ |
| AI Quota | `/admin/ai-quota` | ✅ |
| Settings | `/admin/settings` | ✅ |
| Documentation | `/admin/docs` | ✅ |

### Routes with no sidebar entry

These are registered in the router but reachable only by URL or by drilling in from another screen:

| Screen | Route | Reached from |
|--------|-------|--------------|
| Company detail | `/admin/companies/:uid` | A row on Companies |
| Prospect detail | `/admin/outreach-crm/:uid` | A row on Prospect CRM |
| Outreach Analytics | `/admin/outreach-analytics` | Nowhere — URL only |

Note that the SUPER_ADMIN markings above are **sidebar visibility only**. The route guard itself admits both ADMIN and SUPER_ADMIN for every `/admin` route, so an ADMIN who types a SUPER_ADMIN URL is not stopped at the router; whether the screen works depends on the endpoints it calls.

## Dangerous Actions

These are the screens where a mistake is not recoverable from the UI, listed so that they are visible before you open them. Read the canonical guide before using any of them.

| Screen | Why it needs care |
|--------|-------------------|
| Plan Limits | Editing a tier changes the limits shown on the Super Admin screen for every company on that tier. Note that runtime enforcement reads a config file, not this table — see [Subscription and Limits](./subscription-and-limits.md). |
| Feature Flags | Takes effect immediately, globally or per company, with no restart. |
| Custom Plans | Overrides standard plan limits for a named company. |
| AI Quota | Setting a company's monthly limit to `-1` makes their AI usage unlimited and uncapped. |
| Deleted Records | Offers permanent deletion of soft-deleted entities, which cannot be undone. |
| Users | Deactivation and reactivation across every company on the platform. |
| Job Moderation | Approving or rejecting a position changes what is publicly visible. |
| Webhooks | Changing a destination URL redirects live event traffic. |

## Not the Same as Team Management

Managing the people in **your own** company — invitations, role changes, removals, requests to join — happens on `/settings/team` and is available to HR_MANAGER and above. See [Team Management](./team-management.md). The Admin Panel's Users and Companies screens operate across the whole platform and are a different thing entirely.

## Next Steps

- [Team Management](./team-management.md) - Managing your own company's members
- [Roles and Permissions](./roles-and-permissions.md) - How ADMIN and SUPER_ADMIN differ
- [Subscription and Limits](./subscription-and-limits.md) - What Plan Limits and AI Quota control
