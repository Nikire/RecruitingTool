# API Reference

This page is the map of every HTTP surface Borderless ATS exposes. Use it to find out whether a route namespace exists, how it is authenticated, and which page documents it. The backend is a single NestJS application with 64 controllers; only a subset has a written reference page, so the table below marks each namespace as documented or not.

## Base URL and global prefix

`main.ts` calls `app.setGlobalPrefix('api')`, so **every** route in the application is served under `/api`.

| Environment | Base URL |
|-------------|----------|
| Local Docker | `http://localhost:4000/api` |
| Production | `https://api.borderlessats.com/api` |

## Interactive documentation

There are two separate Swagger documents, built from two `SwaggerModule.setup()` calls in `main.ts`. They are not the same document with different filters — they are different OpenAPI specs for different audiences.

| URL | Title | Scope | Auth scheme |
|-----|-------|-------|-------------|
| `/api/internal-docs` | BorderLess Internal API | Every controller in the app | `addBearerAuth()` — a local JWT |
| `/api/docs` | Borderless ATS Public API | `PublicApiModule` only (`/api/v1/*`) | `X-API-Key` header, keys shaped `blss_live_...` |

`/api` on its own is the global prefix, not a docs route — a `GET /api` returns the `AppController` connection-test string.

## Authentication mechanisms

Six different mechanisms guard routes in this application. Which one applies depends entirely on the decorators on the handler.

| Mechanism | Applied by | Used by |
|-----------|-----------|---------|
| Local JWT + role ladder | `@Auth([...])` (`AuthGuard` + `RolesGuard`) | The whole first-party app surface |
| Public API key | `ApiKeyAuthGuard` (`X-API-Key`) | `/api/v1/*` |
| Internal API key | `InternalApiKeyGuard` (`x-api-key` = `INTERNAL_API_KEY`) | `/api/internal/*` |
| Webhook API key | `WebhookAuthGuard` (`x-api-key` = `WEBHOOK_API_KEY`) | `/api/webhooks/*` |
| Static bearer token | `MetricsTokenGuard` (`METRICS_TOKEN`) | `GET /api/metrics` |
| Single-use / access-code tokens | Service-level token lookup | Candidate-facing links (booking, async stages, unsubscribe) |

**Authentication is opt-in.** There is no global `AuthGuard`; a handler is protected only when it carries `@Auth()`. A controller or handler with no `@Auth()` decorator is reachable with no credentials at all. See [Public Endpoints](./public-endpoints.md) for the full list of what that leaves open.

## Route namespace inventory

Prefixes are taken from the `@Controller()` decorators. Prepend `/api` to every path.

### First-party application API (local JWT)

| Prefix | Module | Documented |
|--------|--------|-----------|
| `auth` | Authentication, refresh tokens, social login, account recovery | [authentication.md](./authentication.md) |
| `users` | User CRUD and activity | No |
| `profile` | Current user's own profile | No |
| `company` | Company CRUD, company profile, public company list | No (public route in [public-endpoints.md](./public-endpoints.md)) |
| `companies/:companyUid/roles` | Company-scoped role delegation | Partially — see [authentication.md](./authentication.md) |
| `companies/:companyUid/invitations`, `invitations/accept/:token` | Team invitations | No |
| `connection-requests` | Company connection requests | No |
| `client` | End clients that roles are filled for | No |
| `candidate` | Candidate records, notes, journey | [candidates.md](./candidates.md) |
| `job-position` | Job postings and template stages | [job-positions.md](./job-positions.md) |
| `admin/job-moderation` | Platform moderation of job postings | No |
| `hiring-process` | Multi-stage hiring workflows | [hiring-process.md](./hiring-process.md) |
| `stages` | Stages and stage notes | [hiring-process.md](./hiring-process.md) |
| `hiring-processes/:hiringProcessUid/stages/:stageUid/note` | Single upsert-style stage note | [hiring-process.md](./hiring-process.md) |
| `async-stage`, `public/async-stage` | Take-home style stages | No (public half in [public-endpoints.md](./public-endpoints.md)) |
| `applications` | Job applications | No (public submit in [public-endpoints.md](./public-endpoints.md)) |
| `interview` | Interview scheduling | No |
| `time-slots` | Candidate self-service interview booking | No (public half in [public-endpoints.md](./public-endpoints.md)) |
| `hr-schedule` | Recruiter availability | No |
| `calendar` | Internal calendar views | No |
| `google-calendar` | Google Calendar OAuth and sync | No |
| `company-calendar-settings` | Booking-window configuration | No |
| `scorecard` | Structured interview scorecards | No — backend only, no UI renders it |
| `files` | Uploads, downloads, storage quota | [files.md](./files.md) |
| `email` | Ad-hoc email sending | No |
| `email-templates` | Company email templates | No |
| `notifications` | In-app notifications | No |
| `notification-preferences` | Per-user notification opt-outs | No |
| `sse` | Server-sent event stream | No |
| `analytics` | Hiring metrics | No |
| `export` | CSV / data export | No |
| `audit-log` | Audit trail | No |
| `ai` | Gemini resume parsing, scoring, comparison | [ai.md](./ai.md) |
| `ai-quota` | Per-company AI quota and usage history | [ai.md](./ai.md) |
| `quota` | Plan limits and current usage | [ai.md](./ai.md) |
| `billing` | Dodo Payments checkout, subscription, invoices | [billing.md](./billing.md) |
| `api-keys` | Issue and revoke Public API keys | [api-keys.md](./api-keys.md) |
| `release-notes` | In-app release notes | No |
| `feedback` | In-app feedback submissions | No |
| `outreach-campaigns` | Outbound email campaigns | No |
| `prospect-tracking` | Prospect pipeline | No |
| `admin-tasks` | Founder task board | No |
| `admin` | Platform administration | No |
| `admin/deleted` | Soft-deleted record recovery | No |
| `admin/plan-limits` | Per-plan quota configuration | No |
| `admin/feature-flags` | Feature flag administration | No |
| `admin/system-settings` | Runtime system settings | No |
| `admin/custom-plans` | Bespoke per-company plans | No |

