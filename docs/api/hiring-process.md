# Hiring Process API

API endpoints for managing multi-stage hiring workflows.

## Base URL
```
http://localhost:4000/api/hiring-process
```

**Authentication Required:** All endpoints require authorization
**Required Role:** HR, ADMIN, or SUPER_ADMIN

## Endpoints

### List All Hiring Processes

```http
GET /hiring-process
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "uid": "hiring-process-uuid",
    "title": "Software Engineer - John Doe",
    "status": "IN_PROGRESS",
    "candidate": {
      "uid": "candidate-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "jobPosition": {
      "uid": "job-uuid",
      "title": "Software Engineer"
    },
    "currentStage": {
      "uid": "stage-uuid",
      "title": "Technical Interview",
      "position": 1
    },
    "createdAt": "2025-01-12T10:00:00.000Z",
    "updatedAt": "2025-01-15T14:00:00.000Z"
  }
]
```

### Get Hiring Process by UID

```http
GET /hiring-process/:uid
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "uid": "hiring-process-uuid",
  "title": "Software Engineer - John Doe",
  "status": "IN_PROGRESS",
  "candidate": {
    "uid": "candidate-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "jobPosition": {
    "uid": "job-uuid",
    "title": "Software Engineer",
    "department": "Engineering"
  },
  "stages": [
    {
      "uid": "stage-uuid-1",
      "title": "Phone Screening",
      "type": "INTERVIEW",
      "status": "DONE",
      "position": 0,
      "interviews": [
        {
          "uid": "interview-uuid",
          "scheduledDate": "2025-01-13",
          "scheduledTime": "14:00",
          "status": "COMPLETED"
        }
      ]
    },
    {
      "uid": "stage-uuid-2",
      "title": "Technical Interview",
      "type": "TECHNICAL_INTERVIEW",
      "status": "CURRENT",
      "position": 1,
      "interviews": []
    }
  ],
  "createdAt": "2025-01-12T10:00:00.000Z",
  "updatedAt": "2025-01-15T14:00:00.000Z"
}
```

### Create Hiring Process

```http
POST /hiring-process
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "candidateUid": "candidate-uuid",
  "jobPositionUid": "job-uuid",
  "status": "IN_PROGRESS"
}
```

**Required Fields:**
- `candidateUid` - Candidate UID
- `jobPositionUid` - Job position UID

**Optional Fields:**
- `title` - Auto-generated if not provided
- `status` - Default: "IN_PROGRESS"

**Response (201 Created):**
```json
{
  "uid": "new-hiring-process-uuid",
  "title": "Software Engineer - John Doe",
  "status": "IN_PROGRESS",
  "candidateUid": "candidate-uuid",
  "jobPositionUid": "job-uuid",
  "stages": [
    {
      "uid": "stage-uuid-1",
      "title": "Phone Screening",
      "status": "CURRENT",
      "position": 0
    }
  ],
  "createdAt": "2025-01-15T17:00:00.000Z"
}
```

**Errors:**
- `409 Conflict` - Candidate already has hiring process for this job
- `404 Not Found` - Candidate or job position not found
- `400 Bad Request` - Validation errors

**Business Rules:**
- One candidate can only have one hiring process per job position
- Stages are automatically copied from job position template
- First stage automatically set to CURRENT

### Update Hiring Process

```http
PUT /hiring-process/:uid
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "status": "CLOSED"
}
```

**Response (200 OK):**
```json
{
  "uid": "hiring-process-uuid",
  "title": "Updated Title",
  "status": "CLOSED",
  "updatedAt": "2025-01-15T18:00:00.000Z"
}
```

### Delete Hiring Process

```http
DELETE /hiring-process/:uid
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Hiring process deleted successfully"
}
```

## Listing and Filtering

### Paginated List

```http
GET /hiring-process/list?page=1&limit=20
Authorization: Bearer <token>
```

**Required role:** `USER` or above.

Returns a paginated envelope with advanced filtering and search applied through `HiringProcessFilterDto` query parameters.

### Grouped by Job Position

```http
GET /hiring-process/list-grouped?page=1&limit=20
Authorization: Bearer <token>
```

**Required role:** `USER` or above.

Returns paginated job-position groups, each carrying all of its hiring processes. This is the shape the pipeline board consumes.

