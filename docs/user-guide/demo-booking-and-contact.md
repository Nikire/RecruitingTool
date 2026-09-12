# Demo Booking and Contact

Guide to the two inbound surfaces on the marketing site: the **Book a Demo** flow that lets a prospect schedule a call with the Borderless team, and the **Contact** form. Both are open to anyone, and both are triaged from the admin panel.

## Overview

| Surface | Public entry point | Where it is triaged |
|---------|-------------------|---------------------|
| Demo booking | A dialog on the landing page and on `/contact`, then `/book-demo/:token` | `/admin/demos` |
| Contact form | `/contact` | `/admin/contact-messages` |

Both admin screens are behind `@Auth(['ADMIN'])`, which the role guard reads as ADMIN and above — so `ADMIN` and `SUPER_ADMIN` only.

---

## Booking a demo

### Requesting a link

**Book a Demo** buttons appear on the landing page and in the "How can we help?" section of `/contact`. Either opens a dialog asking for:

| Field | Required | Limit |
|-------|:--------:|-------|
| Email | Yes | Must be a valid address |
| Name | No | 100 characters |
| Company | No | 200 characters |

Submitting calls `POST /api/demo-booking/request`. On success the browser is sent **straight to `/book-demo/{token}`** — the prospect does not have to leave the site and wait for mail. The same tokenized link is also emailed to them, so they can come back to it later.

### What the backend does

1. Finds the Borderless system company — the one that has a `SUPER_ADMIN` user.
2. Refuses with `400` if that company has not enabled its booking system: "Demo booking is currently not available. Please contact us via email."
3. Generates slots from the company's calendar settings, at a fixed **30 minutes** per demo call.
4. Refuses with `400` if that produced no slots: "No available demo slots at this time. Please contact us via email."
5. Creates a `demo_`-prefixed token with those slots attached and emails the link.

The token expires **`advanceBookingDays` + 7 days** after it is minted, where `advanceBookingDays` is the booking window on the system company's calendar settings (30 by default). Slot generation reads the same working days, working hours, buffer, booking window and blocked dates that constrain candidate interview slots — see [Calendar and Scheduling](./calendar-and-scheduling.md#calendar-and-booking-settings).

### What the prospect sees

`/book-demo/:token` lists the available slots, grouped by date, with a timezone selector; the prospect's own browser timezone is preselected and added to the list if it is not already there. Picking a slot and confirming posts to `POST /api/demo-booking/confirm/:token` and lands on `/booking-confirmed-demo/:token`.

### What confirming does

- Marks **every** slot on that token unavailable and stamps the token used, so the link is single-use.
- Stamps the chosen slot with its selection time.
- Emails the prospect a booking confirmation with the date, time and 30-minute duration, on a best-effort basis.
- Creates a Google Calendar event for the `SUPER_ADMIN` user on the system company, also best-effort — a calendar failure never fails the booking.

### Failure states

| Situation | Response | Message |
|-----------|----------|---------|
| Unknown token | `404` | "Invalid booking link" |
| Token past its expiry | `400` | "This booking link has expired" |
| Token already used | `400` | "This booking link has already been used" |
| Chosen slot gone | `404` | "Time slot not found or no longer available" |

`/book-demo/` and `/booking-confirmed-demo/` are both `Disallow`ed in `robots.txt`.

---

## Triaging demos — `/admin/demos`

The **Demo Booking Manager** lists every demo token in a paginated grid, with summary cards counting each outcome.

| Column | Notes |
|--------|-------|
| Prospect email, name, company | As submitted in the request dialog |
| Created | When the link was minted |
| Used | When the prospect confirmed a slot, or blank |
| Scheduled at | The confirmed slot time |
| Outcome | One of the five values below |
| Notes | Free text attached to the outcome |
| Linked prospect | An optional link to a `ProspectCompany` record |

Outcomes: **PENDING**, **COMPLETED**, **NO_SHOW**, **RESCHEDULED**, **CANCELED**. The grid can be filtered to one of them.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/admin/demos?page=&limit=&outcome=` | Paginated list plus the summary counts (default 20 per page) |
| `PATCH` | `/api/admin/demos/:uid/outcome` | Set the outcome and optional notes |
| `PATCH` | `/api/admin/demos/:uid/link-prospect` | Associate an existing `ProspectCompany` by UID |

---

## The contact form

`/contact` pairs a form with three "How can we help?" cards and a four-question FAQ accordion. The page emits `FAQPage` structured data built from those same four visible questions.

One of the three cards is labeled **coming soon** and does nothing.

### Fields

| Field | Required | Limit | Sent as |
|-------|:--------:|-------|---------|
| Name | Yes | 100 characters | `name` |
| Email | Yes | Valid address | `email` |
| Subject | Yes | 200 characters | Prefixed into the message |
| Company | No | 200 characters | `company`, omitted when blank |
| Message | Yes | — | `message` |

**There is no `subject` column.** The API accepts `name`, `email`, `company` and `message` only, so the page folds the subject into the body as `[Subject] Message text`. Expect that bracket prefix on every message in the admin list.

On success the form is replaced by a confirmation panel with a **Send another** button.

### Spam and rate limiting

`POST /api/contact` carries **no route-level throttle override, no CAPTCHA and no honeypot**. It falls back to the global IP limiter, configured by `THROTTLE_TTL` (default 60,000 ms) and `THROTTLE_LIMIT` (default 100 requests). That is a weak defense for an open form — tighten `THROTTLE_LIMIT`, or add a `@Throttle` override to the handler, before pointing paid traffic at the page.

For contrast, `POST /api/applications` is capped at 5 per hour per IP and `POST /api/auth/register` at 3 per hour.

---

## Triaging messages — `/admin/contact-messages`

A paginated table of every submission: name, email, company, a truncated message, the date, and a read/unread chip. A view action opens the full message; a second action marks it read.

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/api/contact` | None — public |
| `GET` | `/api/contact/messages?page=&limit=` | `ADMIN`, `SUPER_ADMIN` (default 20 per page) |
| `PATCH` | `/api/contact/messages/:uid/read` | `ADMIN`, `SUPER_ADMIN` |

There is no reply-from-the-panel action and no delete. Replies go out from whatever mailbox reads the address the prospect supplied.

---

## Troubleshooting

**"Demo booking is currently not available."** The Borderless system company — the one with the `SUPER_ADMIN` user — has its booking system switched off, or has no Google Calendar connection to switch it on with. Fix it on `/settings/calendar` for that company.

**"No available demo slots at this time."** Booking is on, but the settings produce nothing: no working day selected, working hours too narrow for a 30-minute call plus the buffer, or every date in the window blocked.

**A prospect's link says it has already been used.** Demo tokens are single-use. Ask them to request a new one from the dialog; nothing in the admin panel re-opens a consumed token.

**Every contact message starts with a bracket.** That is the subject field, folded into the body. It is expected.

---

## Related

- [Calendar and Scheduling](./calendar-and-scheduling.md) - The booking settings that generate demo slots
- [Admin Panel](./admin-panel.md) - The rest of the ADMIN and SUPER_ADMIN area
- [Roles and Permissions](./roles-and-permissions.md) - Who can open these admin screens
- [The Applicant Experience](./applicant-experience.md) - The candidate-facing token flows these mirror
- [Public Endpoints](../api/public-endpoints.md) - Demo booking and contact among every other open route
