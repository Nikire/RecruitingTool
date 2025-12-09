# Calendar Module - Google OAuth 2.0 Integration

This module implements Google OAuth 2.0 flow for Google Calendar access to enable interview scheduling with calendar integration.

## Features

- **OAuth 2.0 Flow**: Secure Google Calendar connection
- **Token Management**: Automatic access token refresh when expired
- **Database Storage**: Separate `CalendarConnection` model for better separation of concerns
- **Multi-Provider Support**: Designed to support future providers (OUTLOOK, etc.)
- **User Isolation**: Each user has their own calendar connection

## Database Model

The `CalendarConnection` model stores OAuth credentials securely:

```prisma
model CalendarConnection {
  id           Int              @id @default(autoincrement())
  uid          String           @unique @default(uuid()) @db.Uuid
  userId       Int
  user         User             @relation("UserCalendarConnections", fields: [userId], references: [id], onDelete: Cascade)
  provider     CalendarProvider // GOOGLE, OUTLOOK
  accessToken  String?          @db.Text
  refreshToken String           @db.Text
  tokenExpiry  DateTime?
  email        String
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([userId, provider])
}
```

## API Endpoints

### 1. Get Authorization URL

Initiates the OAuth flow by generating a Google authorization URL.

**Endpoint:** `GET /api/calendar/auth/google`

**Authentication:** Required (JWT Bearer token)

**Roles:** HR, ADMIN, SUPER_ADMIN

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "message": "Please visit this URL to authorize Google Calendar access"
}
```

**Example:**
```bash
curl -X GET http://localhost:4000/calendar/auth/google \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. OAuth Callback

Handles the OAuth callback from Google after user authorization.

**Endpoint:** `GET /api/calendar/auth/google/callback?code=CODE&state=USER_ID`

**Authentication:** Not required (handled by Google)

**Query Parameters:**
- `code` (required): Authorization code from Google
- `state` (required): User ID passed in the authorization URL

**Redirects to:** `http://localhost:5173/settings/integrations?calendar=connected`

**Note:** This endpoint is called automatically by Google after user authorization.

### 3. Get Connection Status

Check if the current user has connected their Google Calendar.

**Endpoint:** `GET /api/calendar/connection`

**Authentication:** Required (JWT Bearer token)

**Roles:** HR, ADMIN, SUPER_ADMIN

**Response (Connected):**
```json
{
  "connected": true,
  "connection": {
    "uid": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "GOOGLE",
    "email": "user@example.com",
    "tokenExpiry": "2025-12-03T12:00:00Z",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-03T11:00:00Z"
  }
}
```

**Response (Not Connected):**
```json
{
  "connected": false
}
```

