# Registration and Onboarding

Guide to `/register` and the three onboarding paths that follow it. Which questions you are asked, where you land afterwards, and what the email-verification gate blocks until you clear it depend entirely on the role you pick on the first screen.

## Overview

Signing up is a four-step wizard at `/register`. Step one asks who you are, and that answer branches everything after it:

| Role chosen | Asked for in step 3 | Sent to after signup |
|-------------|---------------------|----------------------|
| **HR / Recruiter** | Job title (optional) | `/onboarding/hr` |
| **Job Applicant** | Nothing | `/applicant/onboarding` |
| **Company Owner** | Company name (required) | `/onboarding` |

Anyone with an HR-panel role also has to verify their email address before the panel opens.

---

## The signup wizard

`/register` renders four steps:

| # | Step | What it does |
|---|------|-------------|
| 1 | Role selection | Three cards: HR / Recruiter, Job Applicant, Company Owner. Clicking one advances immediately |
| 2 | Account creation | Name, email, password, and a terms checkbox |
| 3 | Role information | Role-specific — see the table above |
| 4 | Confirmation | Shows a summary, then submits the registration |

Steps 2 and 3 have **Back** and **Next**; step 4 submits. On success the page redirects by role, replacing the history entry so the finished wizard is not in the back stack.

### The company owner's company name

Company Owner is the only role with a required field in step 3. The company name is sent with the registration payload and is what the company record is created from.

### The HR job title

HR's job title is optional. It is stashed in `localStorage` under `hr_onboarding_position` so that the HR onboarding wizard can pre-fill the position field on the next screen.

### What the Job Applicant is told

Applicants are asked nothing in step 3. The step shows a note explaining that the resume and profile are collected in the onboarding flow immediately afterwards.

---

## Attribution

The signup form sends the marketing parameters of the visit that *first* brought the session to the site, so an account can be traced back to the campaign that produced it.

Capture lives in `src/utils/attribution.ts`:

- **First touch wins.** Once a stash exists for the session it is never overwritten. A visitor who lands on `/?utm_source=linkedin`, browses to the pricing section and then signs up is still credited to LinkedIn.
- **`sessionStorage`, not `localStorage` or a cookie.** It dies with the tab, is not shared across tabs and is not a persistent device identifier, which keeps the marketing site clear of the ePrivacy consent-banner trigger.
- **Every read is defensive.** Private-mode browsers throw on storage access. A signup must never fail because attribution could not be read.

`buildRegistrationAttribution()` maps the stash onto the optional fields of `POST /api/auth/register`:

| Stashed key | Registration field | Cap |
|-------------|--------------------|-----|
| `utm_source` | `utmSource` | 255 |
| `utm_medium` | `utmMedium` | 255 |
| `utm_campaign` | `utmCampaign` | 255 |
| `utm_term` | `utmTerm` | 255 |
| `utm_content` | `utmContent` | 255 |
| `referrer` | `referrerUrl` | 2048 |
| `landing_path` | `landingPath` | 2048 |
| `referrer_domain` | *(dropped — no backend column)* | — |

The caps mirror the backend column constraints exactly. Values are trimmed, truncated, and omitted from the body entirely when empty — the request never carries an `undefined`.

### Analytics step names are frozen

`SIGNUP_STEP_NAMES` in `src/pages/auth/signupFunnel.ts` is the ordered list of stable analytics identifiers:

```ts
["role_selection", "account_creation", "role_information", "confirmation"]
```

**Never rename or translate these.** They are not UI copy — every PostHog funnel built on the signup flow keys off them, and renaming one orphans the dashboards. The visible step labels are separate and live in the i18n bundle, where they belong.

For the same reason, each `signup_step_completed` event ships both spellings of its properties — `step` / `stepName` and `step_index` / `step_name`. Event property names cannot be renamed retroactively in PostHog either.

`signup_started` fires exactly once per mount, guarded by a ref rather than an empty dependency array, because React StrictMode re-runs mount effects in development and would double-count the top of the funnel.

---

## The email verification gate

