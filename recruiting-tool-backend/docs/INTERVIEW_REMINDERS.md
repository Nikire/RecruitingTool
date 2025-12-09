# Interview Reminder Notifications

Automated reminder notification system for scheduled interviews.

## Overview

The Interview Reminder service automatically sends notifications to interviewers and schedulers before upcoming interviews. This helps ensure all participants are prepared and reduces the risk of missed interviews.

## Features

### 24-Hour Reminder
- Sent to interviews scheduled between 24-25 hours from now
- Runs every 15 minutes
- Notification type: `INTERVIEW_REMINDER_24H`
- Message: "Reminder: Interview with [candidate] for [position] tomorrow at [time]"

### 1-Hour Reminder
- Sent to interviews scheduled between 1-2 hours from now
- Runs every 15 minutes
- Notification type: `INTERVIEW_REMINDER_1H`
- Message: "Starting soon: Interview with [candidate] for [position] begins in 1 hour"

## Recipients

### Who Receives Reminders?

1. **All Interviewers** - HR users assigned to the interview
2. **Scheduler** - The person who created/scheduled the interview

### Who Does NOT Receive Reminders?

- **Candidates** - Candidates do not receive in-app notifications (they receive email reminders separately via EmailService)
- **Other HR Users** - Only those directly involved in the interview

## Technical Implementation

### Service Location
`recruiting-tool-backend/src/modules/interview/interview-reminder.service.ts`

### Cron Schedule
```typescript
@Cron('0 */15 * * * *', { name: 'interview-reminders', timeZone: 'UTC' })
```
- Runs every 15 minutes
- Timezone: UTC
- Covers 1-hour windows for each reminder type (24-25h and 1-2h)

### Duplicate Prevention

The service uses in-memory sets to track sent reminders:
- `sentReminders24h` - Tracks 24-hour reminders sent
- `sentReminders1h` - Tracks 1-hour reminders sent

**Cache Cleanup:**
- Runs daily at midnight (UTC)
- Clears both tracking sets to prevent memory leaks

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
  name: 'cleanup-reminder-cache',
  timeZone: 'UTC'
})
```

### Notification Metadata

Each reminder notification includes:
```typescript
{
  interviewUid: string,
  candidateUid: string,
  candidateName: string,
  jobPositionUid: string,
  jobPositionTitle: string,
  scheduledDate: string (ISO),
  scheduledTime: string,
  location?: string,
  meetingLink?: string,
  formattedDate?: string (for 24h reminders)
}
```

## Database Queries

### 24-Hour Reminder Query
```typescript
{
  status: InterviewStatus.SCHEDULED,
  scheduledDate: {
    gte: in24Hours,    // now + 24 hours
    lt: in25Hours,     // now + 25 hours
  },
  deletedAt: null,
}
```

### 1-Hour Reminder Query
```typescript
{
  status: InterviewStatus.SCHEDULED,
  scheduledDate: {
    gte: in1Hour,      // now + 1 hour
    lt: in2Hours,      // now + 2 hours
  },
  deletedAt: null,
}
```

## Notification Types (Prisma Schema)

These notification types are already defined in the Prisma schema:
- `INTERVIEW_REMINDER_24H` - 24-hour advance reminder
- `INTERVIEW_REMINDER_1H` - 1-hour advance reminder

## Error Handling

- Service-level try-catch prevents individual failures from stopping the entire check
- Per-interview try-catch ensures one failing notification doesn't block others
- Errors are logged with `Logger` for debugging

Example error scenarios handled:
- Missing candidate or job position
- Notification service failure for specific user
- Database connection issues

## Logging

The service logs:
- Number of interviews found for each reminder type
- Successful notifications sent (with recipient and interview UID)
- Errors encountered during processing
- Cache cleanup operations

Example log output:
```
[InterviewReminderService] Found 3 interviews for 24-hour reminders
[InterviewReminderService] 24h reminder sent to interviewer John Doe for interview abc-123
[InterviewReminderService] 1h reminder sent to scheduler Jane Smith for interview xyz-789
[InterviewReminderService] Cleaning up reminder cache...
```

## Scalability Considerations

### Current Implementation (In-Memory Cache)
- Suitable for single-instance deployments
- Data lost on service restart (reminders may be sent twice if restart occurs)
- No coordination between multiple instances

### Production Recommendations

For production environments with multiple backend instances:

1. **Use Redis for Distributed Cache**
   ```typescript
   // Replace in-memory sets with Redis
   await redis.sadd('reminders:24h', interview.id);
   const alreadySent = await redis.sismember('reminders:24h', interview.id);
   ```

2. **Use Database Field to Track Sent Reminders**
   ```prisma
   model Interview {
     // ... other fields
     reminder24HSent Boolean @default(false)
     reminder1HSent  Boolean @default(false)
   }
   ```

3. **Add Distributed Locks**
   - Ensure only one instance processes reminders at a time
   - Use Redis distributed locks (Redlock algorithm)

## Testing

### Manual Testing

1. **Create a test interview** scheduled 24 hours from now
2. **Wait for the next 15-minute interval** (cron runs at :00, :15, :30, :45)
3. **Check notifications** for the interviewer and scheduler
4. **Verify metadata** includes all expected fields

### Automated Testing Recommendations

```typescript
// Mock the DatabaseService to return test interviews
// Mock the NotificationsService to verify calls
// Test both 24h and 1h reminder windows
// Test duplicate prevention
// Test error handling
```

## Module Registration

### App Module
```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Required for @Cron decorators
    // ... other modules
  ],
})
```

### Interview Module
```typescript
import { InterviewReminderService } from './interview-reminder.service';

@Module({
  providers: [
    InterviewService,
    InterviewCalendarService,
    InterviewReminderService, // Registered as provider
  ],
})
```

## Monitoring

### Health Checks

Monitor:
- Number of reminders sent per day
- Failed notification attempts
- Service uptime
- Cache size growth (memory leak detection)

### Metrics to Track

- `interview_reminders_24h_sent_total` - Total 24h reminders sent
- `interview_reminders_1h_sent_total` - Total 1h reminders sent
- `interview_reminders_failed_total` - Failed notification attempts
- `interview_reminders_cache_size` - Current cache size

## Future Enhancements

1. **Configurable Reminder Times**
   - Allow admins to configure when reminders are sent (e.g., 48h, 12h, 30min)

2. **Email Integration**
   - Send email reminders in addition to in-app notifications
   - Combine with existing email service

3. **SMS Reminders**
   - Send SMS for urgent/last-minute reminders
   - Integrate with Twilio or similar service

4. **User Preferences**
   - Allow users to opt-in/opt-out of reminders
   - Configure preferred notification channels

5. **Calendar Integration**
   - Update Google Calendar events with reminder notifications
   - Add calendar reminders (15min, 30min)

## Related Documentation

- **Notifications System**: `recruiting-tool-backend/src/modules/notifications/`
- **Interview Service**: `recruiting-tool-backend/src/modules/interview/interview.service.ts`
- **Email Service**: `recruiting-tool-backend/src/modules/email/email.service.ts`
- **Scheduler Documentation**: https://docs.nestjs.com/techniques/task-scheduling
