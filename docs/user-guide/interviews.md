# Interview Management

Complete guide to scheduling, conducting, and evaluating interviews.

## Overview

Interviews are scheduled at the stage level within a hiring process. Features include:
- Interview scheduling with date/time
- Meeting link integration (Zoom, Google Meet)
- Optional automatic Google Calendar events
- Email notifications to candidates
- A company-wide interview list at `/hr/interviews` and a calendar at `/hr/calendar`
- Free-text interview notes, and stage evaluation notes with a star rating

## Scheduling Interviews

### Create Interview

1. Navigate to hiring process detail page
2. Expand the stage where the interview should be scheduled
3. Click **Schedule Interview**
4. Fill in the form (every field is optional)
5. Click **Schedule**

**What the dialog shows you:**

| Element | Behavior |
|---------|----------|
| Header | *"For {candidate name}"* |
| Interview duration | A read-only chip, not an input. It takes the stage's estimated time if the stage has one, otherwise the default duration from your Calendar settings, otherwise 60 minutes. When it came from settings, a *(from calendar settings)* hint appears next to it |
| Interview Date | Date picker. Must not be in the past |
| Interview Time | Time picker, with the hint *"Times are shown in your local timezone ({your browser's timezone})"* |
| Working hours hint | Once you pick a date, a second hint shows your company's configured working hours for that weekday, e.g. *"Working hours for this day: 09:00 – 17:00"*. It only appears for days you have marked as working days |
| Google Calendar notice | Green when Google Calendar is connected — *"A Google Calendar event will be created automatically when you schedule this interview."* Blue when it is not — *"Connect Google Calendar in Calendar Settings to auto-generate Meet links"* |
| Meeting Link (optional) | Paste any video conferencing URL |
| Notes (optional) | Agenda or special instructions |

The duration is derived, not chosen. To change it, either set an estimated time on the stage template or change the default duration in **Settings → Calendar**.

The timezone shown is **your** browser's timezone, not the candidate's. Always state the timezone explicitly in the notes or the meeting invitation when scheduling across regions.

### Interview Status

Automatically determined based on date/time:
- **PENDING**: No date or time set (placeholder interview)
- **SCHEDULED**: Both date and time provided
- **COMPLETED**: Interview finished (manually marked)
- **CANCELLED**: Interview cancelled

### Email Notifications

When interview is scheduled (date and time provided):
- Candidate receives email notification automatically
- Email includes:
  - Interview date and time
  - Meeting link (if provided)
  - Job position title
  - Company name
  - HR contact information

**Prerequisites:**
- SendGrid must be configured (see [Configuration Guide](../getting-started/configuration.md))
- Candidate must have valid email address

## Managing Interviews

### View All Interviews

**From Stage:**
1. Navigate to hiring process
2. Click on stage
3. View all interviews scheduled for that stage

**From the Interviews page:**

The Interviews page (`/hr/interviews`, sidebar → **Scheduling** → **Interviews**) lists every interview across your whole company, not just one hiring process. It covers a rolling window of **three months back to three months forward**, sorted most recent first, and it has no filter controls.

Each interview is a card showing:

- Candidate name
- Job position, and a chip with the stage number and title
- Date, time and duration
- Organizer
- A status chip (Pending, Scheduled, Completed, Cancelled)
- **Join Meeting**, when a meeting link was saved
- A notes icon, which opens an inline editor for that interview's notes (up to 1,000 characters) with **Save** and **Cancel** — you never leave the page
- An evaluation-notes icon, which expands every stage note written for that candidate, each with its stage name and star rating

Arriving from a notification link of the form `/hr/interviews?highlight={uid}` scrolls to that interview and outlines its card.

**From the calendar:**

The Meetings page (`/hr/calendar`, sidebar → **Scheduling** → **Meetings**) shows the same interviews laid out on a calendar, which is the better view for spotting clashes and free slots.

### Update Interview

1. From interview detail or stage view
2. Click **Edit** or **Reschedule** button
3. Update any field:
   - Date/time
   - Duration
   - Meeting link
   - Notes
   - Status
4. Click **Save**

**Auto-status update:**
- If you add date and time, status automatically changes to SCHEDULED
- New email notification sent to candidate

### Cancel Interview

1. Find interview in stage view
2. Click **Cancel** button
3. Confirm cancellation
4. Interview status set to CANCELLED
5. Cancellation email sent to candidate

### Complete Interview

1. After interview is finished
2. Mark interview as **COMPLETED**
3. Optionally add notes about outcome
4. Write a stage note with a star rating so the rest of the team can see the assessment

## Interview Scorecards — Not Available in the Product

Structured scorecards are **not reachable in Borderless today**. There is no page, route or button anywhere in the application that creates a scorecard template, submits a scorecard, or shows a consensus summary.

What exists is backend-only:

