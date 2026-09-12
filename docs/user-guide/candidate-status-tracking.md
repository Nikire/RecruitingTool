# Candidate Status Tracking

Guide to the access code that lets a candidate check where their application stands without an account: how the code is created, the two pages that accept it, exactly what those pages reveal, and what a candidate sees when the code is wrong or expired.

## Overview

Every hiring process carries an 8-character alphanumeric **access code**. The candidate receives it by email and uses it on one of two public pages:

| Page | Route | What it shows |
|------|-------|---------------|
| Tracking page | `/hiring-process/:uid` | The full stage-by-stage stepper for one process |
| Status check | `/check-status` | A one-screen summary, looked up by the code alone |

Neither page needs a login. Both are `Disallow`ed or `noindex`ed, so a code pasted into a public forum will not end up in a search index — but the code itself is the only thing protecting the data, so it should be treated as a secret.

---

## How a code is created

Codes are generated automatically. Nothing in the HR panel asks you to create one.

| Trigger | Code validity | Email sent |
|---------|---------------|-----------|
| A hiring process is created for a candidate | **90 days** | "Your application tracking code" |
| HR accepts an application, which creates the hiring process | **90 days** | Same email |
| `POST /api/hiring-process/:uid/generate-access-code` is called directly | **30 days** | None — the code is returned in the response only |

The third row is an API-only capability. The endpoint exists and is restricted to `HR`, `COMPANY_OWNER`, `ADMIN` and `SUPER_ADMIN`, and a client helper for it ships in the frontend, but **no screen in the product calls it**. There is no "regenerate code" button. Re-issuing a code today means calling the endpoint yourself and passing the result to the candidate by hand.

Generating a new code overwrites the old one: a hiring process has exactly one `accessCode` at a time, and the previous code stops working immediately.

### The email

The tracking email is titled *Your application tracking code — {position}*. It prints the code in large type and links to `https://borderlessats.com/hiring-process/{uid}`, and it says the code is valid for 90 days. It is sent on a best-effort basis: if delivery fails, the hiring process is still created and the failure is logged rather than surfaced to HR.

---

## The tracking page — `/hiring-process/:uid`

This is the page the email links to.

1. The candidate opens the link and is asked to unlock the page with their code.
2. The input accepts 8 characters and upper-cases whatever is typed, so a code copied in lower case still works.
3. On success the page renders a stepper of every stage in order.
4. The code is remembered in the browser's local storage under `hp_access_<uid>`, so a return visit skips the prompt. **Enter a different code** clears it.

Storage failures — a private window, a browser blocking site data — are swallowed: the page still works, it just asks for the code again next time.

### What the stepper shows

For each stage: title, type, position in the order, description, estimated time, and one of three candidate-facing statuses.

| Internal stage status | Shown to the candidate as |
|-----------------------|---------------------------|
| `DONE` or `CANCELLED` | **Completed** |
| `CURRENT` | **Current** |
| `OPEN` (or anything else) | **Pending** |

Alongside the stages the page shows the candidate's name, the position title, the company name, the overall process status (`OPEN`, `IN_PROGRESS`, `CLOSED`, `CANCELLED`, `REJECTED`) and when it was last updated.

Nothing else is exposed. HR notes, scores, interview feedback, other candidates, salary data and the internal numeric IDs never reach this response.

### The signed-in shortcut

If the visitor is signed in and the email on their account matches the candidate's email on the hiring process, the code check is skipped entirely. This is what makes the page useful to a candidate who registered an account: they open the link and see the stepper immediately.

HR staff who open `/hiring-process/:uid` while signed in get the internal management view instead, not this page.

### Failure states

| Situation | API response | What the candidate sees |
|-----------|--------------|-------------------------|
| No code entered yet | — | The unlock prompt |
| Wrong code | `401` | The unlock prompt again, with "invalid code" under the field. The stored code is cleared. |
| Code past its expiry | `401` | Same as a wrong code |
| Hiring process does not exist, or was deleted | `404` | A "not found" screen |
| Anything else | 5xx | A generic error screen |

**Rate limit:** 30 requests per minute per IP address.

---

## The status check — `/check-status`

A simpler lookup that needs only the code — no UID, so it works from any device with just the email in hand.

The candidate types the code (again upper-cased as they type, capped at 8 characters) and clicks **Check Status**. The result card shows:

- **Candidate** — the **first name only**. The surname is deliberately withheld.
- **Position**
- **Company**
- **Current stage**, if one is marked current
- **Status** as a colored chip
- **Last updated**

No stage list, and no way to reach one from here.

| Situation | API response | Message |
|-----------|--------------|---------|
| Unknown code | `404` | "Invalid code" |
| Code past its expiry | `404` | Same — an expired code is indistinguishable from a wrong one |
| More than 5 lookups in a minute from one IP | `429` | "Too many requests" |
| Anything else | 5xx | A generic error |

**Rate limit:** 5 requests per minute per IP address — deliberately tighter than the tracking page, because this route is guessable by brute force in a way the UID-scoped one is not.

Every successful lookup stamps `lastAccessedAt` on the hiring process and increments its access counter.

### Discoverability

`/check-status` is not linked from the navbar, the footer, or any email. A candidate reaches it only by typing the URL. It is listed in `sitemap.xml` and allowed in `robots.txt`, but the page emits `noindex, nofollow`, so it will not appear in search results.

---

## Endpoints

| Method | Endpoint | Auth | Rate limit |
|--------|----------|------|-----------|
| `POST` | `/api/hiring-process/:uid/generate-access-code` | `HR`, `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | Global IP limiter |
| `GET` | `/api/public/status/:accessCode` | None — the code is the credential | 5/min per IP |
| `GET` | `/api/hiring-process/:uid/public?code=<code>` | None — code, or a matching signed-in email | 30/min per IP |

See [Public Endpoints](../api/public-endpoints.md) for how these sit alongside every other unauthenticated route.

---

## Troubleshooting

**The candidate says the code does not work.** Check the 90-day window first — a process started three months ago has an expired code. Re-issuing requires the API endpoint above; there is no button.

**The candidate lost the email.** There is no "resend tracking code" action. Generate a fresh code through the API and send it manually, or point them at `/hiring-process/:uid` with the code pasted from the hiring process record.

**HR opens the tracking link and sees the management page.** That is correct. The route renders the internal view for anyone signed in with an HR-panel role, and the candidate view for everyone else.

**The candidate sees only their first name on `/check-status`.** Also correct — the short lookup truncates the name on purpose. The full name appears on `/hiring-process/:uid`, which is scoped to a specific process.

---

## Related

- [The Applicant Experience](./applicant-experience.md) - Where status tracking sits in the whole candidate journey
- [Hiring Process](./hiring-process.md) - The stages this page renders, from the HR side
- [Applications](./applications.md) - Accepting an application, which is what mints most codes
- [Email Templates](./email-templates.md) - The other emails a candidate receives
- [Public Endpoints](../api/public-endpoints.md) - Every unauthenticated route and its protection
