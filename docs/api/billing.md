# Billing API

Borderless bills through **Dodo Payments**. The `/api/billing` namespace creates checkout sessions, reports the current subscription, cancels it, opens the customer portal, lists payment history and receives Dodo's signature-verified webhook. Two administrator routes under the same prefix list subscriptions across every company. The registered billing module is `DodoPaymentsModule` — there is no Stripe controller, despite a lingering `stripe` dependency in the backend.

## Base URL

```
http://localhost:4000/api/billing
```

## Endpoint summary

| Method | Path | Auth | Success status |
|--------|------|------|----------------|
| `POST` | `/api/billing/checkout` | `ADMIN`, `SUPER_ADMIN`, `COMPANY_OWNER` | 200 |
| `GET` | `/api/billing/subscription` | `ADMIN`, `SUPER_ADMIN`, `COMPANY_OWNER`, `HR` | 200 |
| `POST` | `/api/billing/cancel` | `ADMIN`, `SUPER_ADMIN`, `COMPANY_OWNER` | 200 |
| `POST` | `/api/billing/customer-portal` | `ADMIN`, `SUPER_ADMIN`, `COMPANY_OWNER` | 200 |
| `GET` | `/api/billing/invoices` | `COMPANY_OWNER` | 200 |
| `POST` | `/api/billing/webhook` | Dodo signature headers | 200 |
| `GET` | `/api/billing/admin/subscriptions` | `SUPER_ADMIN`, `ADMIN` | 200 |
| `GET` | `/api/billing/admin/subscriptions/list` | `SUPER_ADMIN`, `ADMIN` | 200 |

Because `RolesGuard` gates on the least-privileged role in the list, `GET /api/billing/subscription` is reachable by `HR` and above, while checkout, cancel and the portal need `COMPANY_OWNER` or higher. `GET /api/billing/invoices` names only `COMPANY_OWNER`, so that is its floor.

## Create a checkout session

```http
POST /api/billing/checkout
Authorization: Bearer <access token>
Content-Type: application/json

{
  "plan": "PROFESSIONAL",
  "interval": "monthly",
  "successUrl": "https://app.borderlessats.com/subscription/success",
  "cancelUrl": "https://app.borderlessats.com/subscription/cancel"
}
```

| Field | Type | Required | Allowed values |
|-------|------|----------|----------------|
| `plan` | enum | Yes | `PROFESSIONAL`, `ENTERPRISE` |
| `interval` | enum | No | `monthly`, `annual` |
| `successUrl` | URL | Yes | |
| `cancelUrl` | URL | Yes | |

**Response (200):**
```json
{ "url": "https://checkout.dodopayments.com/..." }
```

Redirect the browser to `url`. Returns `400` when Dodo Payments is not configured.

## Get the current subscription

```http
GET /api/billing/subscription
```

Returns the company's subscription, syncing with Dodo Payments when needed.

## Cancel

```http
POST /api/billing/cancel
```

**Response (200):**
```json
{ "canceled": true, "cancelAtPeriodEnd": true }
```

Cancellation takes effect at the end of the current billing period, not immediately. Returns `400` when the company has no Dodo subscription.

## Customer portal

```http
POST /api/billing/customer-portal
```

**Response (200):**
```json
{ "url": "https://billing.dodopayments.com/portal/..." }
```

Returns `400` when the company has no Dodo customer record.

## Invoices

```http
GET /api/billing/invoices
```

**Response (200):**
```json
{
  "invoices": [
    {
      "id": "pay_xxxxx",
      "amount": 79.0,
      "currency": "USD",
      "status": "succeeded",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "invoiceUrl": "https://..."
    }
  ]
}
```

`amount` is in the major currency unit — dollars, not cents.

## Webhook

```http
POST /api/billing/webhook
webhook-id: <id>
webhook-timestamp: <timestamp>
webhook-signature: <signature>
Content-Type: application/json
```

All three headers are required; a missing header returns `400`. The handler verifies the signature against `DODO_PAYMENTS_WEBHOOK_KEY` using the **raw** request body — `main.ts` creates the Nest app with `rawBody: true` specifically so this verification is possible.

**Response (200):**
```json
{ "received": true }
```

`/api/billing/webhook` is in `THROTTLE_EXEMPT_PREFIXES`, so the global IP rate limiter never applies to it. Dodo's retries and bursts all arrive from the provider's IPs, and dropping one means losing subscription state. The route is also excluded from the Swagger documents.

## Administrator views

```http
GET /api/billing/admin/subscriptions
```

Returns every subscription with company and owner details plus headline counters. Read from the local database only, so it still works when Dodo Payments is unreachable or unconfigured.

```http
GET /api/billing/admin/subscriptions/list?page=1&limit=20
```

Paginated and filterable version of the same data, with aggregate statistics.

## Configuration

| Variable | Purpose |
|----------|---------|
| `DODO_PAYMENTS_API_KEY` | API credential. Unset means Dodo features are disabled and a warning is logged at boot; calling checkout then returns `400` |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Signing secret used to verify `POST /api/billing/webhook` |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` (default) or `live_mode` |
| `DODO_PAYMENTS_PRO_TRIAL_DAYS` | Length of the self-serve Professional trial. Defaults to **14**; set to `0` to sell without a trial |

### Product ID mapping

`plan` plus `interval` resolve to one Dodo product ID:

| `plan` | `interval` | Environment variable |
|--------|-----------|----------------------|
| `PROFESSIONAL` | `monthly` | `DODO_PAYMENTS_PROFESSIONAL_PRODUCT_ID` |
| `PROFESSIONAL` | `annual` | `DODO_PAYMENTS_PROFESSIONAL_ANNUAL_PRODUCT_ID` |
| `ENTERPRISE` | `monthly` | `DODO_PAYMENTS_ENTERPRISE_PRODUCT_ID` |
| `ENTERPRISE` | `annual` | `DODO_PAYMENTS_ENTERPRISE_ANNUAL_PRODUCT_ID` |

The trial is applied as `subscription_data.trial_period_days` on the checkout session, which overrides whatever the product's price carries in the Dodo dashboard. That keeps the trial length authoritative in this codebase rather than depending on a dashboard checkbox.

## Relationship to plan limits and custom plans

A subscription decides *which* plan a company is on; two other administrator namespaces decide what that plan allows.

| Namespace | Auth | Purpose |
|-----------|------|---------|
| `GET`/`PATCH /api/admin/plan-limits` | `SUPER_ADMIN` | Edit the quota table for the standard `FREE`, `PROFESSIONAL` and `ENTERPRISE` tiers |
| `/api/admin/custom-plans` | `SUPER_ADMIN` | Create bespoke plans and assign one to a company with `POST /api/admin/custom-plans/:uid/assign/:companyUid` |
| `GET /api/quota/plan-limits` | Public | Read-only view of the standard tier limits, used by the pricing page |
| `GET /api/quota` | `USER`+ | The caller's company's current usage against its plan |

Plan limits are seeded at boot by `PlanLimitsService.seedDefaults()`, called from `main.ts`.

## Related

- [AI and Quota APIs](./ai.md) — the quota endpoints these limits feed
- [Subscription and Limits](../user-guide/subscription-and-limits.md) — the same system from the user's side
- [Configuration](../getting-started/configuration.md) — every `DODO_PAYMENTS_*` variable
- [API Reference index](./index.md)
