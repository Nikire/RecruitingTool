# Calendar

**Route:** `/hr/calendar`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Calendar page shows all upcoming interviews for your company in a monthly/weekly/daily view.

## Features

- **Monthly / Weekly / Daily views** — switch between calendar views
- **Team member filter** — filter interviews by interviewer
- **Interview details** — click any interview chip to see full details
- **Stage notes panel** — see candidate notes directly from the calendar
- **Quick actions** — reschedule or cancel from the popover

## Interview Detail Popover

Clicking an interview chip opens a popover with:
- Candidate name and position
- Interview date, time, duration
- Meeting link (if set)
- Interviewers
- **"See all notes"** toggle — shows all stage evaluation notes for the candidate

## Google Calendar Setup

To connect your personal Google Calendar:
1. Go to **Settings → Calendar** (`/settings/calendar`)
2. Click **"Connect Google Calendar"**
3. Authorize Borderless to access your calendar
4. Interviews will now auto-create events in your Google Calendar

> Each user connects their own Google Calendar individually. Team calendar is a read-only aggregate view in the app.

## Self-Service Interview Booking

For certain stages, HR can generate a **booking token** for the candidate. The candidate receives a link (`/book-interview/:token`) where they can pick from available time slots — no login required.
