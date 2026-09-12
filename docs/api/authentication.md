# Authentication API

Complete guide to authentication and authorization in the BorderLess API.

## Overview

BorderLess uses **JWT access tokens** paired with **opaque, rotating refresh tokens**, and authorizes with a **role ladder**. Optional Auth0 social login is layered on top for Google, GitHub and similar providers.

**Base URL:** `http://localhost:4000/api`

Two other credential types exist for non-user callers — Public API keys and shared machine secrets. They are documented in [Public API](./public-api.md) and [Internal and Metrics APIs](./internal-and-metrics.md).

## Endpoint index

`auth.controller.ts` exposes 19 routes.

| Method | Path | Auth required | Rate limit |
|--------|------|---------------|-----------|
| `POST` | `/auth/register` | No | 3 / hour per IP |
| `POST` | `/auth/sign-in` | No | 5 / 15 min per IP |
| `GET` | `/auth/me` | Access token | Skipped |
| `POST` | `/auth/refresh` | Refresh token in body | 30 / min |
| `POST` | `/auth/logout` | Refresh token in body | Skipped |
| `POST` | `/auth/logout-all` | Access token | Skipped |
| `POST` | `/auth/complete-onboarding` | Access token | Skipped |
| `POST` | `/auth/forgot-password` | No | 3 / 15 min |
| `POST` | `/auth/reset-password` | Reset token in body | 5 / 15 min |
| `GET` | `/auth/verify-email` | Token in query | Skipped |
| `POST` | `/auth/resend-verification` | Access token | 3 / 5 min |
| `POST` | `/auth/social/callback` | Auth0 token | 10 / min |
| `POST` | `/auth/link-social` | Auth0 token **and** `X-Local-Token` | 5 / min |
| `DELETE` | `/auth/unlink-social` | Access token | Skipped |
| `GET` | `/auth/linked-accounts` | Access token | Skipped |
| `POST` | `/auth/change-email/request` | Access token | Skipped |
| `POST` | `/auth/change-email/confirm` | Access token | Skipped |
| `POST` | `/auth/change-password/request` | Access token | Skipped |
| `POST` | `/auth/change-password/confirm` | Access token | Skipped |
| `POST` | `/auth/add-email` | Access token | Skipped |

Routes marked "Skipped" carry `@SkipThrottle()` and bypass the global IP limiter.

## Core endpoints

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
  "password": "SecurePassword123",
  "companyName": "Acme Corp",
  "roles": ["COMPANY_OWNER"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | |
| `email` | string | Yes | Must be a valid address |
| `password` | string | Yes | 3–20 characters as validated by `CreateUserDto` |
| `companyUid` | string | No | Join an existing company |
| `companyName` | string | No | Used when `roles` includes `COMPANY_OWNER` and no `companyUid` is given — a company is created automatically |
| `roles` | `RolesType[]` | No | |
| `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent` | string | No | Max 255 each; captured at signup |
| `referrerUrl`, `landingPath` | string | No | Max 2048 each |

**Response (201 Created):**
```json
{
  "user": {
    "uid": "user-uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["COMPANY_OWNER"],
    "companyUid": "company-uuid-here"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "b2f0...128 hex characters..."
}
```

**Errors:**
- `400 Bad Request` — `User already exists`, or validation errors
- `429 Too Many Requests` — more than 3 registrations in an hour from one IP

### Sign In

```http
POST /auth/sign-in
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):** identical shape to register — `{ user, token, refreshToken }`.

**Errors:**
- `401 Unauthorized` — wrong email or wrong password
- `400 Bad Request` — missing fields
- `429 Too Many Requests` — more than 5 attempts in 15 minutes from one IP

### Get Current User

```http
GET /auth/me
Authorization: Bearer <access token>
```

Works with both local JWTs and Auth0 tokens.

**Response (200 OK):**
```json
{
  "uid": "user-uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["HR"],
  "companyUid": "company-uuid-here",
  "company": { "uid": "company-uuid-here", "name": "Acme Corp" },
  "position": "Senior Recruiter",
  "department": "Human Resources"
}
```

## Token lifecycle

### Access token

A signed JWT, valid for **15 minutes** (`ACCESS_TOKEN_EXPIRY = '15m'` in `auth.service.ts`).

**Payload claims:**
```json
{
  "sub": 123,
  "id": 123,
  "email": "john@example.com",
  "roles": ["HR"],
  "companyId": 1,
  "iat": 1701234567,
  "exp": 1701235467
}
```

`sub` and `id` both carry the internal user id; `iat` and `exp` are added by the signing library. There is no `userId` claim.

> **`JWT_EXPIRATION` is not read anywhere in the codebase.** `AuthModule` registers `JwtModule` with a module-level default of `signOptions: { expiresIn: '1d' }`, but `generateTokens()` passes `expiresIn: '15m'` on every token it signs, which overrides the module default. Setting `JWT_EXPIRATION` in your environment changes nothing. The only JWT environment variable actually consumed is `JWT_SECRET`, via `jwtConstants`.

### Refresh token

Not a JWT. `crypto.randomBytes(64).toString('hex')` — 64 random bytes rendered as 128 hex characters — stored as a row in the `RefreshToken` table with an `expiresAt` **7 days** out.

Refresh tokens are **rotated on every use**. `POST /auth/refresh` issues a new pair and then marks the presented token with `revokedAt` and `replacedBy` pointing at its successor, so a stolen token stops working as soon as the legitimate client refreshes.

### Refresh

```http
POST /auth/refresh
Content-Type: application/json

{ "refreshToken": "b2f0..." }
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "9c41...",
  "expiresIn": 900
}
```

`expiresIn` is always `900` seconds.

**Errors — all `401 Unauthorized`, with distinct messages:**

| Message | Cause |
|---------|-------|
| `Invalid refresh token` | No such token row |
| `Refresh token has been revoked` | `revokedAt` is set — already used, or logged out |
| `Refresh token has expired` | Past `expiresAt` |
| `User account has been deactivated` | The owning user has `isActive: false` |

### Logout

```http
POST /auth/logout
Content-Type: application/json

