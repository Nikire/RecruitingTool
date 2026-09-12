# User Guide

Task-oriented guides for people using Borderless day to day: recruiters and HR staff in the HR panel, company owners handling plan and billing, and operators configuring a company.

Start with the guide for the screen you are on. Every page names the route it documents, so you can also search this folder for a path such as `/hr/candidates`.

## Recruiting

| Guide | What it covers |
|-------|----------------|
| [HR Dashboard](./dashboard.md) | The page every HR user lands on after signing in |
| [Job Positions](./job-positions.md) | Creating, publishing and managing job openings |
| [Applications](./applications.md) | The inbox for applications from the public careers page |
| [Candidates](./candidates.md) | Candidate profiles, notes and file uploads |
| [Hiring Process](./hiring-process.md) | Multi-stage recruitment workflows and stage templates |
| [Async Stages](./async-stages.md) | Take-home stages candidates complete on their own time, and the token lifecycle behind the links |
| [Interviews](./interviews.md) | Scheduling, running and recording interviews |
| [Calendar and Scheduling](./calendar-and-scheduling.md) | The Meetings calendar, Google Calendar, booking settings and candidate self-scheduling |
| [AI Candidate Scoring](./ai-scoring.md) | Scoring candidates against a position, and tuning the weights |
| [Analytics](./analytics.md) | Hiring metrics, conversion funnel and pipeline health |

## Content and Files

| Guide | What it covers |
|-------|----------------|
| [Email Templates](./email-templates.md) | The eleven template types, variables and default templates |
| [File Manager](./file-manager.md) | Every file stored under your company, and your storage quota |
| [Notifications](./notifications.md) | The notification inbox, the bell, and the eight preference switches |

## Company and Account

| Guide | What it covers |
|-------|----------------|
| [Company Settings](./company-settings.md) | Logo, company details, careers page, AI scoring weights and booking settings |
| [Team Management](./team-management.md) | Inviting members, changing roles, removals and connection requests |
| [Roles and Permissions](./roles-and-permissions.md) | The eight roles, the API role ladder, and where the UI and API disagree |
| [Subscription and Limits](./subscription-and-limits.md) | Plans, prices, quotas, AI credits and upgrading |
| [Billing](./billing.md) | Subscription status, the payment portal and invoice history |
| [API Keys](./api-keys.md) | Creating keys and calling the public `/api/v1` endpoints |

## Platform Administration

| Guide | What it covers |
|-------|----------------|
| [Admin Panel](./admin-panel.md) | The ADMIN and SUPER_ADMIN area at `/admin`, and where its canonical per-screen guide lives |

## The In-App Guide

Borderless also ships a guide inside the product. The HR sidebar item **User Guide** (`/hr/guide`) renders eight sections in English and Spanish:

Getting Started, Job Positions, Applications, Candidates, Hiring Processes, Interviews & Calendar, Analytics, Team & Settings.

Its content lives in `recruiting-tool-frontend/src/docs/hr-*.md` (and `hr-*.es.md` for Spanish), and it overlaps heavily with the pages in this folder. The two sets are not cross-referenced and can drift apart.

### Which one is authoritative

| Audience | Authoritative source |
|----------|---------------------|
| Someone using the product | `recruiting-tool-frontend/src/docs/hr-*.md`, shown at `/hr/guide` — it is bilingual, versioned with the UI, and is what users actually reach |
| Someone reading the repository, integrating, or operating a deployment | This folder — it carries routes, roles, HTTP statuses, limits and endpoint tables that the in-app guide deliberately leaves out |

**If you change behaviour, update both.** When they disagree on a user-facing detail, treat the in-app copy as the one to fix first, then mirror it here with the technical detail restored.

A parallel set of documents in the same directory (`admin-panel.md`, `roles-permissions.md`, `subscription.md`, `integrations.md` and others) backs the Super Admin documentation screen at `/admin/docs`. [Admin Panel](./admin-panel.md) explains that split.

## Related

- [Documentation index](../index.md) - Everything, including getting started and deployment
- [API documentation](../api/index.md) - Endpoint reference for integrators
