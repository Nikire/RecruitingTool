# Job Positions API

API endpoints for managing job positions and stage templates.

## Base URL
```
http://localhost:4000/api/job-position
```

**Public Endpoints:** `/job-position` (GET), `/job-position/:uid` (GET)
**Protected Endpoints:** Require HR, ADMIN, or SUPER_ADMIN role

## Endpoints

### List All Job Positions

```http
GET /job-position
```

**Public Access** - No authentication required

**Response (200 OK):**
```json
[
  {
    "uid": "job-uuid-1",
    "title": "Senior Software Engineer",
    "description": "We are looking for...",
    "department": "Engineering",
    "employmentType": "Full-time",
    "location": "Remote",
    "salaryMin": 90000,
    "salaryMax": 120000,
    "status": "OPEN",
    "createdAt": "2025-01-10T10:00:00.000Z"
  }
]
```

### List All Open Positions (Careers Page)

```http
GET /job-position/public/all
```

**Public Access** - Returns only OPEN positions

**Query Parameters:**
- `companyUid` (optional): Filter by company
- `department` (optional): Filter by department
- `location` (optional): Filter by location

**Response (200 OK):**
```json
[
  {
    "uid": "job-uuid",
    "title": "Software Engineer",
    "description": "Full job description...",
    "department": "Engineering",
    "employmentType": "Full-time",
    "location": "Remote",
    "salaryMin": 80000,
    "salaryMax": 110000,
    "requiredSkills": ["React", "TypeScript", "Node.js"],
    "benefits": "Health insurance, 401k, unlimited PTO",
    "applicationDeadline": "2025-02-28T23:59:59.000Z",
    "company": {
      "uid": "company-uuid",
      "name": "Acme Corp"
    }
  }
]
```

### Get Job Position by UID

```http
GET /job-position/:uid
```

**Public Access** - No authentication required

**Response (200 OK):**
```json
{
  "uid": "job-uuid",
  "title": "Senior Software Engineer",
  "description": "We are looking for a Senior Software Engineer...",
  "department": "Engineering",
  "employmentType": "Full-time",
  "location": "San Francisco, CA / Remote",
  "salaryMin": 90000,
  "salaryMax": 120000,
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "benefits": "Competitive salary, health insurance, 401k matching",
  "applicationDeadline": "2025-02-15T23:59:59.000Z",
  "status": "OPEN",
  "createdBy": {
    "uid": "user-uuid",
    "name": "HR Manager"
  },
  "company": {
    "uid": "company-uuid",
    "name": "Acme Corp"
  },
  "stages": [
    {
      "uid": "stage-uuid-1",
      "title": "Phone Screening",
      "type": "INTERVIEW",
      "description": "Initial 30-minute phone call",
      "estimatedTime": "1 week",
      "position": 0
    },
    {
      "uid": "stage-uuid-2",
      "title": "Technical Interview",
      "type": "TECHNICAL_INTERVIEW",
      "description": "1-hour technical assessment",
      "estimatedTime": "1 week",
      "position": 1
    }
  ],
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

### Create Job Position

```http
POST /job-position
Content-Type: application/json
Authorization: Bearer <token>
```

**Required Role:** HR, ADMIN, or SUPER_ADMIN

**Request Body:**
```json
{
  "title": "Backend Developer",
  "description": "Join our backend team...",
  "department": "Engineering",
  "employmentType": "Full-time",
  "location": "New York, NY",
  "salaryMin": 80000,
  "salaryMax": 110000,
  "requiredSkills": ["Node.js", "PostgreSQL", "Docker"],
  "benefits": "Health, dental, vision, 401k",
  "applicationDeadline": "2025-03-01T23:59:59.000Z",
  "status": "OPEN",
  "stages": [
    {
      "title": "Phone Screen",
      "type": "INTERVIEW",
      "description": "Initial screening call",
      "estimatedTime": "1 week",
      "position": 0
    },
    {
      "title": "Technical Interview",
      "type": "TECHNICAL_INTERVIEW",
      "description": "Technical assessment",
      "estimatedTime": "1-2 weeks",
      "position": 1
    }
  ]
}
```

**Required Fields:**
- `title`
- `description`
- `status` (OPEN, CLOSED, CANCELLED)

**Optional Fields:**
- `department`, `employmentType`, `location`
- `salaryMin`, `salaryMax`
- `requiredSkills` (array)
- `benefits`
- `applicationDeadline` (ISO date string)
- `stages` (array)

**Response (201 Created):**
```json
{
  "uid": "new-job-uuid",
  "title": "Backend Developer",
  "status": "OPEN",
  "stages": [...]
}
```

### Update Job Position

```http
PUT /job-position/:uid
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Senior Backend Developer",
  "status": "CLOSED",
  "salaryMax": 130000
}
```

**Response (200 OK):**
```json
{
  "uid": "job-uuid",
  "title": "Senior Backend Developer",
  "status": "CLOSED",
  "salaryMax": 130000,
  "updatedAt": "2025-01-15T16:00:00.000Z"
}
```

### Delete Job Position

```http
DELETE /job-position/:uid
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Job position soft deleted successfully"
}
```

**Effect:**
- Job position soft-deleted
- Template stages soft-deleted
- Associated hiring processes preserved (jobPositionId set to NULL)

## Validation Rules

**Title:** Required, max 255 characters
**Description:** Required, max 5000 characters
**Status:** Required, must be OPEN, CLOSED, or CANCELLED
**Employment Type:** Optional, max 100 characters
**Salary:** Optional, must be positive numbers
**Required Skills:** Optional array of strings
**Application Deadline:** Optional ISO date string

## Job Status

| Status | Visible on Careers Page | Accepts Applications | Use Case |
|--------|-------------------------|----------------------|----------|
| OPEN | ✅ Yes | ✅ Yes | Active hiring |
| CLOSED | ❌ No | ❌ No | Position filled |
| CANCELLED | ❌ No | ❌ No | Position cancelled |

## Next Steps

- [Hiring Process API](./hiring-process.md)
- [Candidates API](./candidates.md)
- [Authentication](./authentication.md)
