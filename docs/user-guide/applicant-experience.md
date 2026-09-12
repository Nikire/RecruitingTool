# The Applicant Experience

Complete guide to everything an external candidate sees, from finding a posting on the public job board to tracking their application, booking an interview and unsubscribing. Every other user-guide page in this folder is written for the HR side of the same flow; this one is the map of the candidate side, and it links to the pages that go deeper.

## Overview

A candidate never needs an account. Every step below works for a logged-out visitor, because each one is protected either by nothing at all (the public job board) or by a token or code that arrives in an email.

The journey has six stages:

1. **Discover** a posting on `/careers`, a facet index, or a company's branded board.
2. **Apply** from the job detail page, through the **Apply** dialog.
3. **Receive email** — a confirmation, then a tracking code once HR accepts the application.
4. **Track** progress at `/hiring-process/:uid` with the code, or at `/check-status`.
5. **Respond** to stages — self-schedule an interview at `/book-interview/:token`, or submit an async assignment at `/submit/:token`.
6. **Opt out** at `/unsubscribe/:token`, if the email was an outreach campaign.

Registering an account is optional and changes only two things: the **Auto-fill from Profile** button in the Apply dialog, and the ability to open a tracking page for your own email address without typing a code.

---

## The public route map

These are every route a logged-out visitor can reach. The **Crawlable** column is `public/robots.txt`; the **Indexable** column is whether the page itself emits `noindex` — the two can disagree, and where they do, `noindex` wins.

| Route | What it is | Crawlable | Indexable |
|-------|-----------|:---------:|:---------:|
| `/` | Marketing landing page | Yes | Yes |
| `/careers` | The global job board | Yes | Yes |
| `/careers/company/:companySlug` | One company's branded board | Yes | Yes (a slug that resolves to nothing is `noindex`) |
| `/careers/:uid` | Legacy job URL — redirects to the canonical `/jobs/...` path | Yes | Redirect only |
| `/jobs` | Redirects to `/careers` | Yes | Redirect only |
| `/jobs/:facet` | Faceted job index, e.g. `/jobs/remote` | Yes | Yes, unless the facet has zero live postings |
| `/jobs/:company/:job-slug-uid` | A job posting | Yes | Yes, while the posting is `OPEN` |
| `/blog`, `/blog/:slug` | Articles | Yes | Yes (drafts are not served in production) |
| `/contact` | Contact form and FAQ | Yes | Yes |
| `/terms`, `/privacy`, `/security` | Legal pages | Yes | Yes |
| `/register` | Sign-up wizard | Yes — and listed in `sitemap.xml` | Yes |
| `/check-status` | Access-code status lookup | Allowed in `robots.txt` | **No** — the page emits `noindex` |
| `/login`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth screens | `Disallow` | No |
| `/hiring-process/:uid` | Candidate tracking page (code required) | `Disallow` | No |
| `/book-interview/:token`, `/booking-confirmed/:token` | Interview self-scheduling | `Disallow` | No |
| `/submit/:token` | Async stage submission | `Disallow` | No |
| `/unsubscribe/:token` | Unsubscribe confirmation | `Disallow` | No |
| `/book-demo/:token`, `/booking-confirmed-demo/:token` | Prospect demo booking | `Disallow` | No |
| `/oauth/success` | OAuth popup close page | `Disallow` | No |
| Anything else | 404 page | — | No — emits `noindex, nofollow` |

`/check-status` is the one deliberate mismatch: `robots.txt` allows it and the sitemap lists it, but the page itself ships `noindex`. Treat the page's own directive as authoritative.

**Nothing in the product links to `/check-status`.** The navbar offers Home, Careers, Contact, Login and Sign Up; the landing page footer adds the blog. Candidates reach the tracking page from the link in their email, which points at `/hiring-process/:uid`, not at `/check-status`.

For the URL shapes themselves — why a job URL carries a slug and a UUID, which facets exist, and how `/jobs/a/b` is split between a posting and a facet pair — see [Public URL Scheme](../seo/public-url-scheme.md).

---

## Discovering a job

### The global board

`/careers` lists every posting that is `OPEN` **and** approved by platform moderation. Nine filters are available, and all of them live in the query string, so any filtered view is a link a candidate can send to someone else:

| Filter | Query parameter |
|--------|-----------------|
| Free-text search | `q` |
| Category | `category` |
| Job type | `jobType` |
| Work location | `workLocation` |
| Experience level | `experience` |
| Minimum salary | `salaryMin` |
| Maximum salary | `salaryMax` |
| Company | `company` (a company UID) |
| Country | `country` |

Filtering by a single company switches the page header to that company's name. The shareable, branded version of that view is `/careers/company/{company-name-slug}`, which a customer can link from their own website.

### Facet indexes

Below the board, **Browse by** links lead to 21 standing indexes — `/jobs/remote`, `/jobs/engineering`, `/jobs/colombia`, `/jobs/full-time` and so on — plus role-and-country pairs such as `/jobs/engineering/colombia`. Narrowing further from a facet page sends the visitor to `/careers?...` rather than inventing a new URL.

