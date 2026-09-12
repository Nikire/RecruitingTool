# API Keys API

API keys are the credential for the [Public API](./public-api.md). You create and revoke them through this JWT-authenticated management surface at `/api/api-keys`, using your normal Borderless login — not with an API key. The raw key value is shown exactly once, at creation; after that only a 16-character prefix is ever returned.

## Base URL

```
http://localhost:4000/api/api-keys
```

## Authorization

Every route requires a bearer JWT and one of the following roles:

```
COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN
```

Because `RolesGuard` enforces "at least the least-privileged role named", the effective gate is `COMPANY_ADMIN` and above. Keys are always scoped to the caller's own company — there is no way to create a key for a different company.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/api-keys` | Create a key and receive the raw value once |
| `GET` | `/api/api-keys` | List the company's keys (prefix only) |
| `PATCH` | `/api/api-keys/:uid` | Rename, re-date or enable/disable a key |
| `DELETE` | `/api/api-keys/:uid` | Revoke a key |

### Create an API key

```http
POST /api/api-keys
Authorization: Bearer <access token>
Content-Type: application/json

{
  "name": "Production Integration Key",
  "expiresAt": "2027-01-01",
  "scopes": ["candidates:read", "jobs:read"]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1–100 characters |
| `expiresAt` | ISO 8601 date string | No | Omit for a key that never expires |
| `scopes` | string[] | No | Defaults to `[]` |

**Response (201):**
```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Production Integration Key",
  "keyPrefix": "blss_live_a1b2c3",
  "isActive": true,
  "scopes": ["candidates:read", "jobs:read"],
  "lastUsedAt": null,
  "expiresAt": "2027-01-01T00:00:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "rawKey": "blss_live_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
}
```

`rawKey` appears in this response and nowhere else. The database stores only a bcrypt hash of the key plus `keyPrefix` (the first 16 characters). If the value is lost, revoke the key and create a new one.

> **`scopes` is not a permission boundary.** The field is validated, persisted and echoed back, but `ApiKeyAuthGuard` never reads it. Any active, unexpired key can reach every `/api/v1` route for its company regardless of what `scopes` contains. Treat it as a label for your own bookkeeping, not as access control.

### List API keys

```http
GET /api/api-keys
Authorization: Bearer <access token>
```

Returns an array of the same object shape **without** `rawKey`, ordered by `createdAt` descending. `lastUsedAt` is refreshed asynchronously by `ApiKeyAuthGuard` on each authenticated Public API request, so it is a useful signal for spotting keys that are no longer in use.

### Update an API key

```http
PATCH /api/api-keys/{uid}
Authorization: Bearer <access token>
Content-Type: application/json

{ "isActive": false }
```

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | 1–100 characters |
| `expiresAt` | ISO 8601 date string or `null` | `null` removes the expiry |
| `isActive` | boolean | `false` immediately stops the key authenticating |

Returns `404` if the key does not belong to the caller's company.

### Revoke an API key

```http
DELETE /api/api-keys/{uid}
Authorization: Bearer <access token>
```

Returns `204 No Content`.

Despite the HTTP verb, this is **not** a row deletion. The service sets `isActive = false` and keeps the record for audit purposes, so the key's name, prefix and `lastUsedAt` remain visible in `GET /api/api-keys`. The effect on callers is immediate: `ApiKeyAuthGuard` only considers keys with `isActive: true`.

## Key lifecycle

1. Create the key and store `rawKey` in your own secret manager.
2. Send it as `X-API-Key` on every `/api/v1` request.
3. Watch `lastUsedAt` to confirm the integration is live.
4. Rotate by creating a second key, switching the integration over, then revoking the first.

There is no in-place rotation endpoint — rotation is always create-then-revoke.

## Related

- [Public API](./public-api.md) — what the key unlocks, and the per-key rate limit
- [Webhooks](./webhooks.md) — managing outbound webhook endpoints with the same key
- [Authentication](./authentication.md) — obtaining the JWT these routes require
- [API Reference index](./index.md)
