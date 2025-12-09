# Authentication API

Complete guide to authentication and authorization in Recruiting Tool API.

## Overview

Recruiting Tool uses **JWT (JSON Web Tokens)** for authentication with **role-based authorization**.

**Base URL:** `http://localhost:4000/api`

## Authentication Endpoints

### Register

Create a new user account.

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "companyId": 1
}
```

**Response (201 Created):**
```json
{
  "user": {
    "uid": "user-uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["USER"],
    "companyUid": "company-uuid-here"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `409 Conflict` - Email already exists
- `400 Bad Request` - Validation errors

### Sign In

Authenticate user and receive JWT token.

```http
POST /auth/sign-in
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "uid": "user-uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["USER", "HR"],
    "companyUid": "company-uuid-here"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

### Get Current User

Get authenticated user's profile.

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "uid": "user-uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["USER", "HR"],
  "companyUid": "company-uuid-here",
  "company": {
    "uid": "company-uuid-here",
    "name": "Acme Corp"
  },
  "position": "Senior Recruiter",
  "department": "Human Resources"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found

## Authorization

### JWT Token

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature
```

**Token Payload:**
```json
{
  "userId": 123,
  "email": "john@example.com",
  "roles": ["USER", "HR"],
  "companyId": 1,
  "iat": 1701234567,
  "exp": 1701320967
}
```

**Token Expiration:**
- Default: 1 day (24 hours)
- Configurable via `JWT_EXPIRATION` environment variable

### Using Tokens

**Include token in Authorization header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example with cURL:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:4000/api/candidates
```

**Example with JavaScript (Axios):**
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

const response = await axios.get('/api/candidates');
```

### Role-Based Authorization

Endpoints require specific roles:

| Role | Level | Access |
|------|-------|--------|
| `USER` | 1 | Basic read access |
| `HR` | 2 | Hiring management |
| `ADMIN` | 3 | Administrative functions |
| `SUPER_ADMIN` | 4 | System administration |

**Higher roles include lower role permissions.**

## Role Requirements by Endpoint

### Public Endpoints (No Auth Required)

- `POST /auth/register`
- `POST /auth/sign-in`
- `GET /job-position` - List all open job positions
- `GET /job-position/:uid` - Get job position details
- `GET /hiring-process/:uid` - Get hiring process details
- `POST /applications` - Submit job application
- `GET /health/*` - Health check endpoints

### USER Role Required

- `GET /auth/me` - Get current user
- `GET /users/list` - List users
- `GET /users/:uid` - Get user details
- `PUT /users/:uid` - Update own profile
- View candidates, job positions, hiring processes
- Submit interview scorecards
- Add candidate notes

### HR Role Required

- Create, edit, delete candidates
- Create, edit, delete job positions
- Create, edit, delete hiring processes
- Schedule interviews
- Review applications
- Access analytics

### ADMIN Role Required

- Create users
- Edit users
- Deactivate/reactivate users
- Manage companies
- View user activity logs
- Access admin dashboard

### SUPER_ADMIN Role Required

- Delete users permanently
- Purge candidate data (GDPR)
- Delete companies
- Full system access

## Error Responses

### 401 Unauthorized

**No token provided:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Invalid or expired token:**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### 403 Forbidden

**Insufficient permissions:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

**Missing required role:**
```json
{
  "statusCode": 403,
  "message": "User does not have required roles: HR, ADMIN",
  "error": "Forbidden"
}
```

## Security Best Practices

### Token Storage

**Frontend (Browser):**
- Store token in `localStorage` (current implementation)
- Include in Authorization header for all authenticated requests

**Recommended for Production:**
- Use HTTP-only cookies for better security
- Implement refresh token mechanism
- Short-lived access tokens (15 minutes) + long-lived refresh tokens (7 days)

### Password Requirements

**Minimum Requirements:**
- Length: 8+ characters
- Complexity: Mix of letters, numbers recommended
- No common passwords

**Production Recommendations:**
- Enforce strong passwords
- Implement password complexity rules
- Require periodic password changes
- Enable two-factor authentication (future)

### CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Your frontend domain

**Backend CORS setup** (`main.ts`):
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## Example: Complete Authentication Flow

### 1. Sign In

**Request:**
```http
POST /auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "uid": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["HR"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiSFIiXX0.signature"
}
```

### 2. Store Token

```javascript
localStorage.setItem('authToken', response.data.token);
```

### 3. Make Authenticated Request

**Request:**
```http
GET /candidates
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "uid": "candidate-1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "source": "LinkedIn"
  }
]
```

### 4. Logout

```javascript
localStorage.removeItem('authToken');
// Redirect to login page
```

## Rate Limiting

**Default Limits:**
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1701234567
```

**Error Response (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

## Swagger API Documentation

Access interactive API documentation:

**URL:** `http://localhost:4000/api`

**Features:**
- Try out endpoints directly
- View request/response schemas
- See authentication requirements
- Test with your token

**Add token in Swagger:**
1. Click **Authorize** button
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click **Authorize**
4. All requests will include token

## Next Steps

- [Candidates API](./candidates.md) - Candidate management endpoints
- [Job Positions API](./job-positions.md) - Job position endpoints
- [Hiring Process API](./hiring-process.md) - Hiring process workflows