| Piece | State |
|-------|-------|
| `Scorecard*` database tables | Present |
| Nine endpoints under `/api/scorecard` (templates CRUD, submit, by-interview, by-uid, consensus summary) | Live and authenticated |
| React scorecard components (`ScorecardTemplateList`, `ScorecardForm`, `ScorecardViewer`) | Written, but no route renders them |
| The frontend scorecard service | Deliberately non-functional — every call rejects, so nothing can render placeholder evaluation data by accident |

That last point is intentional rather than a bug. The service used to return hardcoded sample scorecards; those fixtures were removed precisely so that no one could ever be shown invented evaluation data as if it were their own hiring records.

**What to use instead today:** record interview feedback as **stage notes**. A stage note carries free text and a **star rating**, is attributed to its author, and is visible to the whole team — from the stage accordion on the hiring process, from the note icon on each row of the Hiring Processes grouped list, and from the evaluation-notes panel on each card of the Interviews page. See [Hiring Process](./hiring-process.md#stage-notes).

## Interview Types

### Phone Screening

- **Duration**: 20-30 minutes
- **Purpose**: Initial qualification check
- **Assess**: Basic qualification criteria
- **Interviewer**: HR or Recruiter

### Technical Interview

- **Duration**: 60-90 minutes
- **Purpose**: Assess technical skills
- **Assess**: Technical proficiency
- **Interviewer**: Senior engineers or tech lead

### Team Interview

- **Duration**: 30-60 minutes
- **Purpose**: Cultural fit and team compatibility
- **Assess**: Soft skills and collaboration
- **Interviewer**: Future teammates

### Final Interview

- **Duration**: 30-45 minutes
- **Purpose**: Executive approval and final questions
- **Assess**: Leadership and final fit
- **Interviewer**: VP, Director, or C-level

## Meeting Link Integration

### Zoom Integration

Paste Zoom meeting link directly:
```
https://zoom.us/j/1234567890?pwd=xxxxx
```

### Google Meet

Paste Google Meet link:
```
https://meet.google.com/xxx-xxxx-xxx
```

### Microsoft Teams

Paste Teams meeting link:
```
https://teams.microsoft.com/l/meetup-join/...
```

### Custom Video Platform

Any video conferencing link works!

## Rescheduling Interviews

### Reschedule Process

1. Open interview detail
2. Click **Reschedule** button
3. Update date/time
4. Add reason for reschedule (optional)
5. Click **Save**

**Reschedule History:**
- All reschedule actions are logged
- Track how many times interview was rescheduled
- View reschedule reasons

**Email Notification:**
- Candidate receives updated interview details
- Includes new date/time and meeting link

## Interview Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|-----|-------|-------------|
| View interviews | ✅ | ✅ | ✅ | ✅ |
| Schedule interview | ❌ | ✅ | ✅ | ✅ |
| Edit interview | ❌ | ✅ | ✅ | ✅ |
| Cancel interview | ❌ | ✅ | ✅ | ✅ |
| Delete interview | ❌ | ❌ | ✅ | ✅ |

## Best Practices

### Scheduling

- Schedule at least 1-2 days in advance
- Confirm candidate availability first
- Send calendar invites separately if needed
- Include timezone in meeting details

### Interview Preparation

- Review candidate resume before interview
- Agree the questions with the other interviewers in advance
- Test meeting link before interview
- Have backup communication method

### Conducting Interviews

- Start on time
- Follow the same structure for every candidate in a stage
- Take detailed notes
- Leave time for candidate questions
- Explain next steps at end

### Post-Interview

- Write the stage note and set its star rating within 24 hours
- Debrief with team if panel interview
- Make timely hiring decisions
- Communicate outcome to candidate

## Troubleshooting

### Email Not Sent

**Issue**: Interview scheduled but candidate didn't receive email

**Solution**:
- Check SendGrid configuration in backend .env
- Verify candidate email is valid
- Check email service health: `GET /api/health/email`
- Review backend logs for email errors

### Can't Schedule Interview

**Issue**: Schedule button disabled or not visible

**Solution**:
- Ensure you have HR, ADMIN, or SUPER_ADMIN role
- Verify stage exists in hiring process
- Check that hiring process status is IN_PROGRESS

### I Cannot Find Scorecards Anywhere

**Issue**: The scorecard screens described in older material do not exist

**Solution**: This is expected. Scorecards are a backend-only capability with no user interface — see [Interview Scorecards](#interview-scorecards--not-available-in-the-product). Use stage notes and their star rating for structured feedback today.

## Next Steps

- [Hiring Process](./hiring-process.md) - Manage multi-stage workflows and stage notes
- [Team Management](./team-management.md) - Assign interviewers and roles
- [Candidates](./candidates.md) - View candidate profiles and their Interviews tab
- [Async Stages](./async-stages.md) - Stages candidates complete without a meeting