**Example:**
```bash
curl -X GET http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Disconnect Calendar

Removes the calendar connection and revokes the OAuth token.

**Endpoint:** `DELETE /api/calendar/connection`

**Authentication:** Required (JWT Bearer token)

**Roles:** HR, ADMIN, SUPER_ADMIN

**Response:**
```json
{
  "message": "Google Calendar disconnected successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

Add these to your `.env` file:

```bash
# Google Calendar Integration (OAuth 2.0)
# Get credentials from: https://console.cloud.google.com/apis/credentials
# Required scopes: calendar.events, calendar.readonly
GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'your-google-client-secret'
GOOGLE_REDIRECT_URI = 'http://localhost:4000/calendar/auth/google/callback' # Must match Google Console
```

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "OAuth client ID"
4. Select "Web application"
5. Configure:
   - **Name**: Recruiting Tool Calendar
   - **Authorized redirect URIs**: `http://localhost:4000/calendar/auth/google/callback`
6. Copy the Client ID and Client Secret

### 2. Enable Google Calendar API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click "Enable"

## OAuth Flow Sequence

```
1. Frontend calls GET /calendar/auth/google
   ↓
2. Backend generates OAuth URL and returns it
   ↓
3. Frontend redirects user to OAuth URL
   ↓
4. User authorizes on Google's consent screen
   ↓
5. Google redirects to /calendar/auth/google/callback?code=XXX&state=USER_ID
   ↓
6. Backend exchanges code for tokens (access token + refresh token)
   ↓
7. Backend stores tokens in CalendarConnection table
   ↓
8. Backend redirects to frontend success page
```

## Token Refresh Strategy

Access tokens expire after 1 hour. The service automatically refreshes them:

1. Check if current access token is expired (or will expire in 5 minutes)
2. If expired, use refresh token to get new access token
3. Update database with new tokens
4. Return new access token

This happens transparently when accessing Google Calendar API.

## Security Considerations

1. **Refresh Tokens**: Stored encrypted in database, never exposed in API responses
2. **Scopes**: Limited to `calendar.events` and `calendar.readonly` only
3. **Authorization**: Only HR, ADMIN, and SUPER_ADMIN roles can connect calendars
4. **User Isolation**: Each user has their own calendar connection (no shared tokens)
5. **Token Revocation**: Properly revokes tokens with Google when disconnecting

## Testing

### Manual Testing with cURL

**1. Get authorization URL:**
```bash
# Login first to get JWT token
TOKEN=$(curl -X POST http://localhost:4000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

# Get auth URL
curl -X GET http://localhost:4000/calendar/auth/google \
  -H "Authorization: Bearer $TOKEN"
```

**2. Visit the returned URL in your browser**

**3. Authorize access**

**4. After redirect, check connection status:**
```bash
curl -X GET http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer $TOKEN"
```

**5. Disconnect (optional):**
```bash
curl -X DELETE http://localhost:4000/calendar/connection \
  -H "Authorization: Bearer $TOKEN"
```

## Integration with Interview Scheduling

This module provides the foundation for calendar integration. The actual calendar event creation (creating Google Meet links, scheduling interviews) will be implemented in issue #126.

### Recommended Integration Flow (Issue #126)

```typescript
// In interview.service.ts
async scheduleInterview(dto: ScheduleInterviewDto, userId: number) {
  // 1. Create interview in database
  const interview = await this.createInterview(dto);

  // 2. Check if user has connected Google Calendar
  const connected = await this.calendarService.isCalendarConnected(userId);

  if (connected) {
    try {
      // 3. Get access token
      const accessToken = await this.calendarService.getAccessToken(userId);

      // 4. Create Google Calendar event with Meet link
      const calendarEvent = await this.googleCalendarApi.createEvent({
        summary: `Interview: ${candidateName}`,
        startTime: interview.scheduledDate,
        endTime: addMinutes(interview.scheduledDate, interview.duration),
        attendees: [candidateEmail, ...interviewers.map(i => i.email)],
        createMeetLink: true,
      });

      // 5. Update interview with meeting link
      await this.updateInterviewMeetingLink(interview.id, calendarEvent.meetLink);
    } catch (error) {
      this.logger.error(`Failed to create calendar event: ${error.message}`);
      // Continue without calendar event (non-blocking)
    }
  }

  return interview;
}
```

## Migration

The migration was created manually and can be applied when Docker is running:

```bash
# Start Docker
docker-compose up -d

# Apply migration
cd recruiting-tool-backend
npx prisma migrate deploy

# Or if developing
npx prisma migrate dev
```

## Files Created

- `src/modules/calendar/calendar.module.ts` - NestJS module
- `src/modules/calendar/calendar.controller.ts` - REST endpoints
- `src/modules/calendar/calendar.service.ts` - OAuth logic and token management
- `src/modules/calendar/dto/calendar-connection.dto.ts` - DTOs
- `prisma/migrations/20251203120000_add_calendar_connection_model/migration.sql` - Database migration
- `src/modules/calendar/README.md` - This documentation

## Next Steps (Issue #126)

- Implement calendar event creation with Google Meet links
- Integrate with interview scheduling workflow
- Add calendar availability checking
- Implement event updates and cancellations
- Add webhook support for calendar event changes