## Moving a Candidate Through Stages

### Progress to the Next Stage

```http
POST /hiring-process/:uid/progress-stage
Authorization: Bearer <token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`. No request body.

Advances the process to the next stage by position, or completes it if the current stage is the last one.

### Move to a Specific Stage

```http
POST /hiring-process/:uid/move-to-stage/:stageUid
Authorization: Bearer <token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`. No request body.

Jumps the candidate to the named stage, forwards or backwards.

## Candidate Self-Service Status

### Generate an Access Code

```http
POST /hiring-process/:uid/generate-access-code
Authorization: Bearer <token>
```

**Required role:** `HR`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`. No request body.

**Response (201 Created):**
```json
{
  "accessCode": "A1B2C3D4",
  "expiresAt": "2026-03-01T00:00:00.000Z"
}
```

Send this code to the candidate; it unlocks the two public routes below.

### Check Status by Access Code (Public)

```http
GET /public/status/:accessCode
```

**No authentication.** Limited to 5 requests per minute per IP.

**Response (200 OK):**
```json
{
  "candidateName": "John",
  "positionTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "currentStage": "Technical Interview",
  "status": "IN_PROGRESS",
  "lastUpdated": "2026-02-20T14:00:00.000Z"
}
```

Only the candidate's first name is returned, for privacy. An invalid or expired code returns `404`.

### Full Tracking View (Public)

```http
GET /hiring-process/:uid/public?code=A1B2C3D4
```

**No authentication**, but the `code` query parameter is required. Limited to 30 requests per minute per IP.

Returns the tracking view with the full stage list, each stage marked `COMPLETED`, `CURRENT` or `PENDING`. An invalid or expired code returns `401`; an unknown UID returns `404`.

## Hiring Process Status

| Status | Description | Use Case |
|--------|-------------|----------|
| OPEN | Created but not started | Initial state |
| IN_PROGRESS | Candidate actively progressing | Most common |
| CLOSED | Process completed, not hired | Declined |
| CANCELLED | Process cancelled | Job or candidate withdrew |
| REJECTED | Candidate rejected | Not suitable |

## Stage Management

Stages are managed through the Stages API (`/api/stages`). The whole controller is gated by a class-level `@Auth(['HR', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])`, so every route below requires `HR` or above.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/stages` | Create one stage |
| `POST` | `/stages/bulk` | Create several stages in one call |
| `PATCH` | `/stages/reorder` | Atomically set every stage position in one transaction |
| `GET` | `/stages/list` | Paginated stage list with filtering |
| `GET` | `/stages/:uid` | One stage; cached for 5 minutes |
| `PUT` | `/stages/:uid` | Update a stage |
| `DELETE` | `/stages/:uid` | Delete a stage |
| `GET` | `/stages/:uid/metrics` | Time-tracking metrics (average, minimum, maximum time in stage) |

A stage object (`CreateStageDto`) requires `title` (3–100 characters), `type` (a `StageType` value such as `SCREENING`, `PHONE_SCREEN`, `HR_INTERVIEW`, `INTERVIEW`, `TECHNICAL_INTERVIEW`, `CASE_STUDY`, `TAKE_HOME_ASSIGNMENT`), `description` (max 500 characters) and `estimatedTime` (minutes, a number). `position`, `jobPositionUid` and `hiringProcessUid` are optional — set `jobPositionUid` for a job-position template stage and `hiringProcessUid` for a stage that belongs to one candidate's process.

**Bulk create** takes a bare JSON array of stage objects, not a wrapper:

```http
POST /stages/bulk
Content-Type: application/json

[
  {
    "hiringProcessUid": "hp-uuid",
    "title": "Phone Screen",
    "type": "PHONE_SCREEN",
    "description": "Initial 30-minute screening call",
    "estimatedTime": 30,
    "position": 0
  },
  {
    "hiringProcessUid": "hp-uuid",
    "title": "Technical Interview",
    "type": "TECHNICAL_INTERVIEW",
    "description": "Live coding and system design",
    "estimatedTime": 60,
    "position": 1
  }
]
```

**Reorder** takes every affected stage and its new position, applied in a single transaction so no intermediate state ever violates a uniqueness constraint:

```http
PATCH /stages/reorder
Content-Type: application/json

{
  "stages": [
    { "uid": "stage-uuid-1", "position": 1 },
    { "uid": "stage-uuid-2", "position": 0 }
  ]
}
```

