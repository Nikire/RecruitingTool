# Configuration Guide

This guide covers all configuration options for BorderLess, including environment variables, database settings, and third-party integrations.

## Environment Variables Reference

### Root Environment Variables (`.env`)

These variables are interpolated by Docker Compose into `docker-compose.yml`. Only variables that
`docker-compose.yml` actually references have any effect here - backend settings belong in
`recruiting-tool-backend/.env`, which the backend service loads through `env_file`.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | PostgreSQL username | - | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Yes |
| `API_PORT` | Host and container port for the backend | `4000` | No |
| `VITE_PORT` | Host port mapped to the frontend container's port 80 | `5137` | No |
| `PGADMIN_EMAIL` | pgAdmin login email (`tools` profile) | - | Only with `--profile tools` |
| `PGADMIN_PASSWORD` | pgAdmin login password (`tools` profile) | - | Only with `--profile tools` |
| `MINIO_ROOT_USER` | MinIO admin username | `minioadmin` | No |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | `minioadmin` | No |
| `N8N_USER` | n8n login username | `admin` | No |
| `N8N_PASSWORD` | n8n login password | `admin123` | No |
| `N8N_HOST` | n8n host URL | `localhost` | No |
| `STRIPE_SECRET_KEY` | API key for the `stripe-cli` service (`stripe` profile only) | - | Only with `--profile stripe` |

