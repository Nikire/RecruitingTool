# Google Calendar Module

Google Calendar integration for the BorderLess with OAuth2 authentication, event management, and Google Meet link generation.

## Quick Start

1. Configure Google Cloud Console OAuth credentials (see `GOOGLE_CALENDAR_SETUP.md`)
2. Add environment variables to `.env`
3. Run migration: `npx prisma migrate dev --name add_google_calendar_integration`
4. Restart backend

## API Endpoints

All endpoints require JWT authentication and HR/ADMIN/SUPER_ADMIN roles.

### OAuth Flow

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/google-calendar/auth-url` | GET | Get OAuth authorization URL |
| `/google-calendar/callback` | GET | OAuth callback (auto-redirect) |
| `/google-calendar/status` | GET | Check connection status |
| `/google-calendar/disconnect` | DELETE | Disconnect calendar |

### Event Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/google-calendar/events` | POST | Create event with Meet link |
| `/google-calendar/events/:eventId` | PUT | Update event |
| `/google-calendar/events/:eventId` | DELETE | Delete event |
| `/google-calendar/availability` | GET | Get free/busy times |

## Usage Example

```typescript
// 1. Get authorization URL
const { authUrl } = await fetch('/google-calendar/auth-url', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

// User visits authUrl and authorizes

// 2. Create calendar event with Google Meet
const event = await fetch('/google-calendar/events', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    summary: 'Interview with John Doe',
    description: 'Technical interview',
    startTime: '2025-11-26T14:00:00Z',
    endTime: '2025-11-26T15:00:00Z',
    attendees: [
      { email: 'candidate@example.com', displayName: 'John Doe' }
    ],
    createMeetLink: true,
  }),
}).then(r => r.json());

console.log(event.meetLink); // https://meet.google.com/...
```

## Service Methods

```typescript
import { GoogleCalendarService } from './google-calendar.service';

// Check if user has connected calendar
const connected = await googleCalendarService.isCalendarConnected(userId);

// Create event
const event = await googleCalendarService.createCalendarEvent(userId, {
  summary: 'Interview',
  startTime: '2025-11-26T14:00:00Z',
  endTime: '2025-11-26T15:00:00Z',
  createMeetLink: true,
});

// Get availability
const availability = await googleCalendarService.getAvailability(userId, {
  startDate: '2025-11-26T00:00:00Z',
  endDate: '2025-11-27T00:00:00Z',
});
```

## DTOs

### CreateCalendarEventDto
- `summary` (required): Event title
- `description` (optional): Event description
- `startTime` (required): ISO 8601 datetime
- `endTime` (required): ISO 8601 datetime
- `timeZone` (optional): IANA timezone (default: UTC)
- `location` (optional): Event location
- `attendees` (optional): Array of attendees
- `createMeetLink` (optional): Generate Meet link (default: true)
- `sendUpdates` (optional): Send notifications (default: true)

### UpdateCalendarEventDto
All fields optional, same structure as CreateCalendarEventDto

### GetAvailabilityDto
- `startDate` (required): ISO 8601 datetime
- `endDate` (required): ISO 8601 datetime
- `timeZone` (optional): IANA timezone (default: UTC)

## Security

- Refresh tokens stored per-user in database
- Access tokens refreshed automatically
- OAuth scopes limited to calendar only
- Role-based access control enforced
- User-isolated calendar connections

## Error Handling

Common errors:
- `400 Bad Request`: User hasn't connected calendar
- `500 Internal Server Error`: Google API error or token refresh failed

Solution: User needs to authorize via `/google-calendar/auth-url`

## See Also

- `GOOGLE_CALENDAR_SETUP.md` - Complete setup guide
- Google Calendar API: https://developers.google.com/calendar/api
