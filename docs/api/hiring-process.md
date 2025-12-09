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

## Hiring Process Status

| Status | Description | Use Case |
|--------|-------------|----------|
| OPEN | Created but not started | Initial state |
| IN_PROGRESS | Candidate actively progressing | Most common |
| CLOSED | Process completed, not hired | Declined |
| CANCELLED | Process cancelled | Job or candidate withdrew |
| REJECTED | Candidate rejected | Not suitable |

## Stage Management

Stages are managed through the Stages API (`/api/stages`):

**Get Stage:**
```http
GET /stages/:uid
```

**Create Stage:**
```http
POST /stages
```

**Update Stage:**
```http
PUT /stages/:uid
```

**Delete Stage:**
```http
DELETE /stages/:uid
```

See API documentation at `/api` for complete Stage API reference.

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

See API documentation at `/api` for complete Interview API reference.

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

## Next Steps

- [Candidates API](./candidates.md)
- [Job Positions API](./job-positions.md)
- [Authentication](./authentication.md)
