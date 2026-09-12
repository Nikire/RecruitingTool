# AI and Quota APIs

Borderless uses Google Gemini to parse resumes, score candidates against a job position, rank a shortlist and compare candidates side by side. Every AI call consumes company quota, so three namespaces work together: `/api/ai` performs the work, `/api/ai-quota` tracks and administers AI allowances, and `/api/quota` reports overall plan usage. This page covers all three.

## Base URLs

```
http://localhost:4000/api/ai
http://localhost:4000/api/ai-quota
http://localhost:4000/api/quota
```

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `GEMINI_API_KEY` | — | Required. Without it `GeminiService` logs a warning at boot and every AI route returns `500 AI API is not configured` |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Model name; `gemini-1.5-pro` is the documented alternative |
| `GEMINI_TIER` | `free` | `free` or `paid`; selects the client-side pacing profile |

`GEMINI_TIER` does not change the model — it changes how aggressively `GeminiService` paces its own requests so it stays inside Google's quota:

| Tier | Requests per minute | Minimum delay between requests | Max retries | Base backoff |
|------|--------------------|-------------------------------|-------------|--------------|
| `free` | 12 | 5000 ms | 3 | 2000 ms |
| `paid` | 360 | 167 ms | 5 | 1000 ms |

The free profile is deliberately set to 12 RPM rather than Google's 15, to leave headroom.

## AI endpoints (`/api/ai`)

All routes require `@Auth([HR, ADMIN, SUPER_ADMIN])` — effectively `HR` and above on the role ladder.

| Method | Path | Throttle | Success status |
|--------|------|----------|----------------|
| `POST` | `/api/ai/parse-resume` | 10 / hour | 200 |
| `POST` | `/api/ai/score-candidate` | 10 / hour | 200 |
| `GET` | `/api/ai/score/:candidateUid/:jobPositionUid` | global | 200 |
| `GET` | `/api/ai/rankings/:jobPositionUid` | global | 200 |
| `POST` | `/api/ai/compare-candidates` | 5 / hour | 200 |
| `POST` | `/api/ai/batch-score` | 5 / hour | 202 |
| `GET` | `/api/ai/batch-score/:batchId/status` | global | 200 |
| `GET` | `/api/ai/batch-score/:batchId/results` | global | 200 |
| `DELETE` | `/api/ai/batch-score/:batchId` | global | 200 |
| `GET` | `/api/ai/scoring-weights` | global | 200 |
| `PUT` | `/api/ai/scoring-weights` | global | 200 |

The per-route throttles are declared with `@Throttle({ default: { limit, ttl } })` directly on the handlers and are **per IP**, like the global limiter. There is no separate named AI throttler bucket. `THROTTLE_AI_TTL` and `THROTTLE_AI_LIMIT` exist in `.env.example` but are only read by `SystemSettingsService` to populate the admin System Settings screen — changing them does not change what the AI routes enforce.

### Parse a resume

```http
POST /api/ai/parse-resume
Authorization: Bearer <access token>
Content-Type: application/json

{ "fileUrl": "https://api.borderlessats.com/storage/borderless-files/documents/resume.pdf" }
```

Takes the URL of an already-uploaded resume (see [Files API](./files.md)) and returns structured fields extracted by Gemini. Supports PDF, DOCX and TXT.

### Score one candidate

```http
POST /api/ai/score-candidate
Content-Type: application/json

{
  "candidateUid": "550e8400-e29b-41d4-a716-446655440000",
  "jobPositionUid": "550e8400-e29b-41d4-a716-446655440001"
}
```

Returns skills, experience and education match scores plus a written analysis and recommendation.

### Read an existing score

```http
GET /api/ai/score/{candidateUid}/{jobPositionUid}
```

Returns the stored score without spending a new AI call.

### Rank candidates for a position

```http
GET /api/ai/rankings/{jobPositionUid}
```

Returns the candidates already scored for that position, ordered by score.

### Compare candidates

```http
POST /api/ai/compare-candidates
Content-Type: application/json

{
  "candidateUids": ["550e...000", "550e...001", "550e...002"],
  "jobPositionUid": "550e...010"
}
```

`candidateUids` must contain between **2 and 5** entries; anything outside that range returns `400`.

### Batch scoring

```http
POST /api/ai/batch-score
Content-Type: application/json

{
  "jobPositionUid": "550e8400-e29b-41d4-a716-446655440001",
  "candidateUids": ["550e...000", "550e...002"],
  "priority": "normal"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `jobPositionUid` | string | Yes | |
| `candidateUids` | string[] | No | Omit to score **every** candidate for the position |
| `priority` | enum | No | `BatchPriority`; defaults to `normal` |

Returns `202 Accepted` with a batch identifier; the job runs in the background. Returns `400` if AI quota is exhausted.

```http
GET    /api/ai/batch-score/{batchId}/status
GET    /api/ai/batch-score/{batchId}/results
DELETE /api/ai/batch-score/{batchId}
```

Batch status values come from the `BatchStatus` enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`.

### Scoring weights

```http
GET /api/ai/scoring-weights
PUT /api/ai/scoring-weights
Content-Type: application/json

{ "skillsWeight": 40, "experienceWeight": 35, "educationWeight": 25 }
```

Each weight is an integer from 0 to 100 and **the three must sum to 100**, otherwise the request returns `400`. Weights are per company and feed directly into the composite score.

## AI quota endpoints (`/api/ai-quota`)

Quota is tracked per company and per operation type. The `QuotaType` enum has three values:

```
RESUME_PARSING
CANDIDATE_SCORING
BATCH_SCORING
```

### Own-company routes

Require `@Auth([HR, ADMIN, SUPER_ADMIN])`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ai-quota/me` | All quotas for the caller's company |
| `GET` | `/api/ai-quota/me/:quotaType` | One quota by `QuotaType` |
| `POST` | `/api/ai-quota/use` | Consume quota; returns `403` when insufficient |
| `GET` | `/api/ai-quota/me/usage/history` | Usage log, filterable |

`GET /api/ai-quota/me/usage/history` accepts three optional query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | ISO 8601 | Lower bound |
| `endDate` | ISO 8601 | Upper bound |
| `operation` | `QuotaType` | Filter to one operation type |

`POST /api/ai-quota/use` is described in the code as internal use by the AI services; it returns `200` on success, `403 Insufficient quota` when the allowance is exhausted, and `404` when no quota record exists.

### Administrator routes

Require `@Auth([SUPER_ADMIN])`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ai-quota/:companyUid` | All quotas for any company |
| `GET` | `/api/ai-quota/:companyUid/:quotaType` | One quota for any company |
| `PUT` | `/api/ai-quota/:companyUid` | Create or update a quota limit |
| `GET` | `/api/ai-quota/:companyUid/usage/history` | Usage log for any company |

## Plan quota endpoints (`/api/quota`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/quota/plan-limits` | **None** | The limits attached to every tier — `FREE`, `PROFESSIONAL`, `ENTERPRISE` |
| `GET` | `/api/quota` | `USER`+ | The caller's company's current usage against its plan |

`GET /api/quota/plan-limits` carries no `@Auth()` decorator and is therefore public — it backs the pricing page.

## Related

- [Files API](./files.md) — uploading the resume whose URL `parse-resume` consumes
- [Billing API](./billing.md) — the subscription that sets the plan limits
- [Subscription and Limits](../user-guide/subscription-and-limits.md) — the same quotas from the user's side
- [Configuration](../getting-started/configuration.md) — `GEMINI_*` and `THROTTLE_*` variables