Users holding `HR`, `HR_MANAGER`, `RECRUITER`, `COMPANY_OWNER` or `COMPANY_ADMIN` cannot reach any protected route until `emailVerified` is true. They are redirected to `/pending-email-verification`.

- `ADMIN` and `SUPER_ADMIN` are **excluded** — platform-level accounts may be created outside the normal registration flow.
- Job applicants (`USER`) are not gated either.
- `/pending-email-verification` and `/logout` are excluded from the redirect so the gate page cannot loop.

The verification email links to `/verify-email?token=...`, which verifies on mount. Opening `/verify-email` with no token shows a "missing token" message rather than a spinner.

A dismissible banner also appears elsewhere in the app for any signed-in user whose email is unverified.

---

## Company owner onboarding — `/onboarding`

A four-step wizard, addressed by step **id** rather than index, because the payment step is conditional and a hard-coded index would either show a step the user legitimately skipped or send them to the wrong screen.

| Order | Step id | Shown when |
|:-----:|---------|-----------|
| 1 | `plan_selection` | Always — this is where the wizard starts |
| 2 | `payment` | The chosen plan is not `FREE`, **or** the plan is still unknown |
| 3 | `company_setup` | Always |
| 4 | `welcome` | Always |

Company setup collects a logo, industry, timezone and team size. The wizard finishes on `/hr/dashboard`.

### Plan and payment behaviour

- The effective plan is the one chosen in this session, falling back to the plan already persisted for the company.
- An **unknown** plan keeps the payment step visible, so the stepper does not shrink under the user mid-flow. A known `FREE` plan drops it entirely.
- If the user backs up and switches from a paid plan to `FREE` while sitting on the payment step, the wizard moves them to company setup rather than stranding them.
- The payment provider redirect is a full page load, so the in-session plan choice is gone by the time the user returns. `?payment=success` advances to company setup and shows a success snackbar; `?payment=cancelled` sends them back to plan selection rather than quoting a payment summary with no plan. Either way the query parameter is cleaned off the URL.

Plans, prices and what each tier includes are in [Subscription and Limits](./subscription-and-limits.md).

---

## HR onboarding — `/onboarding/hr`

Three steps: **Welcome**, **Profile Setup**, **Complete**.

Welcome names the company the user is joining and, when they arrived through an invitation, who invited them. Profile Setup collects position, department, phone, timezone and a short bio — the position field is pre-filled from the job title captured during signup.

A user who has already completed onboarding is redirected straight to `/hr/dashboard`. On finishing, the backend returns the destination to send them to.

---

## Applicant onboarding — `/applicant/onboarding`

Four steps: **Welcome**, **Profile**, **Resume**, **Completion**. Profile fields are pre-populated from anything already on the user record. The resume step can be skipped. The wizard finishes on `/careers`.

Applicants who have not completed onboarding are redirected here from any protected route, with these exceptions so they are never locked out of their own account: the onboarding routes themselves, `/profile`, `/notifications`, `/settings/notifications`, `/invitations/accept` and `/logout`.

### The preferences step

A job-preferences step — desired job types, preferred locations, salary expectations — exists as a component but is **deliberately not part of the flow**, because the API does not persist those fields. The component is kept rather than deleted so the step can be re-enabled when the backend supports it. Do not document or demo it as an available feature.

---

## Rate limits

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/register` | 3 per hour per IP |
| `POST /api/auth/sign-in` | 5 per 15 minutes per IP |
| `POST /api/auth/forgot-password` | 3 per 15 minutes per IP |
| `POST /api/auth/reset-password` | 5 per 15 minutes per IP |
| `GET /api/auth/verify-email?token=` | Exempt from throttling |

`forgot-password` always reports success whether or not the address exists, to prevent email enumeration.

---

## Related

- [The Applicant Experience](./applicant-experience.md) - What an account does and does not buy a candidate
- [Roles and Permissions](./roles-and-permissions.md) - What each role can do once it is in
- [Subscription and Limits](./subscription-and-limits.md) - The plans offered in the owner wizard
- [Billing](./billing.md) - What happens after the payment step
- [Team Management](./team-management.md) - Inviting the HR users who take the HR path
- [Authentication API](../api/authentication.md) - The registration, verification and sign-in endpoints
