# Interviews

**Route:** `/hr/interviews`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Interviews page shows all scheduled interviews across your company. You can also access interview scheduling from within a hiring process stage.

## Interview Statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Created but not confirmed |
| `SCHEDULED` | Confirmed, waiting to happen |
| `COMPLETED` | Interview has taken place |
| `CANCELLED` | Interview was cancelled |

## Scheduling an Interview

1. Open a hiring process
2. Go to the current stage
3. Click **"Schedule Interview"**
4. Fill in: date, time, duration, meeting link (optional), notes
5. Assign interviewers from your team
6. Save — email notification sent to candidate

## Google Calendar Integration

If you've connected Google Calendar (`/settings/calendar`):
- Interviews automatically create a Google Calendar event
- A Google Meet link is auto-generated and added to the event
- Updates/cancellations sync back to Google Calendar

## Email Notifications

- **On schedule:** Candidate receives confirmation email with details
- **On cancellation:** Candidate receives cancellation notification
- **Reminders:** Automated reminders sent 24 hours before (via cron job)

## Interview Notes

From the Interviews page, you can see all stage notes for a candidate by clicking the **notes icon** next to an interview. This shows all evaluation notes across all stages.

## Reschedule / Cancel

Use the action buttons on each interview card to reschedule or cancel. The candidate is notified automatically.
