# Company Settings

Guide to the Company Profile screen: your logo, company details, social links, the public careers page, AI scoring weights and booking settings.

## Overview

Company Profile is where you set the identity candidates see — your logo, description, industry and careers page headline — plus two configuration cards that are mounted at the bottom of the same page: AI Scoring Weights and Calendar & Booking Settings.

**Navigate to Company Profile:** Sidebar → **Settings** → **Company Profile**, or go directly to `/hr/settings/company`.

## Who Can See and Edit It

Two different rules apply.

| | Roles |
|---|-------|
| **Route guard** — who can open the page | HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN |
| **Sidebar link** — who sees the menu item | COMPANY_OWNER only |
| **Edit rights** — who can change anything | COMPANY_OWNER, COMPANY_ADMIN |

So most HR users never see the link but can reach the page by URL, and when they do every field is disabled, the Save button is not rendered, and a notice reads: "You have view-only access to the company profile. Contact your Company Owner or Company Admin to make changes."

## Company Logo

The first card shows your current logo, or a placeholder if none is set.

1. Click **Upload Logo** and pick an image.
2. The file is validated in the browser before upload.

| Rule | Value |
|------|-------|
| Accepted types | JPEG, JPG, PNG, GIF, WebP |
| Maximum size | 5 MB |
| Recommended dimensions | 200 × 200 px |

A file of the wrong type is rejected with "Invalid file type. Please upload a JPG, PNG, GIF, or WebP image." An oversized file is rejected with "File is too large. Maximum size is 5MB." On success you get "Company logo updated successfully".

The logo uploads immediately — it does not wait for the Save button.

## Basic Information

| Field | Notes |
|-------|-------|
| **Company Name** | |
| **Website** | |
| **Company Description** | Multi-line. "Tell candidates about your company, culture, and mission..." |
| **Industry** | Dropdown: Technology, Healthcare, Finance, Education, Retail, Manufacturing, Media & Entertainment, Real Estate, Consulting, Legal, Hospitality & Tourism, Transportation & Logistics, Energy, Agriculture, Other. **None** clears it. |
| **Company Size** | Dropdown of employee-count ranges |
| **Founded Year** | Must be 1800 or later and not in the future |
| **Location** | Free text, e.g. "Buenos Aires, Argentina" |
| **Company Timezone** | Dropdown. "Used to display meeting and interview times consistently for your team." |

## Social Links

Three optional link fields, each validated as a URL: **LinkedIn**, **Twitter / X** and **Instagram**.

## Careers Page

| Field | Effect |
|-------|--------|
| **Enable Careers Page** | A switch. "When enabled, your company's open positions will be visible on the public careers page." |
| **Careers Page Headline** | The headline shown at the top of your public careers page, e.g. "Join our team and help us build the future!" |

Turning the switch off removes your positions from the public careers listing without unpublishing them individually.

## Saving

The **Save** button appears at the bottom of the form for COMPANY_OWNER and COMPANY_ADMIN only. On success you get "Company profile saved successfully".

The logo card saves on upload, so it is not covered by this button.

## AI Scoring Weights

A separate card below the profile form controls how AI candidate scores are composed.

Three sliders — **Skills**, **Experience** and **Education** — each run from 0 to 100. A running **Total** is shown beneath them, and **Save** is disabled until the three values sum to exactly 100. Until then the card shows the validation message that the total must be 100.

This card has no view-only mode of its own, so it renders fully for every role that can open the page — including the roles the company profile form above locks down. The underlying endpoint (`PUT /api/ai/scoring-weights`) admits HR and every role above HR, so only a RECRUITER is refused; an HR or HR_MANAGER user who cannot edit the company profile *can* change the scoring weights here.

## Calendar & Booking Settings

The second card below the profile form is the same **Calendar & Booking Settings** card that appears on `/settings/calendar`: the booking switch, working days, working hours, buffer, booking window and blocked dates. Editing it here and editing it there are the same thing.

The switch stays disabled until Google Calendar is connected, and Google Calendar can only be connected from `/settings/calendar`. See [Calendar and Scheduling](./calendar-and-scheduling.md) for the full walkthrough.

## Next Steps

- [Calendar and Scheduling](./calendar-and-scheduling.md) - Google Calendar and the booking card
- [Subscription and Limits](./subscription-and-limits.md) - AI scoring credits and rate limits
- [Roles and Permissions](./roles-and-permissions.md) - Why the sidebar link is Company Owner only
- [Job Positions](./job-positions.md) - What actually appears on the careers page
