# Job Positions API

API endpoints for managing job positions and stage templates.

## Base URL
```
http://localhost:4000/api/job-position
```

**Public endpoints:** `/job-position/public/all`, `/job-position/public/:uid`
**Protected endpoints:** everything else — see the role list on each endpoint below

## Two independent status fields

A posting carries two states that are easy to confuse.

| Field | Enum | Controlled by | Effect |
|-------|------|---------------|--------|
| `status` | `OPEN`, `CLOSED`, `CANCELLED` | The company | The company's own lifecycle |
| `moderationStatus` | `PENDING_APPROVAL`, `APPROVED`, `REJECTED` | Platform administrators, via `/api/admin/job-moderation` | Anti-spam gate |

A posting appears on the public careers board **only when `status` is `OPEN` and `moderationStatus` is `APPROVED`.** Both public endpoints filter on both fields, and on `deletedAt: null`. A posting can be `APPROVED` and `CLOSED` at the same time.

## Public endpoints

### List Open Positions (Careers Page)

```http
GET /job-position/public/all
```

**Public access** — no authentication required. Responses are cached by a `CacheInterceptor` for **10 minutes**, so a newly published posting can take that long to appear.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Case-insensitive match on title or description |
| `category` | string | — | Case-insensitive match on job category |
| `jobType` | enum | — | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `TEMPORARY`, `FREELANCE` |
| `workLocation` | enum | — | `REMOTE`, `HYBRID`, `ON_SITE` |
| `experienceLevel` | enum | — | `ENTRY`, `MID`, `SENIOR`, `LEAD`, `EXECUTIVE` |
| `salaryMin` | integer | — | Minimum 0 |
| `salaryMax` | integer | — | Minimum 0 |
| `companyUid` | string | — | Filter to one company |
| `city` | string | — | |
| `country` | string | — | |
| `sortBy` | enum | `createdAt` | `createdAt`, `salary`, `title` |
| `sortOrder` | enum | `desc` | `asc`, `desc` |
| `page` | integer | 1 | 1-indexed |
| `limit` | integer | 12 | Maximum 100 |

There is no `department` or `location` parameter — those names appear nowhere in the filter DTO. Use `category` and `city`/`country`/`workLocation` instead.

> The Swagger annotation on this route lists `ONSITE` for `workLocation` and omits `FREELANCE` from `jobType`. Validation runs against the Prisma enums, so the values accepted are the ones in the table above: `ON_SITE`, and `FREELANCE` is valid.

**Response (200 OK)** — a paginated envelope, not a bare array:

```json
{
  "data": [
    {
      "uid": "job-uuid",
      "title": "Software Engineer",
      "description": "Full job description...",
      "status": "OPEN",
      "jobCategory": "Engineering",
      "jobType": "FULL_TIME",
      "workLocation": "REMOTE",
      "salaryMin": 80000,
      "salaryMax": 110000,
      "salaryCurrency": "USD",
      "salaryPeriod": "YEARLY",
      "showSalary": true,
      "experienceLevel": "SENIOR",
      "educationLevel": "Bachelor's degree",
      "skills": ["React", "TypeScript", "Node.js"],
      "requirements": ["5+ years experience"],
      "responsibilities": ["Lead development team"],
      "benefits": ["Health insurance", "401k"],
      "tags": ["frontend", "remote"],
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "isUrgent": false,
      "isFeatured": false,
      "isHighlighted": false,
      "applicationDeadline": "2026-02-28T23:59:59.000Z",
      "viewCount": 1200,
      "applicationCount": 42,
      "candidateSource": "LinkedIn",
      "companyName": "Acme Corp",
      "companyDescription": "...",
      "companyLogoUrl": "https://...",
      "companyWebsite": "https://acme.example",
      "companyIndustry": "Software",
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 12,
  "totalPages": 13
}
```

### Get a Public Job Position

```http
GET /job-position/public/:uid
```

**Public access** — no authentication required. Also cached for 10 minutes.

