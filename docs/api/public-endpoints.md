# Public Endpoints

This page lists every endpoint reachable without a bearer JWT, grouped by surface, with the mechanism that actually protects each one. Use it when you need to audit what an anonymous caller can touch — the answer is not obvious from the code, because authentication in this backend is opt-in rather than opt-out.

## How a route becomes public

There is **no global `AuthGuard`**. A handler is protected only when it or its controller carries the `@Auth([...])` decorator, which applies `AuthGuard` and `RolesGuard` together. Absence of that decorator means the route is reachable with no credentials at all.

```ts
@Auth([RolesType.HR])   // protected: JWT required, HR or above
@Get('secret')
getSecret() {}

@Get('open')            // public: no decorator, no guard
getOpen() {}
```

A second decorator, `@SkipAuth()`, sets the `IS_PUBLIC` metadata key that both `AuthGuard` and `RolesGuard` check first. It is needed only where the controller class itself is decorated, or where a guard would otherwise run — `/api/unsubscribe/:token` and the two `/api/tracking` routes use it explicitly.

Practical consequence: **adding a handler to a controller with no class-level `@Auth()` publishes it publicly by default.** Review new routes against this page.

## Public job board

| Method | Path | Protection | Notes |
|--------|------|-----------|-------|
| `GET` | `/api/job-position/public/all` | None | 10-minute `CacheInterceptor`; returns only `status: OPEN` **and** `moderationStatus: APPROVED` |
| `GET` | `/api/job-position/public/:uid` | None | 10-minute cache; same two filters; an invalid UID returns `404`, not `500` |
| `GET` | `/api/company/public/with-jobs` | None | 10-minute cache; companies with at least one approved, open posting |

See [Job Positions API](./job-positions.md) for the full parameter and response reference.

## Applying for a job

| Method | Path | Protection | Rate limit |
|--------|------|-----------|-----------|
| `POST` | `/api/files/upload-resume-public` | None | Global IP limiter only (no route override) |
| `POST` | `/api/applications` | None | **5 per hour per IP** |