{ "refreshToken": "b2f0..." }
```

Revokes that one refresh token and returns `{ "message": "Logged out successfully" }`. An unknown token succeeds silently.

```http
POST /auth/logout-all
Authorization: Bearer <access token>
```

Revokes **every** refresh token for the current user and returns `{ "message": "All sessions terminated successfully" }`. Use this after a password change or a suspected compromise.

> Clearing `localStorage` is not a logout. The access token does expire on its own after 15 minutes, but the refresh token stays valid server-side for 7 days and can still be exchanged for new access tokens. Always call `POST /auth/logout` (or `logout-all`) before discarding client state.

## Account lifecycle endpoints

### Onboarding

```http
POST /auth/complete-onboarding
Authorization: Bearer <access token>
```

Marks onboarding complete. Returns `{ "message": "Onboarding completed successfully", "onboardingCompleted": true }`.

### Password reset (forgotten password)

```http
POST /auth/forgot-password
Content-Type: application/json

{ "email": "john@example.com" }
```

Always returns a success message whether or not the address exists, to prevent email enumeration.

```http
POST /auth/reset-password
Content-Type: application/json

{ "token": "a1b2c3d4e5f6...", "newPassword": "NewPassword123" }
```

`token` comes from the reset email; `newPassword` must be at least 8 characters. An invalid or expired token returns `400`.

### Email verification

```http
GET /auth/verify-email?token=a1b2c3d4e5f6...
```

Returns `{ "message": "Email verified successfully" }`, or `400` for an invalid or expired token.

```http
POST /auth/resend-verification
Authorization: Bearer <access token>
```

Returns `400` if the email is already verified. Limited to 3 attempts per 5 minutes.

### Change email (two-step, 6-digit code)

```http
POST /auth/change-email/request
Authorization: Bearer <access token>
Content-Type: application/json

{ "newEmail": "new@example.com" }
```

Sends a 6-digit code to the **new** address. Returns `400` if that address is already in use.

```http
POST /auth/change-email/confirm
Authorization: Bearer <access token>
Content-Type: application/json

{ "code": "123456" }
```

### Change password (two-step, 6-digit code)

```http
POST /auth/change-password/request
Authorization: Bearer <access token>
```

No body. Sends a 6-digit code to the user's **current** address. Returns `400` if the account has no email.

```http
POST /auth/change-password/confirm
Authorization: Bearer <access token>
Content-Type: application/json

{ "code": "123456", "newPassword": "NewPassword123" }
```

`newPassword` must be at least 8 characters.

### Add an email to a social-only account

```http
POST /auth/add-email
Authorization: Bearer <access token>
Content-Type: application/json

