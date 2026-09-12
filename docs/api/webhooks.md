# Webhooks

Borderless has two unrelated webhook systems that happen to share the word. **Outbound webhooks** let your own service subscribe to events from Borderless — you register a URL under `/api/v1/webhooks` and Borderless POSTs signed payloads to it. **The inbound receiver** at `/api/webhooks` is the opposite direction: n8n and other automation tools POST into Borderless. This page covers both, starting with the outbound system.

## Outbound webhooks (`/api/v1/webhooks`)

### Authentication

Webhook management uses the same API key as the rest of the Public API — send `X-API-Key: blss_live_...`. All five routes are rate limited at 1000 requests per hour per key and return the Public API error shape. See [Public API](./public-api.md#authentication).

### Supported events

`VALID_WEBHOOK_EVENTS` in `create-webhook.dto.ts` allows exactly three values. Any other string is rejected with a `400`.

| Event | Fired by | Payload |
|-------|----------|---------|
| `candidate.created` | `POST /api/v1/candidates` | `{ "uid", "name", "email" }` |
| `candidate.updated` | `PATCH /api/v1/candidates/{uid}` | `{ "uid", "name", "email" }` |
| `application.status_changed` | `PATCH /api/v1/applications/{uid}` | `{ "uid", "status" }` |

**Only the Public API emits these events today.** Creating a candidate through the web app, changing an application's status from the HR dashboard, or deleting a candidate through any route does not fire a webhook. If you need to observe changes made in the UI, poll the Public API instead.

### Register an endpoint

```http
POST /api/v1/webhooks
X-API-Key: blss_live_...
Content-Type: application/json

{
  "url": "https://example.com/webhooks/borderless",
  "events": ["candidate.created", "application.status_changed"]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `url` | string | Yes | Must be a valid URL |
| `events` | string[] | Yes | Non-empty; each item must be one of the three event names |

**Response (201):**
```json
{
  "uid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "url": "https://example.com/webhooks/borderless",
  "events": ["candidate.created", "application.status_changed"],
  "isActive": true,
  "createdAt": "2026-03-01T12:00:00.000Z",
  "updatedAt": "2026-03-01T12:00:00.000Z",
  "secret": "3f8a...64 hex characters..."
}
```

The `secret` is 32 random bytes rendered as 64 hex characters. **It is returned only in this response.** Every later read omits it, and there is no rotation or reveal endpoint — losing it means deleting the endpoint and registering a new one.

### List endpoints

```http
GET /api/v1/webhooks
```

Returns an array of endpoint objects ordered by `createdAt` descending, without `secret`.

### Get one endpoint

```http
GET /api/v1/webhooks/{uid}
```

Returns `404` if the UID does not belong to your company.

### Update an endpoint

```http
PATCH /api/v1/webhooks/{uid}
Content-Type: application/json

{ "isActive": false }
```

| Field | Type | Notes |
|-------|------|-------|
| `url` | string | Must be a valid URL |
| `events` | string[] | Each item must be one of the three event names |
| `isActive` | boolean | Set `false` to pause delivery without deleting |

### Delete an endpoint

```http
DELETE /api/v1/webhooks/{uid}
```

Returns `204 No Content`. This is a hard delete, not a soft delete.

### Delivery contract

`WebhookDeliveryService` looks up every active endpoint for your company whose `events` array contains the fired event, then POSTs to each URL.

**Request body:**
```json
{
  "id": "6e1a2c7b-0f4e-4a2c-9f3d-6b2e5c8a1d0f",
  "timestamp": "2026-03-01T12:34:56.789Z",
  "event": "candidate.created",
  "data": {
    "uid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }
}
```

**Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `X-Borderless-Signature` | `v1,<hmac-sha256 hex>` |
| `X-Borderless-Event` | The event name |
| `X-Borderless-Timestamp` | ISO 8601 timestamp, identical to the body's `timestamp` |
| `X-Borderless-Message-Id` | UUID, identical to the body's `id` |

**Timeout and retries:** each attempt has a 10 second timeout. A failure is retried up to 3 attempts in total, with exponential backoff of 1s then 2s. After the third failure the delivery is abandoned and logged; there is no dead-letter queue and no manual replay endpoint.

**Message IDs are not stable across retries.** Each attempt generates a fresh `id` and `timestamp`, so the same logical event can arrive more than once with different IDs. Deduplicate on the payload's `data.uid` plus `event` rather than on `X-Borderless-Message-Id`.

### Verifying a signature

The signed string is `<messageId>.<timestamp>.<rawBody>` and the digest is HMAC-SHA256 with your endpoint secret, hex-encoded, prefixed with `v1,`.

```js
const crypto = require('crypto');

function verify(req, secret) {
  const messageId = req.headers['x-borderless-message-id'];
  const timestamp = req.headers['x-borderless-timestamp'];
  const signature = req.headers['x-borderless-signature'];

  // rawBody must be the exact bytes received, before any JSON parsing.
  const toSign = `${messageId}.${timestamp}.${req.rawBody}`;
  const expected = 'v1,' + crypto.createHmac('sha256', secret).update(toSign).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

Capture the raw request body before your framework parses it — re-serialising the parsed JSON will produce a different byte sequence and the signature will not match.

## Inbound automation receiver (`/api/webhooks`)

This is a separate controller that lets n8n and similar tools notify Borderless of external events. It is unrelated to the outbound system above and does not use API keys issued by [API Keys](./api-keys.md).

### Authentication

`WebhookAuthGuard` protects the whole controller. It reads the key from either the `x-api-key` header or an `apiKey` query parameter and compares it to the `WEBHOOK_API_KEY` environment variable.

```bash
curl -X POST https://api.borderlessats.com/api/webhooks/candidate-created \
  -H "x-api-key: $WEBHOOK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"candidateUid":"...","candidateName":"Jane Doe","candidateEmail":"jane@example.com"}'
```

If `WEBHOOK_API_KEY` is unset the guard rejects every request with `401 Webhook API key is not configured on the server`.

`/api/webhooks` is one of the prefixes exempt from the global IP rate limiter, because bursts arrive from a single automation host.

### Routes

All four POST routes return `200` (not `201`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/webhooks/health` | Health status of the webhook service and the list of available endpoints |
| `POST` | `/api/webhooks/candidate-created` | A candidate was created in an external system |
| `POST` | `/api/webhooks/interview-scheduled` | An interview was scheduled externally |
| `POST` | `/api/webhooks/stage-changed` | A candidate moved between hiring stages |
| `POST` | `/api/webhooks/application-status-changed` | An application status changed |

### Payloads

**`POST /api/webhooks/candidate-created`**

| Field | Type | Required |
|-------|------|----------|
| `candidateUid` | string | Yes |
| `candidateName` | string | Yes |
| `candidateEmail` | string | Yes |
| `jobPositionUid` | string | No |
| `metadata` | object | No |

**`POST /api/webhooks/interview-scheduled`**

| Field | Type | Required |
|-------|------|----------|
| `interviewUid` | string | Yes |
| `candidateUid` | string | Yes |
| `candidateName` | string | Yes |
| `scheduledAt` | string (ISO 8601) | Yes |
| `interviewType` | string | Yes |
| `interviewerName` | string | No |
| `meetingLink` | string | No |

**`POST /api/webhooks/stage-changed`**

| Field | Type | Required |
|-------|------|----------|
| `candidateUid` | string | Yes |
| `candidateName` | string | Yes |
| `newStage` | string | Yes |
| `jobPositionUid` | string | Yes |
| `previousStage` | string | No |
| `changedBy` | string (user UID) | No |

**`POST /api/webhooks/application-status-changed`**

| Field | Type | Required |
|-------|------|----------|
| `applicationUid` | string | Yes |
| `candidateUid` | string | Yes |
| `candidateName` | string | Yes |
| `newStatus` | string | Yes |
| `jobPositionUid` | string | Yes |
| `previousStatus` | string | No |
| `reason` | string | No |

### Relationship to `N8N_OUTREACH_WEBHOOK_URL`

`N8N_OUTREACH_WEBHOOK_URL` points the other way. It is read by `OutreachCampaignsService` and is the n8n webhook that Borderless calls when an outreach campaign runs. It has nothing to do with `WEBHOOK_API_KEY` or the `/api/webhooks` receiver — one is Borderless calling n8n, the other is n8n calling Borderless.

## Related

- [Public API](./public-api.md) — the `/api/v1` routes whose writes emit outbound events
- [API Keys](./api-keys.md) — issuing the `blss_live_...` key used to manage webhook endpoints
- [Internal and Metrics APIs](./internal-and-metrics.md) — the other machine-to-machine surfaces
- [Configuration](../getting-started/configuration.md) — `WEBHOOK_API_KEY` and `N8N_OUTREACH_WEBHOOK_URL`