**Response:** `{ "message": "Stages reordered successfully" }`

## Stage Notes

There are **two separate note APIs**, with different data models. Pick the one that matches the shape you need.

### Multiple notes per stage (`/stages`)

Part of the Stages controller, so `HR` or above.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/stages/:stageUid/notes` | Create a note on a stage |
| `GET` | `/stages/:stageUid/notes` | List every note on a stage |
| `PUT` | `/stages/notes/:noteUid` | Update a note — author only |
| `DELETE` | `/stages/notes/:noteUid` | Delete a note — author only |

### One note per stage per hiring process (`/hiring-processes`)

A separate controller mounted at `/hiring-processes/:hiringProcessUid/stages/:stageUid/note` (note the singular `note`). It enforces **one note per stage per hiring process** and has no `POST` — creation and update are the same upsert call.

| Method | Path | Purpose |
|--------|------|---------|
| `PUT` | `/hiring-processes/:hiringProcessUid/stages/:stageUid/note` | Create or update the note |
| `GET` | `/hiring-processes/:hiringProcessUid/stages/:stageUid/note` | Read it; `404` when none exists |
| `DELETE` | `/hiring-processes/:hiringProcessUid/stages/:stageUid/note` | Delete it |

**Required role:** `HR`, `HR_MANAGER`, `COMPANY_OWNER`, `ADMIN` or `SUPER_ADMIN`.

## Async Stages

Take-home style stages that a candidate completes on their own time live in their own module, split across two controllers.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/async-stage/send` | `HR`, `HR_MANAGER`, `COMPANY_OWNER`, `ADMIN`, `SUPER_ADMIN` | Email a submission link to the candidate |
| `GET` | `/async-stage/stage/:stageUid/process/:processUid` | Same | Submission state for one stage |
| `GET` | `/async-stage/submission/:submissionUid` | Same | One submission |
| `PATCH` | `/async-stage/submission/:submissionUid/review` | Same | Record the reviewer's verdict |
| `DELETE` | `/async-stage/token/:tokenUid` | Same | Revoke an outstanding submission token |
| `GET` | `/public/async-stage/:token` | Token | Validate the token, return the brief |
| `POST` | `/public/async-stage/:token/submit` | Token | Submit text and up to 10 files, 100 MB each |
| `GET` | `/public/async-stage/:token/files/:fileUid/download` | Token | Signed download URL for a submitted file |

See [Public Endpoints](./public-endpoints.md#async-stages-single-use-token) for the token failure codes, and [Async Stages](../user-guide/async-stages.md) for the feature from the user's side.

The complete Stage and Async Stage schemas are in the internal Swagger document at `/api/internal-docs`.

## Interview Management

Interviews are managed through the Interview API (`/api/interview`):

**Create Interview:**
```http
POST /interview
Content-Type: application/json

{
  "stageUid": "stage-uuid",
  "scheduledDate": "2025-01-20",
  "scheduledTime": "14:00",
  "duration": 60,
  "meetingLink": "https://zoom.us/j/123456",
  "notes": "Technical assessment"
}
```

**Get Interview:**
```http
GET /interview/:uid
```

**Update Interview:**
```http
PUT /interview/:uid
```

**Cancel Interview:**
```http
PUT /interview/:uid/cancel
```

See the internal Swagger document at `/api/internal-docs` for the complete Interview API reference.

## Validation Rules

**CandidateUid:** Required, must exist
**JobPositionUid:** Required, must exist
**Status:** Must be OPEN, IN_PROGRESS, CLOSED, CANCELLED, or REJECTED
**Title:** Optional, max 255 characters (auto-generated if not provided)

## Error Responses

**409 Conflict - Duplicate Application:**
```json
{
  "statusCode": 409,
  "message": "This candidate has already applied to this job position",
  "error": "Conflict"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Hiring process not found",
  "error": "Not Found"
}
```

## Related

- [Candidates API](./candidates.md) — the candidate records these processes attach to
- [Job Positions API](./job-positions.md) — template stages copied into a new process
- [Public Endpoints](./public-endpoints.md) — the candidate-facing status and async-stage routes
- [Authentication](./authentication.md) — the role ladder behind each `@Auth` list
