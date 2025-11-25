# Google Calendar Integration Setup Guide

This guide explains how to set up Google Calendar integration for interview scheduling with Google Meet links.

## Prerequisites

- Google Cloud Console account
- OAuth 2.0 Client ID and Client Secret
- Running PostgreSQL database

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Configure OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure the OAuth client:
   - **Name**: Recruiting Tool Calendar Integration
   - **Authorized JavaScript origins**: `http://localhost:5173` (frontend URL)
   - **Authorized redirect URIs**: `http://localhost:4000/google-calendar/callback`
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/google-calendar/callback
```

## Step 4: Run Database Migration

Run the following command to add the `googleRefreshToken` field to the User model:

```bash
cd recruiting-tool-backend
npx prisma migrate dev --name add_google_calendar_integration
```

This will:
- Add `googleRefreshToken String?` field to User model
- Create and apply the migration to your database

## Step 5: Rebuild Docker Containers

After adding the migration, rebuild the backend Docker container:

```bash
docker-compose up -d --build backend
```

## API Endpoints

### OAuth Flow

1. **Get Authorization URL**
   ```
   GET /google-calendar/auth-url
   Authorization: Bearer <token>
   ```
   Returns authorization URL for user to connect Google Calendar.

2. **OAuth Callback** (handled automatically)
   ```
   GET /google-calendar/callback?code=<code>&state=<userId>
   ```
   Stores refresh token and redirects to frontend.

3. **Check Connection Status**
   ```
   GET /google-calendar/status
   Authorization: Bearer <token>
   ```
   Returns whether Google Calendar is connected.

4. **Disconnect Calendar**
   ```
   DELETE /google-calendar/disconnect
   Authorization: Bearer <token>
   ```
   Removes stored refresh token.

### Calendar Event Management

1. **Create Event with Google Meet**
   ```
   POST /google-calendar/events
   Authorization: Bearer <token>
   Content-Type: application/json

   {
     "summary": "Interview with John Doe",
     "description": "Technical interview for Senior Developer position",
     "startTime": "2025-11-26T14:00:00Z",
     "endTime": "2025-11-26T15:00:00Z",
     "timeZone": "America/Los_Angeles",
     "attendees": [
       {
         "email": "candidate@example.com",
         "displayName": "John Doe"
       },
       {
         "email": "interviewer@company.com",
         "displayName": "Jane Smith"
       }
     ],
     "createMeetLink": true,
     "sendUpdates": true
   }
   ```

2. **Update Event**
   ```
   PUT /google-calendar/events/:eventId
   Authorization: Bearer <token>
   Content-Type: application/json

   {
     "summary": "Updated Interview Title",
     "startTime": "2025-11-26T15:00:00Z",
     "endTime": "2025-11-26T16:00:00Z"
   }
   ```

3. **Delete Event**
   ```
   DELETE /google-calendar/events/:eventId
   Authorization: Bearer <token>
   ```

4. **Get Availability**
   ```
   GET /google-calendar/availability?startDate=2025-11-26T00:00:00Z&endDate=2025-11-27T00:00:00Z&timeZone=UTC
   Authorization: Bearer <token>
   ```

## Integration with Interview Scheduling

To integrate with the existing interview scheduling system:

1. When scheduling an interview, check if the HR user has connected Google Calendar
2. If connected, optionally create a calendar event with Google Meet link
3. Store the Google Calendar event ID in the interview record for future updates
4. When updating/deleting interviews, sync with Google Calendar

### Example: Interview Service Integration

```typescript
// In interview.service.ts
async scheduleInterview(dto: ScheduleInterviewDto, userId: number) {
  // Create interview in database
  const interview = await this.prisma.interview.create({
    data: {
      stageId: dto.stageId,
      scheduledDate: dto.scheduledDate,
      duration: dto.duration,
      scheduledById: userId,
      // ... other fields
    },
  });

  // Check if user has connected Google Calendar
  const calendarConnected = await this.googleCalendarService.isCalendarConnected(userId);

  if (calendarConnected) {
    try {
      // Create calendar event with Google Meet
      const calendarEvent = await this.googleCalendarService.createCalendarEvent(userId, {
        summary: `Interview: ${candidateName}`,
        description: `Interview for ${jobPosition}`,
        startTime: interview.scheduledDate.toISOString(),
        endTime: new Date(
          interview.scheduledDate.getTime() + interview.duration * 60000
        ).toISOString(),
        attendees: [
          { email: candidateEmail },
          ...interviewers.map(i => ({ email: i.email })),
        ],
        createMeetLink: true,
      });

      // Update interview with Google Calendar event ID and Meet link
      await this.prisma.interview.update({
        where: { id: interview.id },
        data: {
          meetingLink: calendarEvent.meetLink,
          // Store calendar event ID in notes or add new field
          notes: `Calendar Event ID: ${calendarEvent.id}`,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create calendar event: ${error.message}`);
      // Continue without calendar event (non-blocking)
    }
  }

  return interview;
}
```

## Security Considerations

1. **Refresh Tokens**: Stored securely in database, never exposed in API responses
2. **Scopes**: Limited to calendar access only (no email, drive, or other services)
3. **Authorization**: Only HR, ADMIN, and SUPER_ADMIN roles can access calendar endpoints
4. **Token Refresh**: Automatically handled by the service when access token expires
5. **User Isolation**: Each user has their own calendar connection (refresh tokens are per-user)

## Testing

1. **Connect Calendar**:
   - Call GET `/google-calendar/auth-url`
   - Visit the returned URL in browser
   - Authorize access to Google Calendar
   - Should redirect to `http://localhost:5173/settings/integrations?calendar=connected`

2. **Create Test Event**:
   ```bash
   curl -X POST http://localhost:4000/google-calendar/events \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "summary": "Test Meeting",
       "startTime": "2025-11-26T14:00:00Z",
       "endTime": "2025-11-26T15:00:00Z",
       "createMeetLink": true
     }'
   ```

3. **Check Calendar**: Event should appear in Google Calendar with Meet link

## Troubleshooting

### "User has not connected Google Calendar"
- User needs to authorize via `/google-calendar/auth-url` endpoint first
- Check that refresh token was stored in database

### "Failed to authenticate with Google Calendar"
- Refresh token may have been revoked by user
- User needs to re-authorize

### "No refresh token received"
- User may have already authorized
- Add `prompt: 'consent'` to force consent screen (already configured)

### OAuth Redirect URI Mismatch
- Verify `GOOGLE_REDIRECT_URI` matches the one configured in Google Cloud Console
- Must be exact match including protocol, port, and path

## Production Deployment

For production:

1. Update environment variables:
   ```bash
   GOOGLE_REDIRECT_URI=https://api.yourcompany.com/google-calendar/callback
   FRONTEND_URL=https://app.yourcompany.com
   ```

2. Add production redirect URI to Google Cloud Console:
   - `https://api.yourcompany.com/google-calendar/callback`

3. Consider OAuth verification process for public apps:
   - Required if requesting sensitive scopes
   - Process can take 1-2 weeks
   - https://support.google.com/cloud/answer/9110914

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Meet Add-on](https://developers.google.com/calendar/api/guides/create-events#conferencing)
