# Email Unsubscribe and Notification Preferences

Guide to the two independent ways email volume is reduced in Borderless: the public unsubscribe link that appears in cold outreach, and the per-user notification switches inside the product. They cover different email and neither one affects the other.

## Overview

| Mechanism | Who uses it | What it suppresses | Route |
|-----------|-------------|--------------------|-------|
| Unsubscribe token | Anyone who receives an outreach email — no account needed | Future **outreach campaign** email to that address | `/unsubscribe/:token` |
| Notification preferences | A signed-in user | The user's own in-app and email notifications | `/settings/notifications` |

**Transactional candidate email is not covered by either.** Application confirmations, status updates, tracking codes, interview invitations and async stage links carry no unsubscribe link and are not checked against the suppression list. A candidate who unsubscribed from an outreach campaign will still receive email about an application they submitted.

---

## The unsubscribe link

### Where the link comes from

Only the **outreach campaign** sender mints unsubscribe tokens. When a campaign email is about to be sent to a lead:

1. The lead's address is checked against the suppression list. If it is suppressed, the send is refused with `400` — "This email address has unsubscribed and cannot receive emails."
2. A fresh 64-character hex token is generated and stored as a new `EmailUnsubscribe` row alongside the address.
3. `{{unsubscribeUrl}}` is set to `{FRONTEND_URL}/unsubscribe/{token}` and passed to the template renderer.

The default **Cold Outreach — Initial Contact** template ends with:

> If you'd prefer not to receive future emails, [click here to unsubscribe](#).

A custom `OUTREACH` template that omits `{{unsubscribeUrl}}` will send with no unsubscribe link at all. Keep the variable in any outreach template you write.

`FRONTEND_URL` defaults to `https://app.borderlessats.com` when it is not set. Check it on any environment that sends outreach — an unset value produces links pointing at the wrong host.

### What clicking it does

The page at `/unsubscribe/:token` calls `GET /api/unsubscribe/:token` on load. The endpoint:

- Looks the token up. **If it does not exist, it still returns success** — an invalid token must not reveal whether an address is on file.
- If the token has already been used, returns success and changes nothing.
- Otherwise stamps `usedAt` and returns success.

Consuming a token is what suppresses the address: `isEmailUnsubscribed()` matches any `EmailUnsubscribe` row for that address, case-insensitively, that has a non-null `usedAt`.

Tokens do **not** expire. There is no TTL column and no expiry check.

### What the candidate sees

| Outcome | Screen |
|---------|--------|
| Loading | A spinner |
| Success — including an unknown or already-used token | A green tick, "unsubscribed" heading and confirmation message |
| The request itself failed (network, 5xx) | An amber warning icon and an error message |

Because an unknown token is reported as success, the error state only ever means "the request did not complete", never "that link was wrong".

### Re-subscribing

There is no re-subscribe page and no admin screen to clear a suppression. The address stays suppressed until the `EmailUnsubscribe` row is removed at the database level. Suppression is by **email address**, not by campaign or by company, so it applies to every future outreach send from the platform.

### Note for operators

Suppression is checked at send time inside the outreach sender only. Adding a new bulk-email path means adding the `isEmailUnsubscribed()` check to it explicitly — nothing enforces it globally.

---

## Notification preferences

The authenticated equivalent lives at `/settings/notifications` and is completely separate: it is keyed to a signed-in **user**, not to an email address, and it governs the notifications that user receives about their own work.

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/notification-preferences` | Any signed-in user |
| `PATCH` | `/api/notification-preferences` | Any signed-in user |

Both act on the current user only — there is no way to read or change someone else's preferences.

**The eight switches are stored but not enforced.** They are written to the user record and read back by `GET /api/notification-preferences`, but no notification or email path in the backend consults them. Turning one off records the choice; it does not yet stop the delivery. The switches themselves, what each one is meant to cover, and the notification types no switch covers at all are documented in [Notifications](./notifications.md#important-the-switches-are-not-yet-enforced).

That leaves the unsubscribe token as the only mechanism in the product that actually stops an email from being sent — and it only ever applies to outreach.

---

## Which mechanism applies

| Email | Carries an unsubscribe link? | Honors the suppression list? | Controlled by notification preferences? |
|-------|:---------------------------:|:----------------------------:|:---------------------------------------:|
| Outreach campaign | Yes | Yes | No |
| Application confirmation, status change | No | No | No |
| Hiring process tracking code | No | No | No |
| Interview invitation, booking confirmation | No | No | No |
| Async stage invitation and reminder | No | No | No |
| In-app notification email to a team member | No | No | Nominally — but the switches are **not enforced** yet (see below) |

---

## Endpoints

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| `GET` | `/api/unsubscribe/:token` | `@SkipAuth()` — public | Consumes the token; always returns `{ "success": true, "message": "You've been unsubscribed successfully" }` |
| `GET` | `/api/notification-preferences` | Signed-in user | Current user's preferences |
| `PATCH` | `/api/notification-preferences` | Signed-in user | Updates them |

`/unsubscribe/` is `Disallow`ed in `robots.txt`, so a link pasted anywhere public will not be crawled — but a crawler that *does* fetch it would consume the token, which is why the page is disallowed rather than merely `noindex`ed.

---

## Related

- [Notifications](./notifications.md) - The notification inbox and the preference switches
- [Email Templates](./email-templates.md) - Every template type, including `OUTREACH`
- [The Applicant Experience](./applicant-experience.md) - Which emails a candidate receives, and when
- [Admin Panel](./admin-panel.md) - Where outreach campaigns are run from
- [Public Endpoints](../api/public-endpoints.md) - Unsubscribe and the email-tracking routes beside it
