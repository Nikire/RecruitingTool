# Calendar and Scheduling

Guide to the company Meetings calendar, connecting Google Calendar, configuring your booking window, and letting candidates pick their own interview time.

## Overview

Borderless has three scheduling surfaces. The **Meetings** calendar shows everything your team has booked. **Settings → Calendar** connects Google Calendar and configures when candidates may book you. Once booking is switched on, a **Send Booking Link** button appears on hiring process stages so a candidate can pick their own slot from a public page.

| Screen | Route | Sidebar |
|--------|-------|---------|
| Meetings | `/hr/calendar` | Scheduling → **Meetings** |
| Interviews | `/hr/interviews` | Scheduling → **Interviews** |
| Calendar & booking settings | `/settings/calendar` | Settings → **Calendar** |

All three sit inside the HR route group, so **HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN** can open them. The APIs behind them stop at HR, so a RECRUITER can open the pages but nothing works — see [Who can connect Google Calendar](#who-can-connect-google-calendar).

## Company Calendar (Meetings)

**Navigate to it:** Sidebar → **Scheduling** → **Meetings**, or go to `/hr/calendar`.

The page is a full-height calendar of your company's interviews.

### Navigating

The header carries, from left to right: the page title, a back arrow, a **Today** button, a forward arrow, the current period label, and a **Month / Week / Day** toggle.

| Control | Effect |
|---------|--------|
| **Month** | A month grid. Each day cell lists up to three interview chips and then a `+N` overflow count. |
| **Week** | A seven-column day-by-hour grid. Interviews starting at the same time share the column width. |
| **Day** | A single-column day-by-hour grid. |
| Back / forward arrows | Move one month, one week or one day depending on the active view |
| **Today** | Jump back to the current date |

If loading the interviews fails, the grid area is replaced by an error alert with a **Retry** button.

### Filtering by team member

A **Team Members** panel runs down the left side, with a checkbox and avatar per member and two shortcuts:

- **My meetings only** — restricts the calendar to interviews you are on
- **Show all** — clears the filter

Deselecting every member shows an empty calendar rather than everybody's.

### Interview details

Click any interview chip to open its detail popover. It shows the candidate's name as the title, plus:

- **Job Position**, **Stage**, **Organizer**
- **Date / Time** and **Duration** in minutes
- **Meeting Link** — the link itself, an open button, and a copy button; or "No meeting link" when none exists
- **Evaluation Notes** — hidden behind **See all notes** / **Hide notes**

Four actions sit at the bottom of the popover: **See all notes**, **Copy Meet Link** (only when a link exists), **Reschedule**, and **Cancel Interview**. Reschedule asks for a new date and time; both fields are required. Cancel asks for confirmation and warns the action cannot be undone.

The popover does not link through to the hiring process — open it from `/hr/hiring-processes` instead.

## Connecting Google Calendar

**Navigate to it:** Sidebar → **Settings** → **Calendar**, or go to `/settings/calendar`.

The first card, **Google Calendar Integration**, shows a **Connection Status** indicator reading **Connected** or **Not Connected**, with a refresh icon in the card header to re-check it.

### What connecting gives you

- Interviews scheduled in Borderless create a Google Calendar event with a Google Meet link.
- The booking system cannot be enabled at all until Google Calendar is connected.

A free/busy endpoint exists (`GET /api/google-calendar/availability`) but no page calls it, and slot generation does **not** consult it. Bookable slots are derived purely from the Working Days, Working Hours, Buffer, Booking Window and Blocked Dates you configure below, minus slots already in the past. A time that is busy in your Google Calendar can still be offered to a candidate.

### Connecting

1. Click **Connect Google Calendar**.
2. A 600 × 700 popup window opens and is sent to Google's consent screen.
3. Authorize calendar access. Borderless only requests permission to manage calendar events.
4. Close the popup when Google finishes. Borderless polls once a second for the window closing, then re-checks the connection.

| Outcome | What you see |
|---------|--------------|
| Authorization completed | Success toast: "Google Calendar connected successfully." |
| Popup closed before finishing | Info toast: "Authorization was not completed. Google Calendar is still not connected." |
| Browser blocked the popup | Error toast: "Your browser blocked the Google authorization window. Allow pop-ups for this site and try again." |
| The authorization URL could not be fetched | The popup closes and an error toast appears: "Failed to connect Google Calendar. Please try again." |

Closing the popup is not treated as proof of success — the status is always re-read from the server before the success message is shown.

### Disconnecting

Click **Disconnect**. On success you get "Google Calendar disconnected successfully."; on failure, "Failed to disconnect Google Calendar. Please try again."

Disconnecting leaves the booking switch unusable until you reconnect.

### Who can connect Google Calendar

The Google Calendar endpoints (`GET /api/google-calendar/status`, `GET /api/google-calendar/auth-url`, `DELETE /api/google-calendar/disconnect`) are declared `@Auth([HR, ADMIN, SUPER_ADMIN])`. The backend role guard reads that as **"HR and every role above HR"**, so HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN can all connect and disconnect.

**RECRUITER cannot.** The route guard lets a RECRUITER open `/settings/calendar`, but the status, connect and disconnect calls are refused with 403, so the card never reports a usable state. The same applies to the booking settings and to every time-slot endpoint. See [Roles and Permissions](./roles-and-permissions.md).

## Calendar and Booking Settings

The second card on `/settings/calendar` is **Calendar & Booking Settings**. The same card is also mounted at the bottom of **Company Profile** (`/hr/settings/company`), so you can configure it from either page.

Until Google Calendar is connected, the card shows a warning — "The automatic booking system needs a Google Calendar connection to create meeting links and check availability. Connect your Google Calendar above before enabling this feature." — and the **Enable Booking System** switch in the card header is disabled.

### Fields

With booking enabled, the card exposes:

| Field | Values | Notes |
|-------|--------|-------|
| **Working Days** | Mon–Sun toggle buttons | At least one day is required |
| **Working Hours** — From / To | Time pickers in 5-minute steps | The end time must be later than the start time |
| **Buffer Between Slots** | No buffer, 5, 10, 15, 30, 45 min, 1 hour | Gap inserted between back-to-back meetings |
| **Booking Window** | 1–365 days ahead | How far into the future candidates may book |
| **Blocked Dates** | A date picker plus **Add** | Added dates appear as removable chips; use for holidays and days off |

Click **Save Settings** to persist. Save is blocked while any of these are true: no working day is selected, the end time is not after the start time, or the booking window is outside 1–365. The matching inline error is shown next to the offending field.

With booking disabled, the card shows only an information line — "Enable the booking system to allow candidates to schedule their own interviews" — and a small **Save Settings** button that persists the off state.

The settings endpoints (`GET` / `PUT /api/company-calendar-settings`) admit HR and every role above HR.

## Candidate Self-Scheduling

Once booking is enabled, a candidate can pick their own interview time from a public page.

### Sending a booking link

1. Open the hiring process for the candidate at `/hr/hiring-processes`.
2. Expand the stage you want to schedule.
3. Click **Send Booking Link**. The button only renders when the booking system is enabled for your company.

Borderless creates a draft interview, generates slots from your working days, hours, buffer and booking window, and emails the candidate a scheduling link. The panel then shows "Booking link sent to *email*" together with a **Copy link** button, so you can send the link another way if the email does not arrive.

If the booking system is off, the API refuses the call with 403 and the message "Booking system is not enabled. Enable it in Company Settings → Calendar & Booking Settings."

Booking tokens are **single-use** and expire **7 days** after they are issued.

### What the candidate sees

The emailed link points to `/book-interview/:token`. No account or login is required. The page reads the available slots and the company's booking settings through the token, and the candidate picks one.

After choosing, the candidate lands on `/booking-confirmed/:token`.

| Situation | Public API response |
|-----------|--------------------|
| Token not found | 404 "Invalid booking token" |
| Token past its expiry | 403 "Booking token has expired" |
| Token already used | 403 "Booking token has already been used" |
| Chosen slot no longer free | 400 |

### Endpoints behind self-scheduling

| Method | Endpoint | Who |
|--------|----------|-----|
| POST | `/api/time-slots/send-stage-booking-link/:stageUid` | HR and above |
| POST | `/api/time-slots/send-booking-link/:interviewUid` | HR and above |
| POST | `/api/time-slots/generate` | HR and above |
| GET | `/api/time-slots/interview/:interviewUid` | HR and above |
| DELETE | `/api/time-slots/cancel/:interviewUid` | HR and above |
| GET | `/api/time-slots/available/:token` | Public (candidate) |
| GET | `/api/time-slots/settings/:token` | Public (candidate) |
| POST | `/api/time-slots/select/:token` | Public (candidate) |

"HR and above" means HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN.

## Troubleshooting

**The Enable Booking System switch is greyed out.** Google Calendar is not connected. Connect it in the card above, then refresh the connection status.

**The Send Booking Link button is missing from the stage.** The booking system is off for your company. Turn it on in **Settings → Calendar**.

**Connect Google Calendar does nothing.** Your browser blocked the popup. Allow pop-ups for the site and try again.

**Everything on these pages returns "Access Denied".** You are signed in as a RECRUITER. The scheduling APIs start at HR; ask for a higher role.

**Slots are offered outside your hours, or clash with something in Google Calendar.** The slot generator reads only the saved booking settings — working days, working hours, buffer, booking window and blocked dates. It does not read your Google free/busy. Adjust the booking card, or add the date to Blocked Dates.

**No slots were generated.** The generator produces nothing when no working day is selected, the working hours are too narrow for one interview plus the buffer, or every date in the booking window is blocked.

## Next Steps

- [Interviews](./interviews.md) - Scheduling and running interviews
- [Hiring Process](./hiring-process.md) - Stages, including the stage the booking link is sent from
- [Company Settings](./company-settings.md) - The other page that hosts the booking card
- [Email Templates](./email-templates.md) - Customize the interview invitation and reminder emails
- [Roles and Permissions](./roles-and-permissions.md) - Who can open and act on these screens