{ "email": "john@example.com" }
```

For accounts created through social login that have no email on file. Returns `400` if the address is already in use.

## Social login (Auth0)

Social login is **optional and disabled by default**. `Auth0Strategy` reads `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` at construction; if either is missing it logs `Auth0 not configured - social login disabled` and every social route rejects with `401 Auth0 not configured`.

When configured, the strategy verifies the Auth0 JWT against the tenant's JWKS:

| Setting | Value |
|---------|-------|
| Token source | `Authorization: Bearer` header |
| JWKS URI | `https://${AUTH0_DOMAIN}/.well-known/jwks.json` |
| Expected audience | `AUTH0_CLIENT_ID` (the ID token audience) |
| Expected issuer | `https://${AUTH0_DOMAIN}/` |
| Algorithm | `RS256` |
| Expiry | Enforced |

The validated payload is mapped to `{ auth0Id, email, name, provider, emailVerified }`. `provider` is derived from the `sub` prefix: `google-oauth2` → `google`, plus `github`, `auth0`, `twitter`, `linkedin` and `facebook`; anything else passes through unchanged.

### Sign in with a social account

```http
POST /auth/social/callback
Authorization: Bearer <Auth0 token>
```

Creates or links the local account and returns the usual `{ user, token, refreshToken }`. Every subsequent request uses the **local** access token, not the Auth0 one.

### Link a social account to an existing login

```http
POST /auth/link-social
Authorization: Bearer <Auth0 token>
X-Local-Token: <local access token>
```

Dual authentication: the Auth0 token identifies the social account, the `X-Local-Token` header identifies the logged-in Borderless user. A missing `X-Local-Token` returns `401 Local authentication token required in X-Local-Token header`. Returns `400` if that social account is already linked elsewhere, or if the user already has a different social account.

### Unlink and inspect

```http
DELETE /auth/unlink-social
Authorization: Bearer <access token>
```

Returns `403` if the user has no local password, since unlinking would leave the account with no way to sign in.

```http
GET /auth/linked-accounts
Authorization: Bearer <access token>
```

**Response (200 OK):**
```json
{
  "linkedAccounts": [
    { "provider": "google-oauth2", "isLinked": true, "email": "john@example.com" }
  ],
  "hasLocalPassword": true
}
```

## Authorization

### Using tokens

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:4000/api/candidate
```

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

`AuthGuard` also accepts the token as a `?token=` query parameter, but only as a fallback for the SSE stream, which cannot set headers.

### The role ladder

The Prisma `RolesType` enum has **eight** values. `ROLE_LEVELS` in `roles.guard.ts` is the canonical ranking — **a lower number means more privilege**.

| Role | Level | Typical holder |
|------|-------|----------------|
| `SUPER_ADMIN` | 1 | Platform operator |
| `ADMIN` | 2 | Platform staff |
| `COMPANY_ADMIN` | 3 | Company-level administrator |
| `COMPANY_OWNER` | 4 | The account that created the company |
| `HR_MANAGER` | 5 | Hiring manager |
| `HR` | 6 | Recruiter with write access |
| `RECRUITER` | 7 | Read-only recruiting staff |
| `USER` | 8 | Baseline authenticated account |

### How `@Auth([...])` is evaluated

`RolesGuard` does **not** perform a membership test. It compares levels:

```text
threshold = MAX(level of each role listed in @Auth)
allow     = MIN(level of each of the caller's roles) <= threshold
```

So `@Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])` means "HR **and everything above HR**" — the `ADMIN` and `SUPER_ADMIN` entries are documentation, not the gate. The gate is always the *lowest-privileged* role named. `@Auth([RolesType.USER])` therefore admits every authenticated role.

This is why "higher roles include lower role permissions" holds: it is a property of the ladder, not of the enum, which encodes no ordering of its own. A role the guard does not recognise is treated as level `Infinity` and denied.

To widen an endpoint to a *lower* role, add that role to its `@Auth` list — adding `RECRUITER` to `['HR', 'ADMIN', 'SUPER_ADMIN']` widens access by exactly one rung.

Two failure modes fail closed rather than open: a request with no roles, and a guarded handler whose `@Auth` list is empty. Both return `403 Access Denied: Insufficient Permissions`, and the denial is logged with the user UID (no PII) so a role offered in the UI but rejected by the API shows up in the logs.

### RECRUITER capability matrix

`RECRUITER` (level 7) sits between `HR` and `USER` and is read-only as enforced today:

| Area | RECRUITER |
|------|-----------|
| Read job positions, hiring processes | Yes |
| Read candidates (list, detail, notes, journey, activities, stage evaluation notes) | Yes |
| Read applications (list, grouped, detail) | Yes |
| Create, update or delete anything | No — writes remain `HR` (level 6) and above |
| Analytics, exports, AI, email templates, calendar, interviews, scorecards, team and role management, admin panel | No |

### Company-scoped roles

Separately from the global ladder, a company can delegate roles to its own members through `/api/companies/:companyUid/roles`.

| Method | Path | Required role |
|--------|------|---------------|
| `GET` | `/api/companies/:companyUid/roles` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/companies/:companyUid/roles/delegatable` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/companies/:companyUid/roles` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `ADMIN`, `HR_MANAGER` |
| `PATCH` | `/api/companies/:companyUid/roles/:userUid` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/companies/:companyUid/roles/:userUid` | `COMPANY_OWNER`, `COMPANY_ADMIN`, `ADMIN` |