### Developer Public API (API key)

| Prefix | Documented |
|--------|-----------|
| `v1/candidates` | [public-api.md](./public-api.md) |
| `v1/job-positions` | [public-api.md](./public-api.md) |
| `v1/applications` | [public-api.md](./public-api.md) |
| `v1/webhooks` | [webhooks.md](./webhooks.md) |

### Machine-to-machine and operational

| Prefix | Auth | Documented |
|--------|------|-----------|
| `internal` | `x-api-key` = `INTERNAL_API_KEY` | [internal-and-metrics.md](./internal-and-metrics.md) |
| `metrics` | `METRICS_TOKEN` bearer (scrape) or SUPER_ADMIN JWT (JSON) | [internal-and-metrics.md](./internal-and-metrics.md) |
| `webhooks` | `x-api-key` = `WEBHOOK_API_KEY` (inbound n8n receiver) | [webhooks.md](./webhooks.md) |
| `health` | Mostly none; `health/detailed` requires SUPER_ADMIN | No |
| `backup` | JWT | No |

### Unauthenticated / token-authenticated

| Prefix | Purpose | Documented |
|--------|---------|-----------|
| `job-position/public/*` | Public job board | [public-endpoints.md](./public-endpoints.md) |
| `company/public/with-jobs` | Company filter on the job board | [public-endpoints.md](./public-endpoints.md) |
| `public/status/:accessCode`, `hiring-process/:uid/public` | Candidate status tracking | [public-endpoints.md](./public-endpoints.md) |
| `public/async-stage/*` | Candidate async-stage submission | [public-endpoints.md](./public-endpoints.md) |
| `demo-booking` | Sales demo booking | [public-endpoints.md](./public-endpoints.md) |
| `unsubscribe/:token` | Email unsubscribe | [public-endpoints.md](./public-endpoints.md) |
| `tracking/open/:leadUid`, `tracking/click/:leadUid` | Email open and click pixels | [public-endpoints.md](./public-endpoints.md) |
| `contact` (POST) | Marketing contact form | [public-endpoints.md](./public-endpoints.md) |
| `` (root) | `GET /api` connection test | — |

## Response envelope and errors

A global `ResponseInterceptor` wraps successful first-party responses, and `PrismaExceptionFilter` plus `HttpExceptionFilter` normalise errors. The Public API is the exception: every `/api/v1/*` controller declares `@UseFilters(PublicApiExceptionFilter)`, which returns its own `{ "error": { "code", "message", "details" } }` shape instead. See [Public API](./public-api.md#error-format).

## Rate limiting

A global `CustomThrottlerGuard` applies `THROTTLE_LIMIT` requests (default 100) per `THROTTLE_TTL` milliseconds (default 60000) per IP. Individual handlers override this with `@Throttle(...)`, and the following prefixes are exempt entirely:

```text
/api/sse
/api/billing/webhook
/api/webhooks
/api/tracking
/api/health/liveness
/api/health/readiness
/api/metrics
```

Setting `THROTTLE_DISABLED=true` or `NODE_ENV=test` disables the global limiter.

## Related

- [Authentication](./authentication.md) — JWT lifetimes, roles and every `/auth` route
- [Public API](./public-api.md) — the API-key authenticated `/api/v1` surface
- [Public Endpoints](./public-endpoints.md) — everything reachable without a JWT
- [Configuration](../getting-started/configuration.md) — every environment variable named above
- [Documentation home](../index.md)
