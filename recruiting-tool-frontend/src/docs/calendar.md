# Calendar

**Route:** `/hr/calendar`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Calendar page shows every upcoming interview at your company in a month, week or day view.

## Features

- **Month / week / day views** — switch between calendar views
- **Filter by team member** — filter interviews by interviewer
- **Interview details** — click any interview chip to see the full details
- **Stage notes panel** — read the candidate's notes straight from the calendar
- **Quick actions** — reschedule or cancel from the popover

## Interview Detail Popover

Clicking an interview chip opens a popover with:
- Candidate name and position
- Interview date, time and duration
- Meeting link (if configured)
- Interviewers
- **"See all notes"** toggle — shows every stage evaluation note for the candidate

## Google Calendar Setup

To connect your personal Google Calendar:
1. Go to **Settings → Calendar** (`/settings/calendar`)
2. Click **"Connect Google Calendar"**
3. Authorize Borderless to access your calendar
4. Interviews will automatically create events in your Google Calendar

> Every user connects their own Google Calendar individually. The team calendar is a read-only aggregated view inside the app.

## Candidate Interview Booking

For certain stages, HR can generate a **booking token** for the candidate. The candidate receives a link (`/book-interview/:token`) where they can pick from the available time slots — no login required.
