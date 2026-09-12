# API Keys

Guide to creating and managing API keys, and to the public `/api/v1` endpoints those keys unlock.

## Overview

API keys let external systems read and write your Borderless data without a user login. You create a key on the API Keys page, copy the secret once, and send it as a header on every request to the public API. Keys belong to your company, so a key can only ever see your company's candidates, positions, applications and webhooks.

**Navigate to API Keys:** Sidebar → **Settings** → **API Keys**, or go directly to `/settings/api-keys`.

## Who Can Manage Keys

The page sits inside the HR route group, so **HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN** can open it.

The API-key endpoints themselves are narrower: `/api/api-keys` requires **COMPANY_OWNER, COMPANY_ADMIN, ADMIN or SUPER_ADMIN**. An HR, HR_MANAGER or RECRUITER user can open the page but every list, create, rename, activate, deactivate and revoke call is refused.

## Creating a Key

1. Click **Create API Key**.
2. Enter a **Key Name**, for example `Production Integration`. The name is a label for you; it is not part of the secret.
3. Optionally set an **Expiration Date**. Leave it empty for a key that never expires. A date in the past is rejected with "The expiration date cannot be in the past."
4. Click **Create Key**.

### Copy the secret now

The **API Key Created** dialog shows the full secret once, above the warning "Copy your API key now. For security reasons, it will not be shown again."

Click **Copy to Clipboard**, store the value in your integration's secret manager, then click **Done**. Borderless stores only a hash of the key — nobody, including support, can recover the secret afterwards. If you lose it, revoke the key and create a new one.

Secrets are formatted `blss_live_` followed by 32 hexadecimal characters.

## The Key List

| Column | Description |
|--------|-------------|
| Name | The label you gave the key |
| Prefix | The first 16 characters of the secret, used to identify the key at a glance |
| Status | **Active** or **Inactive** |
| Last Used | When the key last authenticated a request, or **Never** |
| Expires | The expiry date, or **Never** |
| Actions | Rename, activate / deactivate, revoke |

Every successful request updates **Last Used**, so the column is a reliable way to spot keys nothing is using any more.

If you have no keys yet the page shows "No API keys yet — Create an API key to allow third-party applications to access your data".

## Key Actions

| Action | Effect |
|--------|--------|
| **Rename** | Change the label only. The secret is unchanged and integrations keep working. |
| **Deactivate** | Immediately stops the key authenticating. Reversible. |
| **Activate** | Puts a deactivated key back into service. |
| **Revoke** | Disables the key and asks for confirmation first: "Applications using this key will immediately lose access." |

Both **Deactivate** and **Revoke** set the key inactive — revoke is the same soft disable behind a confirmation dialog, and the row stays in the list showing **Inactive**. Either way, the very next request with that key is refused with 401. The secret is never re-enabled by accident, but note that a revoked key can still be switched back on with **Activate**, so treat a truly compromised key as needing rotation, not just revocation.

## Using a Key

### Base URL

```
https://api.borderlessats.com
```

### Authentication

Send the key on every request. Two header forms are accepted:

```
X-API-Key: blss_live_...
```

```
Authorization: Bearer blss_live_...
```

A request with no key, a key that does not start with `blss_`, an unknown key, or an expired key is refused with 401.

### Example requests

```bash
curl https://api.borderlessats.com/api/v1/candidates \
  -H "X-API-Key: blss_live_YOUR_KEY_HERE"
```

```javascript
const res = await fetch(
  'https://api.borderlessats.com/api/v1/candidates',
  { headers: { 'X-API-Key': 'blss_live_YOUR_KEY' } }
);
```

The API Keys page renders both of these snippets with a copy button, plus a **View Full Documentation →** link to the Swagger UI at `https://api.borderlessats.com/api/docs`.

## What the Key Unlocks

Four resource groups are exposed under `/api/v1`:

| Resource | Base path | Operations |
|----------|-----------|------------|
| Candidates | `/api/v1/candidates` | `GET` list, `GET /:uid`, `POST`, `PATCH /:uid`, `DELETE /:uid` |
| Job Positions | `/api/v1/job-positions` | `GET` list, `GET /:uid`, `POST`, `PATCH /:uid` |
| Applications | `/api/v1/applications` | `GET` list, `GET /:uid`, `POST`, `PATCH /:uid` |
| Webhooks | `/api/v1/webhooks` | `POST`, `GET` list, `GET /:uid`, `PATCH /:uid`, `DELETE /:uid` |

Job positions have no delete endpoint on the public API, and applications have neither a delete nor a public creation path beyond `POST`.

All resources are addressed by **UID**, never by a numeric database ID.

## Rate Limits

Every `/api/v1` controller is throttled at **1,000 requests per hour**, counted **per API key** rather than per IP address. Exceeding it returns HTTP 429.

Issuing separate keys per integration therefore also separates their rate-limit budgets.

## Good Practice

- **One key per integration.** You can then revoke a single consumer without breaking the others, and **Last Used** tells you which is which.
- **Set an expiry** on keys handed to contractors or short-lived jobs.
- **Never put a key in front-end code.** Anything in a browser bundle is public; the public API is for server-to-server use.
- **Rotate by overlap.** Create the new key, deploy it, confirm **Last Used** moves on the new key, then revoke the old one.

## Next Steps

- [Public API reference](../api/public-api.md) - Full endpoint and payload reference
- [API Keys API](../api/api-keys.md) - Key management endpoints
- [Webhooks](../api/webhooks.md) - Outbound event delivery
- [Roles and Permissions](./roles-and-permissions.md) - Who can manage keys
