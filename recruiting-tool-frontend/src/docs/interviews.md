# Interviews

**Route:** `/hr/interviews`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Interviews page shows every interview scheduled at your company. You can also reach interview scheduling from inside a hiring process stage.

## Interview Statuses

| Status | Meaning |
|--------|---------|
| `PENDING` | Created but not confirmed |
| `SCHEDULED` | Confirmed, waiting to happen |
| `COMPLETED` | The interview already took place |
| `CANCELLED` | The interview was cancelled |

## Scheduling an Interview

1. Open a hiring process
2. Go to the current stage
3. Click **"Schedule Interview"**
4. Fill in: date, time, duration, meeting link (optional), notes
5. Assign interviewers from your team
6. Save — an email notification is sent to the candidate

## Google Calendar Integration

If you have connected Google Calendar (`/settings/calendar`):
- Interviews automatically create an event in Google Calendar
- A Google Meet link is generated and added to the event automatically
- Updates and cancellations are synced to Google Calendar

## Email Notifications

- **On scheduling:** The candidate receives a confirmation email with the details
- **On cancellation:** The candidate receives a cancellation notice
- **Reminders:** Automatic reminders are sent 24 hours in advance (via cron job)

## Interview Notes

From the Interviews page you can see all of a candidate's stage notes by clicking the **notes icon** next to an interview. This shows every evaluation note from every stage.

## Reschedule / Cancel

Use the action buttons on each interview card to reschedule or cancel. The candidate is notified automatically.