Returns a single `PublicJobPositionResponseDto` with the same fields as the list entries, plus `customQuestions` (the application form's extra questions) and `stages` (the template stages shown as the hiring process outline).

A malformed UID returns `404`, not a `500`. A posting that is not both `OPEN` and `APPROVED` also returns `404`.

### List Companies with Open Positions

```http
GET /company/public/with-jobs
```

**Public access** — no authentication required, cached for 10 minutes. Backs the company filter on the careers board.

Returns companies that have at least one job position which is `OPEN`, `APPROVED` and not soft-deleted, ordered alphabetically by name.

**Response (200 OK):**
```json
[
  {
    "uid": "company-uuid",
    "name": "Acme Corp",
    "logoUrl": "https://...",
    "website": "https://acme.example",
    "industry": "Software",
    "description": "..."
  }
]
```

## Authenticated endpoints

### List Job Positions

```http
GET /job-position
Authorization: Bearer <access token>
```

**Required role:** `USER` or above (`@Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN', 'USER'])`). Cached for 1 minute.

Returns the caller's company's positions as an array of `JobPositionResponseDto`.

### List Job Positions (paginated)

```http
GET /job-position/list?page=1&limit=20&clientUid=<uid>
Authorization: Bearer <access token>
```

**Required role:** `USER` or above.

`clientUid` filters to roles being filled for one end client — "show me every open role for Acme".

### Get Job Position by UID

```http
GET /job-position/:uid
Authorization: Bearer <access token>
```

**Required role:** `USER` or above. Company-scoped.

### Create Job Position

```http
POST /job-position
Content-Type: application/json
Authorization: Bearer <access token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`. Subject to the `jobPositions` plan quota — exceeding it returns `402 Payment Required`.

**Request Body:**
```json
{
  "title": "Backend Developer",
  "description": "Join our backend team...",
  "jobCategory": "Engineering",
  "jobType": "FULL_TIME",
  "workLocation": "ON_SITE",
  "city": "New York",
  "state": "New York",
  "country": "United States",
  "salaryMin": 80000,
  "salaryMax": 110000,
  "salaryCurrency": "USD",
  "salaryPeriod": "YEARLY",
  "showSalary": true,
  "experienceLevel": "MID",
  "educationLevel": "Bachelor's degree",
  "skills": ["Node.js", "PostgreSQL", "Docker"],
  "requirements": ["3+ years backend experience"],
  "responsibilities": ["Design and ship APIs"],
  "benefits": ["Health", "Dental", "401k"],
  "tags": ["backend", "nodejs"],
  "applicationDeadline": "2026-03-01T23:59:59.000Z",
  "stages": [
    { "title": "Phone Screen", "type": "INTERVIEW", "position": 0 },
    { "title": "Technical Interview", "type": "TECHNICAL_INTERVIEW", "position": 1 }
  ]
}
```

**Required field:** `title` only.

**Optional fields:** `description`, `customQuestions[]`, `jobCategory`, `jobType`, `workLocation`, `salaryMin`, `salaryMax`, `salaryCurrency`, `salaryPeriod`, `showSalary`, `experienceLevel`, `educationLevel`, `skills[]`, `requirements[]`, `responsibilities[]`, `benefits[]`, `tags[]`, `city`, `state`, `country`, `isUrgent`, `isFeatured`, `isHighlighted`, `applicationDeadline`, `candidateSource`, `clientUid`, `stages[]`.

`benefits`, `requirements`, `responsibilities`, `skills` and `tags` are **arrays of strings**, not free text. There is no `employmentType`, `location` or `requiredSkills` field — use `jobType`, the `city`/`state`/`country`/`workLocation` set, and `skills`.

### Update Job Position

```http
PUT /job-position/:uid
Content-Type: application/json
Authorization: Bearer <access token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`. Every field is optional.

```json
{
  "title": "Senior Backend Developer",
  "status": "CLOSED",
  "salaryMax": 130000
}
```

### Delete Job Position

```http
DELETE /job-position/:uid
Authorization: Bearer <access token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`.

**Response (200 OK):**
```json
{ "message": "Job position soft deleted successfully" }
```

**Effect:**
- Job position soft-deleted
- Template stages soft-deleted
- Associated hiring processes preserved (`jobPositionId` set to NULL)

## Validation Rules

**Title:** required, 1–255 characters
**Description:** optional string
**Status:** optional on create (defaults to `OPEN`); must be `OPEN`, `CLOSED` or `CANCELLED`
**Salary:** optional integers, minimum 0
**Arrays:** `skills`, `requirements`, `responsibilities`, `benefits`, `tags` are arrays of strings
**Application Deadline:** optional ISO date string

## Job Status

| Status | Visible on Careers Page | Accepts Applications | Use Case |
|--------|-------------------------|----------------------|----------|
| OPEN | Yes, if `moderationStatus` is `APPROVED` | Yes | Active hiring |
| CLOSED | No | No | Position filled |
| CANCELLED | No | No | Position cancelled |

## Moderation Status

| Status | Visible on Careers Page | Set by |
|--------|-------------------------|--------|
| PENDING_APPROVAL | No | The default for a new posting when the company has no active paid subscription |
| APPROVED | Yes, if `status` is `OPEN` | Set automatically at creation when the creator is a `SUPER_ADMIN` **or** the company has an active paid subscription; otherwise set by an administrator |
| REJECTED | No | Administrator, with a `moderationReason` |

Administrators manage this through `/api/admin/job-moderation`.

## Related

- [Hiring Process API](./hiring-process.md) — the workflow a candidate moves through
- [Candidates API](./candidates.md) — candidate records
- [Public Endpoints](./public-endpoints.md) — the careers-page surface in full
- [Authentication](./authentication.md) — the role ladder behind each `@Auth` list