### The job detail page

The posting page shows the title, company, location, description, requirements, responsibilities, benefits and skills, and the salary range only when the recruiter chose to publish it. An **Apply** button opens the application dialog on the same page — there is no redirect to a third-party board.

A posting that has been closed, filled or deleted returns "This position is no longer available" rather than an error, because the public endpoint only ever serves open postings.

---

## Applying

The **Apply** dialog collects the following. The limits shown are enforced in the browser and again by the API.

| Field | Required | Limits |
|-------|:--------:|--------|
| Full Name | Yes | 2–100 characters |
| Email Address | Yes | Must be a valid address |
| Phone Number | Yes | 5–20 characters |
| Upload Resume | No | PDF, DOC or DOCX only, 10 MB maximum |
| Cover Letter | No | 5,000 characters maximum |
| "Where did you hear about us?" | No | One of the eleven sources below |
| Custom questions | Depends | Whatever the recruiter marked required on this posting |

The application-source list is fixed: Company Website, LinkedIn, Indeed, Glassdoor, Referral / Someone I know, Job Fair / Event, University / Campus, Recruiter, Direct Application, Social Media, Other — plus **Prefer not to say**, which sends nothing.

If the visitor is signed in, an **Auto-fill from Profile** button copies their name, email and phone from their account. Signed-out visitors who click it are told "Please login to use auto-fill".

### What happens on submit

1. If a resume was attached, it is uploaded first to `POST /api/files/upload-resume-public`. A failed upload is reported inline — "We couldn't upload your resume. Please try again or remove the file." — and nothing is submitted.
2. The application itself is posted to `POST /api/applications` with the uploaded file's UID.
3. The dialog shows "Application submitted successfully! We'll get back to you soon." and closes itself after two seconds.

**Rate limit:** 5 applications per hour per IP address. The sixth is refused with `429`.

The recruiter's side of this is documented in [Applications](./applications.md).

---

## Emails a candidate receives

| Email | When |
|-------|------|
| Application confirmation | Immediately after submitting an application |
| Application under review / accepted / rejected | When HR changes the application's status |
| **Your application tracking code** | When a hiring process is created for the candidate — either directly by HR, or automatically when HR accepts their application |
| Interview invitation with a booking link | When HR sends a booking link for a stage |
| Booking confirmation | After the candidate picks a slot |
| Async stage invitation, and a reminder ~24 hours before the deadline | When HR requests an async submission |

Every one of these is a customizable template. See [Email Templates](./email-templates.md).

None of these transactional emails carries an unsubscribe link — only cold outreach campaigns do. See [Email Unsubscribe](./email-unsubscribe.md) for why, and for what the suppression list actually covers.

---

## Tracking an application

The tracking-code email links to `/hiring-process/:uid` and prints the 8-character code in the body. The candidate enters the code once and sees a stage-by-stage stepper; the code is remembered in the browser for that process.

A shorter lookup exists at `/check-status`, where the same code returns a single-screen summary rather than the full stepper.

Both are covered in detail, including exactly which fields are exposed and which are withheld, in [Candidate Status Tracking](./candidate-status-tracking.md).

---

## Responding to a stage

### Booking an interview

When HR clicks **Send Booking Link** on a stage, the candidate receives a link to `/book-interview/:token`. They choose a timezone and a slot, and land on `/booking-confirmed/:token`. Booking tokens are single-use and expire 7 days after they are issued.

The full flow, the settings that constrain which slots are offered, and every failure state are documented in [Calendar and Scheduling](./calendar-and-scheduling.md#candidate-self-scheduling).

### Submitting an async assignment

When HR requests an async submission, the candidate receives a link to `/submit/:token`, where they can write a response and attach up to 10 files of 100 MB each. The link is consumed on submit. See [Async Stages](./async-stages.md).

---

## Registering as a candidate

A candidate can create an account at `/register` by choosing the **Job Applicant** role. That leads to a short onboarding flow — welcome, profile, resume, done — and ends on the careers page.

An account buys the candidate two things and no more: profile auto-fill in the Apply dialog, and access to a tracking page for a hiring process whose candidate email matches their own, without needing the access code. Applications themselves are never tied to an account.

See [Registration and Onboarding](./registration-and-onboarding.md).

---

## Related

- [Candidate Status Tracking](./candidate-status-tracking.md) - Access codes, the tracking page and what it exposes
- [Email Unsubscribe](./email-unsubscribe.md) - The unsubscribe token flow and notification preferences
- [Registration and Onboarding](./registration-and-onboarding.md) - The sign-up wizard and the three onboarding paths
- [Applications](./applications.md) - The HR inbox that receives these applications
- [Async Stages](./async-stages.md) - The candidate submission page and its token lifecycle
- [Calendar and Scheduling](./calendar-and-scheduling.md) - Interview self-scheduling, end to end
- [Job Positions](./job-positions.md) - How a posting reaches the public board
- [Public URL Scheme](../seo/public-url-scheme.md) - Canonical job URLs and the facet registry
- [Public Endpoints](../api/public-endpoints.md) - Every route reachable without a login, with its rate limit
