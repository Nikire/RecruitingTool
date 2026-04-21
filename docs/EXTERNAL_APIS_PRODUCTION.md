# External APIs — Production Activation Guide

This guide covers every external service used by Borderless ATS and exactly what you need to do to move each one from a development/test configuration to a production-ready state on your EC2 instance.

**Target audience:** A developer or founder comfortable with environment variables and web dashboards.

**EC2 env file location:** `~/borderless/.env`

---

## Table of Contents

1. [Resend (Email)](#1-resend-email)
2. [Google OAuth and Google Calendar](#2-google-oauth-and-google-calendar)
3. [Stripe (Subscriptions and Billing)](#3-stripe-subscriptions-and-billing)
4. [Google Gemini AI](#4-google-gemini-ai)
5. [Auth0 (Social Login — Optional)](#5-auth0-social-login--optional)
6. [MinIO (File Storage)](#6-minio-file-storage)
7. [n8n (Webhook Automation — Optional)](#7-n8n-webhook-automation--optional)
8. [Internal API Key](#8-internal-api-key)
9. [Pre-launch Checklist](#pre-launch-checklist)

---

## 1. Resend (Email)

### What it's used for

Resend handles every outgoing transactional email the app sends:

- Application received confirmations (to candidates)
- Application status updates (accepted, rejected, under review)
- Interview scheduled / cancelled / rescheduled / reminder notifications
- Booking invitations (candidate self-schedule link)
- Booking confirmations (after candidate selects a slot)
- HR notifications when a candidate books
- Async stage invitations and submission-received notifications
- Stage advancement notifications
- Hired notifications
- Welcome emails and team invitations
- Password reset links
- Hiring process access codes

The app uses the **Resend HTTP API directly** (not SMTP). The `SMTP_PASSWORD` variable holds the Resend API key, which is sent as a `Bearer` token to `https://api.resend.com/emails`. The `SMTP_HOST` and `SMTP_PORT` variables are ignored when using Resend — they exist only as artifacts of the nodemailer SMTP config that still initializes the transporter for non-Resend fallback paths.

### Current development setup

- `SMTP_ENABLED=false` — all emails are logged to the backend console instead of sent
- A test API key (`re_xxxx`) may be present in the local `.env`
- Emails from an unverified domain get sent to a Resend sandbox (not real inboxes)

### Step-by-step production activation

**Step 1 — Verify your sending domain in Resend**

1. Log in to [resend.com](https://resend.com) → **Domains** → **Add Domain**
2. Enter `borderlessats.com`
3. Resend will show you DNS records to add. Add all of them to your DNS registrar:
   - **SPF** — a TXT record on `borderlessats.com` or `@`
   - **DKIM** — one or two TXT records (Resend shows the exact subdomain and value)
   - **DMARC** — a TXT record on `_dmarc.borderlessats.com` (Resend provides a safe default value)
4. Click **Verify** in the Resend dashboard. DNS propagation can take up to 48 hours, but usually completes in under 30 minutes.
5. Wait until the domain status shows **Verified** before sending production emails.

**Step 2 — Create a production API key**

1. In Resend dashboard → **API Keys** → **Create API Key**
2. Name it something like `borderless-production`
3. Set permission to **Sending access** only (never Full Access for a production app secret)
4. Copy the key — it starts with `re_` and is shown only once

**Step 3 — Update EC2 env vars**

```bash
# SSH into EC2, then edit ~/borderless/.env
SMTP_ENABLED=true
SMTP_HOST=smtp.resend.com        # Not actually used for Resend, but leave set
SMTP_PORT=587                    # Same — not used, just needs a value
SMTP_USER=resend                 # Not used, just needs a value
SMTP_PASSWORD=re_YOUR_PRODUCTION_KEY_HERE
EMAIL_FROM=noreply@borderlessats.com
```

Optionally set the admin BCC to receive a blind copy of all outgoing emails for monitoring:

```bash
EMAIL_ADMIN_BCC=admin@borderlessats.com
```

**Step 4 — Rebuild and test**

```bash
DOCKER_BUILDKIT=0 docker-compose up -d --build backend
```

Then trigger a test email from the admin panel: **System Settings → Email → Send Test Email**. Confirm delivery in your inbox.

### Gotchas

- **`SMTP_ENABLED=false` silently drops all emails.** The app logs them to the console instead. Make sure you set this to `true` in production or you will wonder why no emails arrive.
- **The from address must match the verified domain.** If `EMAIL_FROM` is set to `noreply@borderlessats.com`, the domain `borderlessats.com` must be verified in Resend, not just your personal email domain.
- **Resend sandbox mode:** If you verified a domain but have not activated billing, Resend may still sandbox emails for some regions. Activate your Resend plan before launch.
- **Email logs are stored in the database** (`EmailLog` table) regardless of whether SMTP is enabled. Check these if you are unsure whether an email was attempted.
- **Company-level email templates** override the built-in templates. If a company has a custom template in the database for a given type, that is rendered with Handlebars before sending. Test all active company templates after switching to production.

---

## 2. Google OAuth and Google Calendar

### What it's used for

Two separate but related Google integrations:

- **Google OAuth / social login** — HR users can sign in using their Google account (routed through Auth0 in the optional Auth0 flow, or directly via the backend if Auth0 is not used)
- **Google Calendar** — HR users connect their personal/work Google Calendar so the app can:
  - Read their availability for booking slots
  - Create calendar events when interviews are scheduled
  - Auto-create Google Meet links and attach them to interview events

The Calendar integration uses OAuth 2.0 with scopes `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`. Refresh tokens are stored in the database per user. The OAuth callback endpoint is `GET /api/google-calendar/callback`.

### Current development setup

- A Google Cloud project with OAuth credentials pointing to `http://localhost:4000` or a dev domain
- The OAuth consent screen is in **Testing** mode — only whitelisted Google accounts can authorize
- `GOOGLE_REDIRECT_URI=http://localhost:4000/calendar/auth/google/callback` (or similar dev value)

### Step-by-step production activation

**Step 1 — Update authorized origins and redirect URIs**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → select your project → **APIs & Services → Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins** add:
   - `https://borderlessats.com`
   - `https://api.borderlessats.com`
4. Under **Authorized redirect URIs** add:
   - `https://api.borderlessats.com/api/google-calendar/callback`
5. Click **Save**

**Step 2 — Publish the OAuth consent screen**

1. Go to **APIs & Services → OAuth consent screen**
2. Review your app name, logo, support email, and developer contact
3. Under **Publishing status**, click **Publish App**
4. This removes the "unverified app" warning that shows to users during OAuth

> **Important:** If your app uses sensitive or restricted OAuth scopes, Google requires you to complete an app verification process (security assessment). The scopes used by this app — `calendar` and `calendar.events` — are classified as **sensitive**. If you have more than 100 users or are not a Google Workspace organization, you will need to submit for verification. This process takes 1–4 weeks.

**Step 3 — Update EC2 env vars**

```bash
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://api.borderlessats.com/api/google-calendar/callback
```

Note: `GOOGLE_REDIRECT_URI` must exactly match one of the URIs you registered in the Google Console. Even a trailing slash difference will cause a `redirect_uri_mismatch` error.

**Step 4 — Rebuild and test**

```bash
DOCKER_BUILDKIT=0 docker-compose up -d --build backend
```

Log in as an HR user → go to **Calendar Settings** → click **Connect Google Calendar**. Complete the OAuth flow and verify that events appear when interviews are created.

### Gotchas

- **`redirect_uri_mismatch` error** is the most common failure. The value in `GOOGLE_REDIRECT_URI` must exactly match what is registered in Google Console, including the protocol (`https`), domain, and path.
- **Refresh tokens expire** if the user revokes access or if the app's publishing status changes (e.g., you move back to Testing mode). Users will need to re-authorize.
- **`prompt: consent`** is set in the auth URL generator. This forces the consent screen every time to ensure a refresh token is always returned. Do not remove this — without it, Google only returns a refresh token on the first authorization, and subsequent authorizations return only an access token.
- **Google Meet links** are created automatically when a calendar event is created. If the user's Google Workspace does not support Meet, the `hangoutLink` field will be null and the interview will be created without a meeting link.
- **Calendar scopes vs. login scopes:** The Google Calendar integration and any Google-based login via Auth0 use separate credential sets. The Calendar integration uses the credentials above. If you use Auth0 for Google login, those credentials live in the Auth0 dashboard, not in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

---

## 3. Stripe (Subscriptions and Billing)

### What it's used for

Stripe handles the entire subscription lifecycle for the Borderless SaaS plans:

- **Checkout sessions** — redirects company admins to Stripe's hosted checkout to subscribe
- **Billing portal** — lets admins manage their subscription, update payment method, view invoices
- **Webhooks** — Stripe sends events to the app so subscription status stays in sync with the database
- **Subscription guard** — middleware that checks whether a company's subscription allows access to premium features

The app listens for these webhook events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`, `checkout.session.completed`.

The Stripe CLI Docker service (profile `stripe`) is used only in development to forward webhook events to the local backend. It must not run in production.

### Current development setup

- `STRIPE_SECRET_KEY=sk_test_...` (test mode key)
- `STRIPE_PROFESSIONAL_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID` point to test prices
- The `stripe-cli` Docker service is used to forward webhook events locally
- `STRIPE_WEBHOOK_SECRET=whsec_...` is generated by the Stripe CLI on startup (visible in `docker logs borderless-stripe-cli`)

### Step-by-step production activation

**Step 1 — Switch Stripe Dashboard to Live mode**

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Use the toggle in the top-left corner to switch from **Test mode** to **Live mode**

All subsequent steps must be done in Live mode.

**Step 2 — Create your production products and prices**

1. Go to **Product catalog → Add product**
2. Create the **Professional** plan:
   - Name: `Borderless Professional`
   - Pricing model: Recurring
   - Price: `$79.00 / month` (add a second price for `$708.00 / year` = $59/mo if you offer annual billing)
   - Copy the **Price ID** (starts with `price_`)
3. Create the **Enterprise** plan:
   - Name: `Borderless Enterprise`
   - Price: `$299.00 / month` (add `$2988.00 / year` = $249/mo for annual)
   - Copy the **Price ID**

**Step 3 — Set up the production webhook endpoint**

1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://api.borderlessats.com/api/stripe/webhook`
3. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Click **Add endpoint**
5. On the endpoint detail page, click **Reveal** next to **Signing secret**
6. Copy the `whsec_...` value

**Step 4 — Update EC2 env vars**

```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
STRIPE_PROFESSIONAL_PRICE_ID=price_YOUR_PROFESSIONAL_PRICE_ID
STRIPE_ENTERPRISE_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
```

**Step 5 — Ensure Stripe CLI is not running in production**

The `stripe-cli` service uses the `stripe` profile. Confirm your production docker-compose command does not include this profile:

```bash
# Correct production command (no --profile stripe):
DOCKER_BUILDKIT=0 docker-compose up -d --build

# Wrong — do not use in production:
DOCKER_BUILDKIT=0 docker-compose --profile stripe up -d
```

**Step 6 — Test with a real card before launch**

1. Do a full checkout flow with a real card in a staging environment or directly in production with a low-cost test transaction
2. Verify the subscription status updates in the app database
3. Test the billing portal by navigating to **Account → Billing** in the app

### Gotchas

- **Webhook signature verification will fail** if `STRIPE_WEBHOOK_SECRET` is still set to the Stripe CLI's local signing secret. The CLI generates a different secret than the production webhook endpoint. Always use the secret from the Stripe Dashboard webhook endpoint page.
- **Price IDs are environment-specific.** A `price_` ID from test mode does not exist in live mode. You must create new prices in live mode and update both price ID env vars.
- **Missing webhook events cause subscription sync failures.** If the backend never receives `customer.subscription.updated`, the database subscription status will be stale. Check the Stripe Dashboard → Webhooks → your endpoint → **Recent deliveries** after your first test checkout.
- **The app uses the Stripe API version `2025-11-17.clover`.** If you create the Stripe client manually (e.g., in scripts), use this same API version to avoid response shape mismatches.
- **Customers are stored by Stripe Customer ID** in the `Subscription` table. If you delete and recreate a company in the app, you may need to manually clean up orphaned Stripe customers.

---

## 4. Google Gemini AI

### What it's used for

The AI module uses Google Gemini for two features:

- **Resume parsing** — extracts structured data (skills, experience, education) from uploaded resume files
- **Candidate scoring** — generates a numeric fit score and written analysis comparing a candidate against a job position's requirements
- **Batch scoring** — scores multiple candidates at once against a position

AI credit usage is tracked per company in the `AIQuota` table. Each company has a configurable quota limit. The `GeminiService` implements its own rate limiter to stay within API limits.

### Current development setup

- `GEMINI_API_KEY` is set to a free-tier key
- `GEMINI_MODEL=gemini-1.5-flash`
- `GEMINI_TIER=free` — rate limiter uses 15 RPM (requests per minute) with 4-second minimum delay between requests

### Step-by-step production activation

**Step 1 — Enable billing on your Google Cloud project**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **Billing**
2. Link a billing account to the project that owns your Gemini API key
3. Enabling billing automatically unlocks the paid tier rate limits

**Step 2 — Create a production API key**

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key** → select your production project
3. Copy the key

Alternatively, create a restricted API key in Google Cloud Console → **APIs & Services → Credentials** → **Create Credentials → API key**, then restrict it to the **Generative Language API** only.

**Step 3 — Update EC2 env vars**

```bash
GEMINI_API_KEY=your_production_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIER=paid
```

Setting `GEMINI_TIER=paid` changes the internal rate limiter to 360 RPM (1 request per ~167ms) and increases max retries from 3 to 5.

**Step 4 — Choose your model**

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `gemini-1.5-flash` | Fast | Good | Lower |
| `gemini-1.5-pro` | Slower | Higher | Higher |
| `gemini-2.0-flash` | Fastest | Good | Lower |

For most ATS use cases, `gemini-1.5-flash` is the right balance of speed and quality. Switch to `gemini-1.5-pro` only if resume parsing quality is insufficient.

**Step 5 — Monitor usage**

- [aistudio.google.com](https://aistudio.google.com) → **Usage** tab shows requests, tokens, and any quota errors
- Set billing alerts in Google Cloud Console → **Billing → Budgets & alerts**

### Gotchas

- **`GEMINI_TIER=free` on a paid key still limits you to 15 RPM** because the rate limiter reads the env var, not the actual key's quota. Always set `GEMINI_TIER=paid` when using a paid key.
- **AI features are silently disabled** if `GEMINI_API_KEY` is not set. The service logs a warning, but no error is thrown to the user. You will see a `GeminiService: AI scoring features will be disabled` warning in the backend logs.
- **Per-company quotas are enforced in the app**, not by Google. If a company exceeds its `AIQuota` limit in the database, the API returns a 403 even if the Google API key still has capacity. Check the `AIQuota` table if AI features stop working for a specific company.
- **Token usage is tracked** in the `GeminiService` in memory (not persisted to the database). It resets on backend restart. For cost tracking, rely on Google's dashboard.
- **Resume parsing quality depends on PDF text extraction.** Scanned image PDFs that have not been OCR-processed will produce poor results regardless of model quality.

---

## 5. Auth0 (Social Login — Optional)

### What it's used for

Auth0 provides social login buttons (Google, LinkedIn, etc.) on the login page as an alternative to email + password authentication. It is entirely optional — the app works fully without Auth0 configured. When Auth0 is not configured, the login page shows only the email/password form.

The backend validates Auth0-issued JWT tokens using the RS256 algorithm and Auth0's JWKS endpoint. The frontend is built with the `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, and `VITE_AUTH0_AUDIENCE` build args baked into the Docker image.

### Current development setup

- An Auth0 tenant in development/testing mode
- The frontend build args `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE` are commented out in `.env.example`
- The backend `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID` env vars may be empty

### Step-by-step production activation

**Step 1 — Configure your Auth0 application for production URLs**

1. Log in to [manage.auth0.com](https://manage.auth0.com) → select your tenant
2. Go to **Applications** → select your app (or create a new one for production)
3. Under **Settings → Application URIs**, update:
   - **Allowed Callback URLs:** `https://borderlessats.com/callback, https://api.borderlessats.com/api/auth/auth0/callback`
   - **Allowed Logout URLs:** `https://borderlessats.com`
   - **Allowed Web Origins:** `https://borderlessats.com`
4. Click **Save Changes**

**Step 2 — Configure social connections**

1. Go to **Authentication → Social**
2. Enable the social providers you want (Google, LinkedIn, GitHub, etc.)
3. For each provider, Auth0 uses its own developer app credentials by default (fine for development), but for production you should use your own credentials:
   - **Google:** Create OAuth credentials in Google Cloud Console → add `accounts.google.com` as authorized domain → enter Client ID and Secret in Auth0
   - **LinkedIn:** Create a LinkedIn Developer App → add `auth0.com` as an authorized redirect domain → enter credentials in Auth0

**Step 3 — Note your Auth0 audience**

The audience must match the API identifier in Auth0. Go to **Applications → APIs** → find your API → copy the **API Audience** value (usually a URL like `https://api.borderlessats.com`).

**Step 4 — Update EC2 env vars (backend)**

```bash
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.borderlessats.com
AUTH0_CLIENT_ID=your-auth0-application-client-id
```

**Step 5 — Update frontend build args**

The frontend reads Auth0 config as Vite build args baked at image build time. Update the root `.env` file on EC2 (the one docker-compose reads for build args):

```bash
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-application-client-id
VITE_AUTH0_AUDIENCE=https://api.borderlessats.com
```

Then rebuild the frontend image — the Vite build will bake these values in:

```bash
DOCKER_BUILDKIT=0 docker-compose up -d --build frontend
```

### Gotchas

- **Frontend values are baked at build time, not runtime.** If you change `VITE_AUTH0_*` in the `.env` file, you must rebuild the frontend Docker image for changes to take effect. Setting them as runtime environment variables has no effect on a Vite-built static app.
- **Mismatched audience causes silent auth failures.** The `AUTH0_AUDIENCE` on the backend must exactly match the API identifier configured in the Auth0 dashboard. A mismatch causes JWT validation to fail with a generic 401 error.
- **Auth0 is completely optional.** If you never set `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID`, the `Auth0Strategy` initializes with placeholder config and rejects all tokens silently. The app continues to work normally with email/password login. Only set up Auth0 if you actively want social login.
- **Multiple Auth0 tenants:** If you used a dev tenant for testing, create a separate production tenant rather than reusing the dev one. Auth0 tenant names appear in JWT issuers and cannot be changed.

---

## 6. MinIO (File Storage)

### What it's used for

MinIO is a self-hosted S3-compatible object storage server that runs as a Docker container alongside the app. It stores:

- Candidate resume files (uploaded during application or by HR)
- Profile photos (candidate and HR user avatars)
- Company logos
- Async stage candidate submissions (video, audio, document files)

The backend proxies all file access through `GET /api/files/:uid/view` and `GET /api/files/:uid/download`. MinIO is never accessed directly by the frontend — the backend fetches the file from MinIO and streams it to the client. This means the MinIO port does not need to be publicly accessible.

### Current setup (MinIO is already "production")

MinIO runs on the same EC2 instance in Docker. Unlike the other services in this guide, there is no external account to configure — MinIO is fully self-contained.

### What to verify before launch

**Step 1 — Set strong credentials**

Do not leave MinIO running with the default `minioadmin` / `minioadmin` credentials.

Update your root `.env` on EC2:

```bash
MINIO_ROOT_USER=your_strong_minio_username
MINIO_ROOT_PASSWORD=your_strong_random_password_here
```

The backend uses these credentials to authenticate with MinIO. They must also be updated in the backend env vars (check that `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` are referenced correctly in the backend config or docker-compose env passthrough).

After changing, rebuild MinIO:

```bash
DOCKER_BUILDKIT=0 docker-compose up -d --build minio
```

**Step 2 — Close MinIO ports in EC2 security group**

MinIO exposes two ports:
- `9000` — S3 API (used by the backend internally)
- `9001` — MinIO Console web UI

Neither should be publicly accessible. In the EC2 security group:

1. Go to **EC2 → Security Groups → your-instance-sg → Inbound rules**
2. Verify there is **no inbound rule for port 9000 or 9001** with source `0.0.0.0/0` or `::/0`
3. If such rules exist, delete them

The backend communicates with MinIO over the internal Docker `app-network` bridge, so no public port exposure is needed.

**Step 3 — Verify the MinIO endpoint config**

The backend connects to MinIO using the Docker service name as the hostname:

```bash
# This should reference the Docker service name, not localhost or EC2 IP
MINIO_ENDPOINT=minio        # Docker service name (resolves within app-network)
MINIO_PORT=9000
MINIO_USE_SSL=false         # Internal Docker traffic does not need SSL
MINIO_ACCESS_KEY=your_strong_minio_username
MINIO_SECRET_KEY=your_strong_random_password_here
MINIO_BUCKET_NAME=recruiting-tool
```

**Step 4 — Set up regular backups**

The backup system is built into the app and controlled by these env vars:

```bash
BACKUP_ENABLED=true
BACKUP_CRON=0 2 * * *         # 2 AM daily
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=/backups          # Maps to the backup_data Docker volume
MINIO_DATA_PATH=/data/minio   # Used when backing up MinIO data directory
```

Additionally, consider a periodic `aws s3 sync` (MinIO supports the AWS CLI) to copy your MinIO bucket to AWS S3 for off-site disaster recovery.

### Gotchas

- **MinIO data lives in the `minio_data` Docker volume.** If you run `docker-compose down -v`, this data is deleted permanently. Only use `-v` if you intend to wipe all storage. For normal restarts, use `docker-compose restart minio` or `docker-compose up -d`.
- **Changing MinIO credentials after initial setup** requires MinIO to be restarted after the env vars are updated. Existing objects are not affected — they are stored in the data volume, not tied to the credentials.
- **Bucket creation:** The app creates its bucket automatically on first run if it does not exist. If you change `MINIO_BUCKET_NAME`, the new bucket will be created but old files in the previous bucket will become inaccessible.
- **Migrating to AWS S3:** The app uses the `@aws-sdk/client-s3` package with a custom endpoint pointing to MinIO. To switch to real S3, change `MINIO_ENDPOINT` to `s3.amazonaws.com`, set `MINIO_USE_SSL=true`, and use your AWS Access Key / Secret Key. The rest of the app code requires no changes.

---

## 7. n8n (Webhook Automation — Optional)

### What it's used for

n8n is a self-hosted workflow automation tool. In Borderless, it is used for optional webhook integrations — automating actions triggered by app events (e.g., posting a Slack message when a candidate is hired, syncing to a CRM when an application is received).

n8n is **not a core dependency**. It only starts when explicitly requested via the Docker Compose `tools` profile. The main app functions fully without it.

### Current setup

n8n is configured in `docker-compose.yml` under the `tools` profile:

```bash
# Starts n8n (along with pgadmin and pgbouncer):
docker-compose --profile tools up -d

# Normal production start (no n8n):
docker-compose up -d
```

### What to configure for production (if you use it)

**Step 1 — Set strong authentication credentials**

```bash
N8N_USER=admin
N8N_PASSWORD=replace_with_strong_password
N8N_HOST=n8n.borderlessats.com   # or your internal hostname
```

**Step 2 — Use a stable webhook URL**

n8n webhooks include the host in their URLs. Update the docker-compose environment:

```yaml
- WEBHOOK_URL=https://n8n.borderlessats.com/
- N8N_PROTOCOL=https
- N8N_HOST=n8n.borderlessats.com
```

**Step 3 — Keep the n8n port internal**

Port `5678` should not be open publicly unless you are serving n8n through a reverse proxy with HTTPS. Add nginx or Caddy in front of it if you want external access.

**Step 4 — Protect app webhook endpoints**

The app exposes webhook endpoints protected by `WEBHOOK_API_KEY`:

```bash
WEBHOOK_API_KEY=replace_with_strong_random_value
```

Your n8n workflows must include this key in the `X-API-Key` or `Authorization` header when calling the app's webhook endpoints.

### Gotchas

- **n8n data is stored in the `n8n_data` Docker volume.** Back this up before any migrations or volume pruning.
- **n8n workflows are not version-controlled by default.** Export and commit your workflow JSON files to the repo if you want workflow history.
- **Only start n8n if you are actively using it.** Running an idle n8n container wastes memory and adds an attack surface.

---

## 8. Internal API Key

### What it's used for

The `INTERNAL_API_KEY` protects internal-only endpoints that should never be exposed to regular users or the public. Currently used for:

- `POST /api/internal/batch-summary` — sends HTML batch summary emails to `admin@borderlessats.com` (used by the development workflow to notify after each issue batch)

### Production activation

Change the default value from `changeme` to a strong random string:

```bash
INTERNAL_API_KEY=replace_with_strong_random_key_at_least_32_chars
```

Update all callers (GitHub Actions, scripts, or Claude Code sessions) to use the new key in the `x-api-key` request header.

```bash
# Example call:
curl -X POST https://api.borderlessats.com/api/internal/batch-summary \
  -H "x-api-key: your_new_key" \
  -H "Content-Type: application/json" \
  -d '{"batchName": "test", "issues": [], "testingChecklist": []}'
```

---

## Pre-launch Checklist

| # | Service | Check | Status |
|---|---------|-------|--------|
| 1 | Resend | `borderlessats.com` domain verified in Resend dashboard | |
| 2 | Resend | Production API key created (not a test key) | |
| 3 | Resend | `SMTP_ENABLED=true` set on EC2 | |
| 4 | Resend | `SMTP_PASSWORD` contains live `re_` key | |
| 5 | Resend | `EMAIL_FROM=noreply@borderlessats.com` | |
| 6 | Resend | Test email sends and arrives in inbox | |
| 7 | Google Calendar | Production callback URI added to Google Console | |
| 8 | Google Calendar | `GOOGLE_REDIRECT_URI` matches exactly (no trailing slash difference) | |
| 9 | Google Calendar | OAuth consent screen published (or app verification submitted) | |
| 10 | Google Calendar | HR user can successfully connect their Google Calendar | |
| 11 | Stripe | Dashboard switched to **Live mode** | |
| 12 | Stripe | Live products and prices created | |
| 13 | Stripe | Webhook endpoint registered at `https://api.borderlessats.com/api/stripe/webhook` | |
| 14 | Stripe | `STRIPE_SECRET_KEY` starts with `sk_live_` | |
| 15 | Stripe | `STRIPE_WEBHOOK_SECRET` is from the Dashboard (not Stripe CLI) | |
| 16 | Stripe | Price IDs updated to live price IDs | |
| 17 | Stripe | `stripe-cli` Docker service NOT started in production | |
| 18 | Stripe | Test checkout completes and subscription updates in DB | |
| 19 | Gemini | Billing enabled on Google Cloud project | |
| 20 | Gemini | `GEMINI_TIER=paid` set | |
| 21 | Gemini | `GEMINI_API_KEY` is a production key | |
| 22 | Gemini | Resume parsing produces expected output | |
| 23 | Auth0 | Production callback URLs configured (if using Auth0) | |
| 24 | Auth0 | Frontend rebuilt with production `VITE_AUTH0_*` build args | |
| 25 | Auth0 | Social connections configured with production OAuth credentials | |
| 26 | MinIO | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` changed from defaults | |
| 27 | MinIO | Port 9000 and 9001 NOT open in EC2 security group | |
| 28 | MinIO | Backup enabled (`BACKUP_ENABLED=true`) | |
| 29 | MinIO | File upload and download work through the backend proxy | |
| 30 | Internal | `INTERNAL_API_KEY` changed from `changeme` | |
| 31 | General | `JWT_SECRET` set to a strong random value (at least 64 chars) | |
| 32 | General | `NODE_ENV=production` set in backend env | |
| 33 | General | `THROTTLE_LIMIT=100` (not the development value of 500) | |
| 34 | General | `DATABASE_POOL_MAX=20` for production load | |
| 35 | General | `FRONTEND_URL=https://borderlessats.com` (used in email links) | |