The frontend build arguments (`VITE_API_URL`, `VITE_AUTH0_*`, `VITE_POSTHOG_*`, `VITE_SENTRY_*`,
`VITE_APP_VERSION`) are also read from this file - see
[Frontend Environment Variables](#frontend-environment-variables-build-time) below for why they must
be set here and not in the frontend's own `.env`.

> **Note:** `WEBHOOK_API_KEY` appears in the root `.env.example` but `docker-compose.yml` never
> references it. The backend reads it from `recruiting-tool-backend/.env`.

### Backend Environment Variables (`recruiting-tool-backend/.env`)

#### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `4000` | No |
| `NODE_ENV` | Environment mode. `production` makes the exception filters strip messages and stack traces from responses; `test` disables the throttler | `development` | Yes in production |
| `FRONTEND_URL` | The single allowed CORS origin, and the base URL used in outgoing email links | - | Yes |
| `APP_BASE_URL` | Base URL embedded in outreach tracking and unsubscribe links | `https://api.borderlessats.com` | No |
| `DUMMY_DATA_ENABLED` | `true` registers `DummyModule` and seeds demo data on boot. Must be `false` (or unset) in production | unset | No |

#### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `DATABASE_POOL_MIN` | Minimum connections | `2` | No |
| `DATABASE_POOL_MAX` | Maximum connections | `10` | No |
| `DATABASE_POOL_ACQUIRE_TIMEOUT` | Timeout for acquiring connection (ms) | `60000` | No |
| `DATABASE_POOL_IDLE_TIMEOUT` | Timeout before closing idle connection (ms) | `600000` | No |
| `DATABASE_POOL_MAX_LIFETIME` | Max connection lifetime (ms) | `1800000` | No |
| `DATABASE_POOL_LOGGING` | Enable pool logging | `false` | No |

**Connection Pooling Best Practices:**
- Development: `DATABASE_POOL_MAX=10`
- Production: `DATABASE_POOL_MAX=20`
- See [Database Architecture](../../.claude/docs/DATABASE.md#connection-pooling) for sizing guidelines

#### Authentication Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRATION` | JWT token expiration | `1d` | No |
| `ADMIN_NAME` | Default admin user name | - | Yes |
| `ADMIN_EMAIL` | Default admin email | - | Yes |
| `ADMIN_PASSWORD` | Default admin password | - | Yes |

**Security Notes:**
- Use a strong random string for `JWT_SECRET` (minimum 32 characters)
- Change `ADMIN_PASSWORD` immediately after first login
- Never commit credentials to version control

#### File Storage Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `S3_ENDPOINT` | Endpoint the backend container talks to | `http://minio:9000` | No |
| `S3_PUBLIC_ENDPOINT` | Endpoint written into browser-facing file URLs | `http://localhost:9000` | Yes in production |
| `S3_BUCKET_NAME` | Bucket name | `recruiting-tool-files` | No |
| `S3_ACCESS_KEY_ID` | Access key | `minioadmin` | No |
| `S3_SECRET_ACCESS_KEY` | Secret key | `minioadmin` | No |
| `S3_REGION` | Region | `us-east-1` | No |
| `S3_FORCE_PATH_STYLE` | `true` enables path-style URLs (required for MinIO) | `false` | Yes for MinIO |
| `STORAGE_TYPE` | Reported by the admin System Settings screen only | `minio` | No |

**About `S3_ENDPOINT` vs `S3_PUBLIC_ENDPOINT`:** `StorageService` always speaks the S3 protocol
through the AWS SDK, whether the target is MinIO or AWS S3 - there is no separate "local" driver, and
`STORAGE_TYPE` does not switch anything (it is only echoed back by
`GET /api/admin/system-settings`). `S3_ENDPOINT` is the in-network address used for uploads;
`S3_PUBLIC_ENDPOINT` is the address baked into public and signed URLs handed to the browser. These
differ in any deployment where MinIO is not directly reachable from the internet: leave
`S3_ENDPOINT` pointing at `http://minio:9000` and set `S3_PUBLIC_ENDPOINT` to whatever public
address your reverse proxy exposes for the object store.

#### Email Configuration (Resend)

There is no SendGrid dependency in the backend. `EmailService` initialises a nodemailer transport
from the `SMTP_*` variables, but every outgoing message is actually sent with a direct HTTP
`POST https://api.resend.com/emails`, using `SMTP_PASSWORD` as the `Authorization: Bearer` token.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_ENABLED` | `'true'` sends mail. Anything else logs the message to the backend console instead | `false` | Yes to send mail |
| `SMTP_HOST` | nodemailer transport host. Not used on the Resend path | - | No |
| `SMTP_PORT` | nodemailer transport port (`465` selects TLS). Not used on the Resend path | `587` | No |
| `SMTP_USER` | nodemailer transport user. Not used on the Resend path | - | No |
| `SMTP_PASSWORD` | **The Resend API key** (`re_...`), sent as the bearer token | - | Yes to send mail |
| `EMAIL_FROM` | From address on every message | `noreply@borderlessats.com` | No |
| `EMAIL_ADMIN_BCC` | Blind-copies every outgoing message to this address (skipped when it equals the recipient) | - | No |
| `EMAIL_REPLY_TO` | Reply-to address on outreach campaign mail only | - | No |
| `ENABLE_APPLICATION_EMAILS` | `'false'` suppresses applicant-facing emails while leaving the rest enabled | `true` | No |
| `HR_NOTIFICATION_EMAIL` | Address notified when a new public application arrives | - | No |

**Emails the app sends:**
- Application confirmations and status changes
- Interview scheduled, cancelled, rescheduled and reminder notices
- Booking invitations, booking confirmations and HR booking notifications
- Async stage invitations and submission receipts
- Welcome emails, team invitations and password resets

**To enable emails:**
1. Verify your sending domain at [Resend](https://resend.com) (SPF, DKIM and DMARC records).
2. Create a **Sending access** API key; it starts with `re_`.
3. Set `SMTP_ENABLED=true` and put the key in `SMTP_PASSWORD`.
4. Set `EMAIL_FROM` to an address on the verified domain.
5. Restart the backend.

Every attempt is written to the `EmailLog` table whether or not `SMTP_ENABLED` is on, so that table
is the first place to look when a message does not arrive.

**Delivery events:** Resend posts delivery webhooks to `POST /api/email/webhooks/resend`
(`email.delivered`, `email.opened`, `email.bounced`, `email.complained`). This route is
**unauthenticated** - it accepts any well-formed body - and matches events to rows in `EmailLog` by
the Resend message id stored in `resendEmailId`.

**See:** [External APIs - Production Activation](../EXTERNAL_APIS_PRODUCTION.md#1-resend-email) for
the full production walkthrough.

> **Note:** the root `.env.example` still lists `SMTP_PASS`, `SMTP_FROM` and `SMTP_SECURE`. The
> backend reads none of those names - use `SMTP_PASSWORD` and `EMAIL_FROM` in
> `recruiting-tool-backend/.env`.

#### Webhook and Internal API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WEBHOOK_API_KEY` | Checked by `WebhookAuthGuard` against the `x-api-key` header (or an `?apiKey=` query parameter) on `/api/webhooks/*`. The guard rejects every request while it is unset | - | Yes to use `/api/webhooks` |
| `INTERNAL_API_KEY` | Checked by `InternalApiKeyGuard` against the `x-api-key` header on `/api/internal/*`. Read with `getOrThrow`, so **every** internal request fails while it is unset | - | Yes |
| `METRICS_TOKEN` | Bearer token for `GET /api/metrics` (Prometheus text format). **Fails closed**: with the variable unset, every request to that route is rejected | - | Yes to scrape metrics |
| `N8N_OUTREACH_WEBHOOK_URL` | Outbound URL the outreach campaign service posts to. No call is made when unset | - | No |

`/api/webhooks` is inbound automation (n8n and similar callers). `/api/internal` is the
machine-to-machine surface used by the deploy pipeline and internal tooling. The JSON metrics routes
(`/api/metrics/json`, `/business`, `/system`) do **not** use `METRICS_TOKEN` - they require a
`SUPER_ADMIN` JWT.

#### Observability

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SENTRY_DSN` | Sentry project DSN. When unset the SDK is never initialised, no network calls are made, and every capture is a no-op. Only HTTP 5xx and unhandled exceptions are reported - 4xx validation errors are deliberately excluded | - | No |

#### AI (Google Gemini)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key. Without it the AI endpoints throw `AI API is not configured` | - | Yes for AI features |
| `GEMINI_MODEL` | Model id | `gemini-1.5-flash` | No |
| `GEMINI_TIER` | `free` throttles the service to 12 requests/min with a 5 s minimum gap and 3 retries; `paid` allows 360 requests/min with a 167 ms gap and 5 retries | `free` | No |

#### Auth0 Social Login (Optional)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AUTH0_DOMAIN` | Auth0 tenant domain. Used for the JWKS URI (`https://<domain>/.well-known/jwks.json`) and the expected issuer | - | No |
| `AUTH0_CLIENT_ID` | Auth0 application client id. Also the **audience** the strategy verifies, because the ID token's audience is the client id | - | No |
| `AUTH0_AUDIENCE` | Present in `.env.example` but **read nowhere** in the backend | - | No |

`Auth0Strategy` treats Auth0 as configured only when both `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` are
set. Leave them unset to run without Auth0; the app's own JWT login is unaffected.

#### Payments (Dodo Payments)

The registered billing module is `DodoPaymentsModule`, serving `/api/billing`. There is no Stripe
controller in the backend.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DODO_PAYMENTS_API_KEY` | Dodo Payments API key. Billing endpoints are disabled without it | - | Yes for billing |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Signing secret used to verify `POST /api/billing/webhook` | - | Yes for billing |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` | `test_mode` | No |
| `DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID` | Product id for the monthly Professional plan | - | Yes for billing |
| `DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID` | Product id for the annual Professional plan | - | Yes for billing |
| `DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID` | Product id for the monthly Enterprise plan | - | Yes for billing |
| `DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID` | Product id for the annual Enterprise plan | - | Yes for billing |
| `DODO_PAYMENTS_PRO_TRIAL_DAYS` | Trial length applied at checkout, overriding whatever the product carries. `0` sells without a trial | `14` | No |

#### Google Calendar

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client id | - | Yes for calendar sync |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret | - | Yes for calendar sync |
| `GOOGLE_REDIRECT_URI` | Must match the redirect URI registered in Google Cloud Console | - | Yes for calendar sync |

#### Backups

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BACKUP_ENABLED` | `'true'` runs the scheduled backup job | `false` | No |
| `BACKUP_CRON` | Cron expression for the backup job | `0 2 * * *` | No |
| `BACKUP_RETENTION_DAYS` | Days of backups to keep | `30` | No |
| `BACKUP_PATH` | Directory inside the container where dumps are written (the `backup_data` volume is mounted at `/backups`) | `/backups` | No |
| `MINIO_DATA_PATH` | MinIO data directory included in file backups | `/data/minio` | No |
| `BACKUP_SCHEDULE` | Read **only** by the admin System Settings screen, which reports it as the backup schedule. The job itself uses `BACKUP_CRON` | - | No |

> **Gotcha:** setting `BACKUP_SCHEDULE` changes nothing about when backups run. Set `BACKUP_CRON`.
> If you want the admin screen to show the right value, set both to the same expression.

#### Rate Limiting Variables

See [Rate Limiting](#rate-limiting) below for how these are applied.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `THROTTLE_TTL` | Window for the single global throttler, in milliseconds | `60000` | No |
| `THROTTLE_LIMIT` | Requests allowed per window per (IP, route) | `100` | No |
| `THROTTLE_DISABLED` | `'true'` disables the global throttler completely. Development and CI only | `false` | No |
| `THROTTLE_AUTH_TTL` / `THROTTLE_AUTH_LIMIT` | Reported by the admin System Settings screen only - they do **not** change enforcement | `900000` / `5` | No |
| `THROTTLE_AI_TTL` / `THROTTLE_AI_LIMIT` | Reported by the admin System Settings screen only - they do **not** change enforcement | `60000` / `10` | No |

> **Gotcha:** `THROTTLE_REGISTER_TTL`, `THROTTLE_REGISTER_LIMIT`, `THROTTLE_APPLICATION_TTL` and
> `THROTTLE_APPLICATION_LIMIT` appear in `.env.example` but are read nowhere in the backend.

#### Scheduled Jobs

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `COMPANY_HEALTH_JOBS_ENABLED` | Set to the literal string `'false'` to switch off the company-health background jobs. Any other value (including unset) leaves them on | unset (enabled) | No |

### Frontend Environment Variables (Build Time)

**Vite inlines every `import.meta.env.VITE_*` value when the bundle is compiled.** In Docker that
means these must be passed as `build.args` on the `frontend` service in `docker-compose.yml` (which
reads them from the **root** `.env`), and as repository secrets consumed by
`.github/workflows/deploy-prod.yml`. Putting them in `recruiting-tool-frontend/.env` works for
`yarn dev` and a local `yarn build`, but in Docker that file only reaches the nginx runtime
container, which serves assets that were already compiled - so setting them there, or on a running
container, has no effect.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api` (compose build arg) | Yes |
| `VITE_PORT` | Dev-server port for `yarn dev`. The Docker host port comes from the root `.env` | `3000` | No |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain. Social login is hidden unless this and the client id are both set | - | No |
| `VITE_AUTH0_CLIENT_ID` | Auth0 application client id | - | No |
| `VITE_AUTH0_AUDIENCE` | Wired through the Dockerfile and the deploy workflow as a build arg, but **not currently read** by any frontend source file | - | No |
| `VITE_POSTHOG_KEY` | PostHog public project key. Unset means zero PostHog network calls and every `track()`/`identify()` is a silent no-op | - | No |
| `VITE_POSTHOG_HOST` | PostHog ingestion host | `https://eu.i.posthog.com` | No |
| `VITE_SENTRY_DSN` | Sentry DSN. Unset means the SDK is never initialised | - | No |
| `VITE_SENTRY_ENVIRONMENT` | Environment tag on every event | the Vite mode | No |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | Performance tracing sample rate, `0`-`1` | `0` (tracing off) | No |
| `VITE_APP_VERSION` | Release identifier used to group Sentry events. The deploy workflow passes the commit SHA | - | No |

> **Note:** the default PostHog host in `src/analytics/analytics.ts` is the **EU** cloud
> (`https://eu.i.posthog.com`). Set `VITE_POSTHOG_HOST` explicitly if your project lives on the US
> cloud.

## Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruiting_tool_db?schema=public&connection_limit=10&pool_timeout=60"
```

**Parameters:**
- `schema` - Database schema (default: `public`)
- `connection_limit` - Max connections in pool
- `pool_timeout` - Timeout for acquiring connection (seconds)
- `connect_timeout` - Connection establishment timeout (seconds)

### Using PgBouncer (Production)

PgBouncer is declared in `docker-compose.yml` with `profiles: [tools]`, so a plain
`docker-compose up -d` does **not** start it. It is a compose profile, not a commented-out block.

1. Start the service with its profile:
```bash
docker-compose --profile tools up -d pgbouncer
```

2. Point `DATABASE_URL` at PgBouncer instead of the database. The backend service overrides
   `DATABASE_URL` in `docker-compose.yml`, so change it there (an alternative value is already
   present as a commented `OPTION 2` line):
```bash
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6432/recruiting_tool_db?schema=public"
```

3. Optionally uncomment the `pgbouncer` entry under the backend's `depends_on` so the backend waits
   for PgBouncer's health check.

4. Recreate the backend:
```bash
docker-compose --profile tools up -d --build backend
```

**PgBouncer configuration set in `docker-compose.yml`:**

| Setting | Value |
|---------|-------|
| `PGBOUNCER_POOL_MODE` | `transaction` (best fit for Prisma) |
| `PGBOUNCER_MAX_CLIENT_CONN` | `100` |
| `PGBOUNCER_DEFAULT_POOL_SIZE` | `20` |
| `PGBOUNCER_MIN_POOL_SIZE` | `5` |
| `PGBOUNCER_RESERVE_POOL_SIZE` | `5` |
| `PGBOUNCER_MAX_DB_CONNECTIONS` | `20` |
| `PGBOUNCER_VERBOSE` | `0` |

Host port: `6432`. Container name: `recruiting_pgbouncer`.

pgAdmin is behind the same `tools` profile and is started the same way
(`docker-compose --profile tools up -d pgadmin`).

## File Storage Configuration

### MinIO (Self-Hosted S3)

**Default setup for development:**

```bash
# Backend .env
S3_ENDPOINT=http://minio:9000
S3_PUBLIC_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=recruiting-tool-files
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

**Access MinIO Console:**
- URL: http://localhost:9001
- Username: `minioadmin` (from `MINIO_ROOT_USER`)
- Password: `minioadmin` (from `MINIO_ROOT_PASSWORD`)

### AWS S3 (Production)

**For production deployments:**

```bash
# Backend .env
S3_ENDPOINT=https://s3.amazonaws.com
S3_PUBLIC_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=your-production-bucket
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=false
```

**AWS S3 Setup:**
1. Create S3 bucket
2. Create IAM user with S3 permissions
3. Generate access key
4. Update environment variables
5. Restart backend

**Required IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## Email Notification Configuration

### Resend Setup

1. **Create a Resend account** at https://resend.com.

2. **Verify your sending domain**:
   - **Domains** → **Add Domain**
   - Add the SPF, DKIM and DMARC records Resend shows to your DNS registrar
   - Wait for the status to read **Verified**

3. **Generate an API key**:
   - **API Keys** → **Create API Key**
   - Permission: **Sending access** (never Full Access for an app secret)
   - Copy the key - it starts with `re_` and is shown once

4. **Update environment variables** in `recruiting-tool-backend/.env`:
```bash
SMTP_ENABLED=true
SMTP_PASSWORD=re_xxxxxxxxxxxxxxxxxxxx   # the Resend API key
EMAIL_FROM=noreply@yourcompany.com      # must be on the verified domain
EMAIL_ADMIN_BCC=admin@yourcompany.com   # optional blind copy of every message
```

5. **Restart the backend**:
```bash
docker-compose restart backend
```

6. **Optional - receive delivery events**: in Resend, add a webhook endpoint pointing at
   `https://<your-api-host>/api/email/webhooks/resend` and subscribe to `email.delivered`,
   `email.opened`, `email.bounced` and `email.complained`.

With `SMTP_ENABLED=false` the backend logs each message to stdout under an
`========== EMAIL (Development Mode) ==========` banner and sends nothing.

### Email Templates

Email templates are managed in the application:
- Navigate to **Admin Panel** → **Email Templates**
- Create custom templates for:
  - Application confirmations
  - Interview invitations
  - Interview cancellations
  - Status change notifications

**Available Variables:**
- `{{candidateName}}` - Candidate's full name
- `{{positionTitle}}` - Job position title
- `{{companyName}}` - Company name
- `{{hrName}}` - HR contact name
- `{{interviewDate}}` - Interview date
- `{{interviewTime}}` - Interview time
- `{{meetingLink}}` - Meeting link (Zoom, Google Meet, etc.)

## Third-Party Integrations

### n8n Workflow Automation

n8n is included for workflow automation (optional).

**Access n8n:**
- URL: http://localhost:5678
- Username: `admin` (from `N8N_USER`)
- Password: `admin123` (from `N8N_PASSWORD`)

**Example Workflows:**
- Slack notifications on new applications
- Zapier-like automation
- Custom webhook integrations

**See:** [N8N Integration Guide](../../.claude/docs/N8N_INTEGRATION.md)

### Google Calendar Integration

For interview scheduling with Google Calendar:

1. Create Google Cloud Project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Update backend configuration

**See:** [Google Calendar Setup](../../.claude/docs/GOOGLE_CALENDAR_SETUP.md)

### Dodo Payments (Subscriptions and Billing)

Billing is served by `DodoPaymentsModule` at `/api/billing`:

| Route | Purpose |
|-------|---------|
| `POST /api/billing/checkout` | Start a checkout session |
| `GET /api/billing/subscription` | Current subscription for the caller's company |
| `POST /api/billing/cancel` | Cancel the subscription |
| `POST /api/billing/customer-portal` | Open the hosted customer portal |
| `GET /api/billing/invoices` | Invoice history |
| `POST /api/billing/webhook` | Inbound Dodo webhook (signature verified, exempt from the global throttler) |

```bash
# Backend .env
DODO_PAYMENTS_API_KEY=your_dodo_api_key
DODO_PAYMENTS_WEBHOOK_KEY=whsec_your_webhook_secret
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID=pdt_...
DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID=pdt_...
DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID=pdt_...
DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID=pdt_...
```

Every billing endpoint returns `Dodo Payments is not configured` until `DODO_PAYMENTS_API_KEY` is
set.

> **About Stripe:** the `stripe` package is still a backend dependency and `docker-compose.yml`
> still carries a `stripe-cli` service behind `profiles: [stripe]`, but **no Stripe controller
> exists**. That service forwards to `http://backend:4000/api/stripe/webhook`, a route the backend
> does not serve. `STRIPE_*` variables have no effect on the application.

## CORS Configuration

CORS is configured in backend to allow frontend requests.

**Backend CORS Settings** (`src/main.ts`):
```typescript
app.enableCors({
  origin: FRONTEND_URL,
  credentials: true,
});
```

There is no fallback value: whatever `FRONTEND_URL` holds is the only allowed origin, and leaving it
unset hands `undefined` to the CORS middleware. Set it explicitly in every environment.

**To allow multiple origins:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://yourproductiondomain.com',
  ],
  credentials: true,
});
```

## Rate Limiting

`CustomThrottlerGuard` is installed globally as an `APP_GUARD`. There is exactly **one** throttler,
named `default`, configured in `src/app.module.ts`:

| Setting | Env var | Default in code | Value in `.env.example` |
|---------|---------|-----------------|-------------------------|
| Window | `THROTTLE_TTL` | `60000` ms | `900000` ms |
| Requests per window | `THROTTLE_LIMIT` | `100` | `500` |

**How requests are counted:** the tracker key is `<client IP>-<route path>`, so the budget is per
(IP, route), not per user. The IP comes from the first entry in `X-Forwarded-For`, falling back to
`req.ip`. Everyone behind one office NAT therefore shares a single bucket on each route.

**Per-route overrides** come from `@Throttle({ default: { limit, ttl } })` decorators with values
**hardcoded in the controllers**, not from environment variables. For example:

| Route | Limit |
|-------|-------|
| `POST /api/auth/sign-in` | 5 per 15 minutes |
| `POST /api/auth/register` | 3 per hour |
| `POST /api/auth/refresh` | 30 per minute |
| `POST /api/ai/parse-resume`, `/score-candidate` | 10 per hour |
| AI comparison and batch routes | 5 per hour |
| `POST /api/applications` (public submission) | 5 per hour |
| Public API `/api/v1/*` controllers | 1000 per hour |

**When throttling is skipped** (`shouldSkipThrottling` in `src/app.module.ts`):

- `NODE_ENV=test`, or `THROTTLE_DISABLED=true`
- Non-HTTP execution contexts
- Handlers marked with the project's `@SkipThrottle()` decorator
- Any path starting with `/api/sse`, `/api/billing/webhook`, `/api/webhooks`, `/api/tracking`,
  `/api/health/liveness`, `/api/health/readiness` or `/api/metrics`

**Public API keys** are tracked separately: `PublicApiThrottlerGuard` keys by API key UID rather
than IP, at 1000 requests per hour per key.

**Response headers.** `@nestjs/throttler` v6 sets these on every throttled request. Because the only
throttler is named `default`, the headers carry no suffix:

| Header | Meaning |
|--------|---------|
| `X-RateLimit-Limit` | Requests allowed in the window |
| `X-RateLimit-Remaining` | Requests left in the window |
| `X-RateLimit-Reset` | Seconds until the window resets |
| `Retry-After` | Sent only on a rejection |

**Response on rejection:** HTTP `429` with the message `Too many requests. Please try again later.`

**See:** [Rate Limiting Documentation](../../recruiting-tool-backend/docs/RATE_LIMITING.md)

## Logging Configuration

### Backend Logging

Logs are output to stdout and captured by Docker.

**View logs:**
```bash
# All backend logs
docker-compose logs backend

# Follow logs (tail -f)
docker-compose logs -f backend

# Filter errors only
docker-compose logs backend | grep ERROR
```

**Log Levels:**
- `error` - Critical errors
- `warn` - Warnings
- `log` - General information
- `debug` - Detailed debug info (development only)

### Slow Query Logging

Database queries slower than 100ms are automatically logged.

**Example:**
```
[WARN] Slow query detected (150ms): SELECT "Candidate"."id", ...
```

## Health Check Endpoints

Monitor application health:

| Endpoint | Purpose | Public |
|----------|---------|--------|
| `/api/health` | Overall health | Yes |
| `/api/health/liveness` | Kubernetes liveness probe | Yes |
| `/api/health/readiness` | Kubernetes readiness probe | Yes |
| `/api/health/detailed` | Detailed system info | Yes |
| `/api/health/database` | Database status | Yes |
| `/api/health/database/pool` | Connection pool stats | Yes |
| `/api/health/storage` | MinIO/S3 status | Yes |
| `/api/health/email` | Email service status | Yes |

## Production Configuration

### Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Change default admin password
- [ ] Update all default passwords (database, MinIO, pgAdmin)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set `NODE_ENV=production` - and start the stack with the production overlay, see [Production Guide](../deployment/production.md)
- [ ] Set `DUMMY_DATA_ENABLED=false` (or leave it unset)
- [ ] Set `INTERNAL_API_KEY` - `/api/internal/*` throws on every request while it is missing
- [ ] Set `METRICS_TOKEN` - `GET /api/metrics` rejects everything while it is missing
- [ ] Set `S3_PUBLIC_ENDPOINT` to the browser-reachable object-store address
- [ ] Set `FRONTEND_URL` to the real front-end origin (it is the only allowed CORS origin)
- [ ] Set `SMTP_ENABLED=true` with a live Resend key in `SMTP_PASSWORD`
- [ ] Budget `THROTTLE_TTL` / `THROTTLE_LIMIT` against real traffic and leave `THROTTLE_DISABLED` unset
- [ ] Use AWS S3 instead of MinIO (optional)
- [ ] Enable PgBouncer for connection pooling
- [ ] Set up database backups (`BACKUP_ENABLED=true`)
- [ ] Configure log aggregation
- [ ] Enable monitoring and alerts (`SENTRY_DSN`)
- [ ] Set up CDN for static assets

### Performance Optimization

**Production `.env` settings:**
```bash
# Backend
NODE_ENV=production
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5

# Use PgBouncer
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/recruiting_tool_db?schema=public"

# Enable production logging
DATABASE_POOL_LOGGING=false
```

**See:** [Production Deployment Guide](../deployment/production.md)

## Troubleshooting Configuration

### Environment Variables Not Loading

**Problem**: Changes to `.env` not taking effect

**Solution**:
```bash
# Restart containers to reload environment
docker-compose down
docker-compose up -d

# For backend only
docker-compose restart backend
```

### Database Connection Errors

**Problem**: "Connection refused" or "Cannot connect to database"

**Solution**:
1. Check `DATABASE_URL` format
2. Verify database container is running: `docker-compose ps db`
3. Check database logs: `docker-compose logs db`
4. Ensure port 5432 is not in use by another service

### File Upload Errors

**Problem**: "Failed to upload file" or "Storage not configured"

**Solution**:
1. Check MinIO is running: `docker-compose ps minio`
2. Verify `S3_ENDPOINT` is accessible
3. Check bucket exists in MinIO Console
4. Verify credentials match `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

### Email Not Sending

**Problem**: Emails not being sent or delivered

**Solution**:
1. Confirm `SMTP_ENABLED=true`. When it is `false` the backend logs the message and sends nothing.
2. Confirm `SMTP_PASSWORD` holds a valid Resend API key (`re_...`) with sending access.
3. Confirm `EMAIL_FROM` is on a domain verified in Resend.
4. Check email service health: `curl http://localhost:4000/api/health/email`
5. Inspect the `EmailLog` table - every attempt is recorded there with a `status` and
   `deliveryStatus`, even when sending is disabled.
6. Review backend logs for `Resend API error <status>` messages.

## Next Steps

- [Quick Start Guide](./quick-start.md) - Get started with your first job
- [Docker Deployment](../deployment/docker.md) - Compose services and profiles
- [Production Guide](../deployment/production.md) - Production overlay and CI/CD
- [External APIs - Production Activation](../EXTERNAL_APIS_PRODUCTION.md) - Per-service setup steps
- [API Documentation](../api/authentication.md) - Integrate with the API