The careers page uploads the resume first, then submits the application with the returned file UID as `resumeFileUid`. The upload route still enforces the 10 MB document cap and full magic-number validation — see [Files API](./files.md#upload-validation).

```http
POST /api/applications
Content-Type: application/json

{
  "jobPositionUid": "...",
  "applicantName": "Jane Doe",
  "applicantEmail": "jane@example.com",
  "applicantPhone": "+1-555-000-0000",
  "resumeFileUid": "...",
  "coverLetter": "..."
}
```

Exceeding 5 submissions in an hour returns `429`.

## Candidate status tracking (access code)

| Method | Path | Protection | Rate limit |
|--------|------|-----------|-----------|
| `GET` | `/api/public/status/:accessCode` | Access code in the path | 5 per minute per IP |
| `GET` | `/api/hiring-process/:uid/public?code=<accessCode>` | Access code in the `code` query parameter (required) | 30 per minute per IP |

Access codes are minted by `POST /api/hiring-process/:uid/generate-access-code` and emailed to the candidate. An invalid or expired code returns `404` on the first route and `401` on the second.

## Async stages (single-use token)

| Method | Path | Protection |
|--------|------|-----------|
| `GET` | `/api/public/async-stage/:token` | Submission token in the path |
| `POST` | `/api/public/async-stage/:token/submit` | Submission token |
| `GET` | `/api/public/async-stage/:token/files/:fileUid/download` | Submission token |

`GET /api/public/async-stage/:token` validates the token and returns the stage brief. Distinct failure codes make the state clear: `401` when the token is invalid or revoked, `410 Gone` when it has expired, `409` when the candidate has already submitted.

The submit route accepts `multipart/form-data` with an optional `textContent` field and up to **10 files of 100 MB each**. The download route returns `{ "url": "..." }` — a signed URL rather than the bytes.

## Interview self-booking (booking token)

| Method | Path | Protection |
|--------|------|-----------|
| `GET` | `/api/time-slots/available/:token` | Booking token |
| `GET` | `/api/time-slots/settings/:token` | Booking token |
| `POST` | `/api/time-slots/select/:token` | Booking token |

Booking tokens are created by the HR-only routes `POST /api/time-slots/booking-token/:interviewUid`, `POST /api/time-slots/send-booking-link/:interviewUid` and `POST /api/time-slots/send-stage-booking-link/:stageUid`. An expired or already-used token returns `403`; an unknown token returns `404`.

## Demo booking

| Method | Path | Protection |
|--------|------|-----------|
| `POST` | `/api/demo-booking/request` | None |
| `GET` | `/api/demo-booking/slots/:token` | Booking token |
| `GET` | `/api/demo-booking/settings/:token` | Booking token |
| `POST` | `/api/demo-booking/confirm/:token` | Booking token |

`POST /api/demo-booking/request` is fully open — it is the marketing site's "book a demo" form. It emails the requester a tokenised link; the other three routes require that token.

## Email tracking and unsubscribe

| Method | Path | Protection | Notes |
|--------|------|-----------|-------|
| `GET` | `/api/unsubscribe/:token` | Unsubscribe token, `@SkipAuth()` | Returns `{ "success": true, "message": "You've been unsubscribed successfully" }` |
| `GET` | `/api/tracking/open/:leadUid` | Lead UID, `@SkipAuth()` | Open pixel |
| `GET` | `/api/tracking/click/:leadUid` | Lead UID, `@SkipAuth()` | Click redirect |

`/api/tracking` is in `THROTTLE_EXEMPT_PREFIXES`: a corporate mail gateway prefetching links for many recipients would otherwise hit the limiter from one IP.

## Marketing and account entry points

| Method | Path | Protection | Rate limit |
|--------|------|-----------|-----------|
| `POST` | `/api/contact` | None | Global IP limiter |
| `POST` | `/api/auth/register` | None | 3 per hour per IP |
| `POST` | `/api/auth/sign-in` | None | 5 per 15 minutes per IP |
| `POST` | `/api/auth/forgot-password` | None | 3 per 15 minutes per IP |
| `POST` | `/api/auth/reset-password` | Reset token in the body | 5 per 15 minutes per IP |
| `GET` | `/api/auth/verify-email?token=` | Verification token | `@SkipThrottle()` |
| `POST` | `/api/auth/refresh` | Refresh token in the body | 30 per minute |
| `POST` | `/api/auth/logout` | Refresh token in the body | `@SkipThrottle()` |
| `GET` | `/api/quota/plan-limits` | None | Global IP limiter |

`POST /api/auth/forgot-password` always returns a success message, whether or not the address exists, to prevent email enumeration. See [Authentication](./authentication.md).

## Files served without a JWT

| Method | Path | Protection |
|--------|------|-----------|
| `GET` | `/api/files/:uid/view` | None — but restricted by the service |

This route exists because an avatar rendered with a bare `<img src>` cannot send an `Authorization` header. `FilesService.getPublicViewableFile()` serves **only** images with no candidate, application or submission link; every private document returns `404`. Private files are viewed through the authenticated `GET /api/files/:uid/view-url` instead.

## Operational routes

| Method | Path | Protection |
|--------|------|-----------|
| `GET` | `/api` | None — `AppController` connection test |
| `GET` | `/api/health` | None |
| `GET` | `/api/health/liveness` | None, throttle-exempt |
| `GET` | `/api/health/readiness` | None, throttle-exempt |
| `GET` | `/api/health/database` | None |
| `GET` | `/api/health/storage` | None |
| `GET` | `/api/health/email` | None |
| `GET` | `/api/health/database/pool` | None |
| `GET` | `/api/health/detailed` | `@Auth(['SUPER_ADMIN'])` |

`/api/health/detailed` is the only health route that requires a login.

## Key-authenticated machine surfaces

These need no user account, but they are not open. Each has its own shared-secret guard.

| Prefix | Header | Variable | Reference |
|--------|--------|----------|-----------|
| `/api/v1/*` | `X-API-Key` | Per-company key, `blss_live_...` | [Public API](./public-api.md) |
| `/api/internal/*` | `x-api-key` | `INTERNAL_API_KEY` | [Internal and Metrics](./internal-and-metrics.md) |
| `/api/webhooks/*` | `x-api-key` or `?apiKey=` | `WEBHOOK_API_KEY` | [Webhooks](./webhooks.md) |
| `/api/metrics` | `Authorization: Bearer` | `METRICS_TOKEN` | [Internal and Metrics](./internal-and-metrics.md) |
| `/api/billing/webhook` | `webhook-signature` and two more headers | `DODO_PAYMENTS_WEBHOOK_KEY` | [Billing](./billing.md) |

## Related

- [Authentication](./authentication.md) — the `@Auth()` role ladder these routes sit outside of
- [Job Positions API](./job-positions.md) — the public job board in detail
- [Files API](./files.md) — upload validation and the signed-URL model
- [Rate Limiting](../../recruiting-tool-backend/docs/RATE_LIMITING.md) — the throttler configuration behind every limit quoted here
- [API Reference index](./index.md)
