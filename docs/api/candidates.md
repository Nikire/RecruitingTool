# Candidates API

API endpoints for managing candidate profiles.

## Base URL
```
http://localhost:4000/api/candidate
```

**Authentication Required:** All endpoints require `Authorization: Bearer <token>`
**Required Role:** HR, ADMIN, or SUPER_ADMIN

## Endpoints

### List All Candidates

```http
GET /candidate
```

**Response (200 OK):**
```json
[
  {
    "uid": "candidate-uuid-1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "source": "LinkedIn",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

### Get Candidate by UID

```http
GET /candidate/:uid
```

**Parameters:**
- `uid` (path): Candidate UID

**Response (200 OK):**
```json
{
  "uid": "candidate-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "LinkedIn",
  "hiringProcesses": [
    {
      "uid": "hiring-process-uuid",
      "status": "IN_PROGRESS",
      "jobPosition": {
        "uid": "job-uuid",
        "title": "Software Engineer"
      }
    }
  ],
  "files": [
    {
      "uid": "file-uuid",
      "originalName": "resume.pdf",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "notes": [
    {
      "uid": "note-uuid",
      "content": "Great candidate!",
      "author": {
        "uid": "user-uuid",
        "name": "HR Manager"
      },
      "createdAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

### Create Candidate

```http
POST /candidate
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "source": "Referral"
}
```

**Response (201 Created):**
```json
{
  "uid": "new-candidate-uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "source": "Referral",
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**Errors:**
- `409 Conflict` - Email already exists
- `400 Bad Request` - Validation errors

### Update Candidate

```http
PUT /candidate/:uid
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Jane Smith Updated",
  "phone": "+0987654321",
  "source": "LinkedIn"
}
```

**Response (200 OK):**
```json
{
  "uid": "candidate-uuid",
  "name": "Jane Smith Updated",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "source": "LinkedIn",
  "updatedAt": "2025-01-15T13:00:00.000Z"
}
```

### Delete Candidate (Soft Delete)

```http
DELETE /candidate/:uid
```

**Response (200 OK):**
```json
{
  "message": "Candidate soft deleted successfully",
  "uid": "candidate-uuid"
}
```

**Note:** Soft delete sets `deletedAt` timestamp but preserves data.

### Purge Candidate (GDPR - Hard Delete)

```http
DELETE /candidate/:uid/purge
```

**Required Role:** SUPER_ADMIN only

**Response (200 OK):**
```json
{
  "message": "Candidate and all associated data permanently deleted. Files deleted: 2",
  "uid": "candidate-uuid",
  "filesDeleted": 2
}
```

**Cascade Deletes:**
- All hiring processes
- All candidate notes
- All uploaded files (from storage)
- All activity logs

**Warning:** This action is irreversible!

## Candidate Notes API

### Create Note

```http
POST /candidate/:candidateUid/notes
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Excellent communication skills during phone screen."
}
```

**Response (201 Created):**
```json
{
  "uid": "note-uuid",
  "content": "Excellent communication skills during phone screen.",
  "author": {
    "uid": "user-uuid",
    "name": "HR Manager"
  },
  "candidateUid": "candidate-uuid",
  "createdAt": "2025-01-15T14:00:00.000Z"
}
```

### Get All Notes for Candidate

```http
GET /candidate/:candidateUid/notes
```

**Response (200 OK):**
```json
[
  {
    "uid": "note-uuid-1",
    "content": "Phone screen completed. Moving to technical interview.",
    "author": {
      "uid": "user-uuid",
      "name": "HR Manager"
    },
    "createdAt": "2025-01-15T14:00:00.000Z"
  }
]
```

### Update Note

```http
PUT /candidate/notes/:noteUid
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Updated note content"
}
```

**Response (200 OK):**
```json
{
  "uid": "note-uuid",
  "content": "Updated note content",
  "updatedAt": "2025-01-15T15:00:00.000Z"
}
```

**Permission:** Can only edit notes you created.

### Delete Note

```http
DELETE /candidate/notes/:noteUid
```

**Response (200 OK):**
```json
{
  "message": "Note deleted successfully"
}
```

**Permission:** Can only delete notes you created (or ADMIN can delete any).

## Validation Rules

**Name:**
- Required
- String
- Max length: 255 characters

**Email:**
- Required
- Must be valid email format
- Must be unique (case-insensitive)
- Max length: 255 characters

**Phone:**
- Optional
- String
- Max length: 20 characters

**Source:**
- Optional
- String
- Examples: "LinkedIn", "Indeed", "Referral", "Career Fair"

## Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Candidate not found",
  "error": "Not Found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "A candidate with this email address already exists",
  "error": "Conflict"
}
```

## Next Steps

- [Job Positions API](./job-positions.md)
- [Hiring Process API](./hiring-process.md)
- [Authentication](./authentication.md)
