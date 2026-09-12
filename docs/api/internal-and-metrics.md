# Internal and Metrics APIs

Two namespaces exist for machines rather than people: `/api/internal`, which lets deployment scripts and cron replacements trigger founder notifications, and `/api/metrics`, which exposes Prometheus and JSON telemetry. Neither uses a normal user login, and both fail closed when their environment variable is unset. This page documents the routes, the headers they expect and why they are guarded the way they are.

## Internal automation API (`/api/internal`)

### Authentication

Every route is wrapped in `InternalApiKeyGuard`, which compares the `x-api-key` request header to the `INTERNAL_API_KEY` environment variable.

```bash
curl -X POST https://api.borderlessats.com/api/internal/batch-summary \
  -H "x-api-key: $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

The guard reads the variable with `configService.getOrThrow()`, not `get(key, default)`. **If `INTERNAL_API_KEY` is unset, every internal request fails** rather than silently accepting a default string. That is deliberate: these endpoints send mail from the production sender, so an unset secret must not leave them open.

A wrong or missing header returns `401 Invalid or missing API key`.

### Routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/internal/batch-summary` | Email a batch summary with a testing checklist |
| `POST` | `/api/internal/deployment-notification` | Email a deployment success/failure notice |
| `POST` | `/api/internal/company-health/snapshot` | Capture a health snapshot for every company now |
| `POST` | `/api/internal/company-health/weekly-digest` | Evaluate and email the weekly health-degradation digest |

All four return `201` on success.

### Batch summary

```http
POST /api/internal/batch-summary
x-api-key: <INTERNAL_API_KEY>
Content-Type: application/json
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `batchName` | string | Yes | Non-empty |
| `issues` | object[] | Yes | Each item is `{ number, title, status }` |
| `issues[].number` | number | Yes | GitHub issue number |
| `issues[].title` | string | Yes | Non-empty |
| `issues[].status` | string | Yes | Non-empty, free-form (for example `completed`) |
| `testingChecklist` | string[] | Yes | One line per manual check |
| `additionalNotes` | string | No | Free text |

```json
{
  "batchName": "Batch 3 - Auth Features",
  "issues": [
    { "number": 270, "title": "Forgot password flow", "status": "completed" }
  ],
  "testingChecklist": [
    "Register new account -> check verification email received"
  ],
  "additionalNotes": "Deployed to production at 14:02 UTC"
}
```

`issues` must be objects. Sending an array of plain strings fails validation with a `400`.

**Response (201):**
```json
{ "message": "Notification sent successfully" }
```

### Deployment notification

```http
POST /api/internal/deployment-notification
```

| Field | Type | Required | Allowed values |
|-------|------|----------|----------------|
| `commitSha` | string | Yes | Short SHA |
| `commitMessage` | string | Yes | |
| `actor` | string | Yes | GitHub actor who triggered the deploy |
| `environment` | enum | Yes | `development`, `production` |
| `status` | enum | Yes | `success`, `failure` |
| `notes` | string | No | |

### Company health

```http
POST /api/internal/company-health/snapshot
POST /api/internal/company-health/weekly-digest
```

Neither takes a request body. Both do exactly the work their scheduled jobs already do — the snapshot job runs nightly at 04:00 and the digest job on Mondays at 08:00. The endpoints exist so the same work can be triggered on demand, for example to seed the first snapshots immediately after a deploy.

The weekly digest only sends mail when at least one company's health tier degraded compared with a week earlier; the response reports what it evaluated either way.

## Metrics API (`/api/metrics`)

Every route here was once unauthenticated. Between them they exposed candidate, application and job counts, active users broken down by role, AI spend, database pool state, memory and CPU figures and the Node version — enough to size the customer base and fingerprint the runtime. They are now split into two authentication models.

### Prometheus scrape endpoint

```http
GET /api/metrics
Authorization: Bearer <METRICS_TOKEN>
```

Returns the Prometheus text exposition format (`Content-Type: text/plain; version=0.0.4`). Business metrics are recomputed on each scrape.

`MetricsTokenGuard` uses a static bearer token rather than a JWT, because a scraper cannot log in. Like the internal guard it reads `METRICS_TOKEN` with `getOrThrow()`, so **an unset `METRICS_TOKEN` makes the route unreachable rather than open**. Comparison is constant time: both sides are SHA-256 hashed and compared with `timingSafeEqual`, which also avoids leaking the token length.

This endpoint is excluded from the Swagger documents and from the global IP rate limiter.

A Prometheus scrape config looks like:

```yaml
scrape_configs:
  - job_name: borderless
    metrics_path: /api/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['api.borderlessats.com']
```

### JSON metrics endpoints

| Method | Path | Auth | Returns |
|--------|------|------|---------|
| `GET` | `/api/metrics/json` | `@Auth(['SUPER_ADMIN'])` | Everything, grouped into `http`, `business`, `database`, `system`, `ai`, `cache` |
| `GET` | `/api/metrics/business` | `@Auth(['SUPER_ADMIN'])` | Application, job position, candidate, interview and active-user counts |
| `GET` | `/api/metrics/system` | `@Auth(['SUPER_ADMIN'])` | Memory, CPU, uptime, app version, `NODE_ENV`, Node version |

These use a normal bearer JWT and **do not** accept `METRICS_TOKEN`. A caller with a valid JWT but a lower role gets a `403`.

`GET /api/metrics/json` groups raw Prometheus metric names by prefix: `http_*` into `http`, `db_*` into `database`, `nodejs_*` into `system`, `ai_*` into `ai`, `cache_*` into `cache`, and the `applications_`, `job_positions_`, `candidates_`, `interviews_` and `active_users_` families into `business`.

## Environment variables

| Variable | Guard | Behaviour when unset |
|----------|-------|----------------------|
| `INTERNAL_API_KEY` | `InternalApiKeyGuard` | Every `/api/internal/*` request fails |
| `METRICS_TOKEN` | `MetricsTokenGuard` | `GET /api/metrics` rejects every request |

Both are listed in `recruiting-tool-backend/.env.example`.

## Related

- [Webhooks](./webhooks.md) — the third machine-to-machine surface, `/api/webhooks`
- [API Reference index](./index.md) — the full route namespace inventory
- [Configuration](../getting-started/configuration.md) — `INTERNAL_API_KEY` and `METRICS_TOKEN` in context
- [Production Guide](../deployment/production.md) — where these are set in the deployed stack