`GET .../roles/delegatable` returns the subset of roles the caller is allowed to hand out. Under the ladder the effective floor for the first four routes is `HR_MANAGER`, and for `DELETE` it is `COMPANY_OWNER`.

Team invitations live in a neighbouring controller: `POST`, `GET` and `DELETE` on `/api/companies/:companyUid/invitations`, plus `POST /api/invitations/accept/:token` which any authenticated user may call for their own invitation.

## Public endpoints

Authentication is **opt-in**: a handler is protected only when it carries `@Auth([...])`. A controller or handler with no such decorator is reachable with no credentials. [Public Endpoints](./public-endpoints.md) is the full audit; the entry points relevant here are:

- `POST /auth/register`, `POST /auth/sign-in`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/verify-email`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /job-position/public/all`, `GET /job-position/public/:uid`, `GET /company/public/with-jobs`
- `POST /applications`, `POST /files/upload-resume-public`
- `GET /health`, `GET /health/liveness`, `GET /health/readiness`
- `GET /quota/plan-limits`

## Error Responses

### 401 Unauthorized

**No token provided:**
```json
{
  "statusCode": 401,
  "message": "No token provided",
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

```json
{
  "statusCode": 403,
  "message": "Access Denied: Insufficient Permissions",
  "error": "Forbidden"
}
```

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

## Rate limiting

A global `CustomThrottlerGuard` applies `THROTTLE_LIMIT` requests (default 100) per `THROTTLE_TTL` milliseconds (default 60000) per IP. Auth routes override this with the per-route limits listed in the endpoint index above, and twelve of them opt out entirely with `@SkipThrottle()` so that token verification, logout and the account-settings flows never lock a user out of their own session.

Setting `THROTTLE_DISABLED=true`, or running with `NODE_ENV=test`, disables the global limiter.

## Security notes

### Token storage

The frontend keeps the access token in `localStorage` and sends it in the `Authorization` header. The 15-minute access-token lifetime plus rotating refresh tokens is what bounds the damage from a leaked token — not the storage mechanism.

### CORS

`main.ts` enables CORS with credentials against a single origin taken from `FRONTEND_URL`:

```typescript
app.enableCors({
  origin: FRONTEND_URL,
  credentials: true,
});
```

There is no default — if `FRONTEND_URL` is unset, the browser will be refused.

### Password rules

`CreateUserDto` and `LoginDto` validate `password` at 3–20 characters. Password *reset* and *change* flows validate `newPassword` at a minimum of 8. Passwords are hashed with bcrypt.

## Swagger API Documentation

There are two separate OpenAPI documents, mounted by two `SwaggerModule.setup()` calls in `main.ts`:

| URL | Title | Covers | Authorize with |
|-----|-------|--------|----------------|
| `/api/internal-docs` | BorderLess Internal API | Every controller in the application | `Bearer <access token>` |
| `/api/docs` | Borderless ATS Public API | `PublicApiModule` only (`/api/v1/*`) | `X-API-Key: blss_live_...` |

Locally that is `http://localhost:4000/api/internal-docs` and `http://localhost:4000/api/docs`. **`/api` alone is the global route prefix, not a docs page** — requesting it returns the `AppController` connection-test string.

To authorise in the internal docs:

1. Click **Authorize**.
2. Paste your access token.
3. Click **Authorize** — subsequent requests include it. `persistAuthorization` is on, so it survives a page reload.

## Related

- [API Reference index](./index.md) — every route namespace in the application
- [Public Endpoints](./public-endpoints.md) — everything reachable without a token
- [Public API](./public-api.md) — API-key authentication for third-party integrations
- [Candidates API](./candidates.md), [Job Positions API](./job-positions.md), [Hiring Process API](./hiring-process.md)
