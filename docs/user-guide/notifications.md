# Notifications

Guide to the notification inbox, the bell in the navbar, and the eight notification preference switches.

## Overview

Borderless raises an in-app notification for most things that happen around your candidates, interviews, hiring processes, team and subscription. You see unread counts on the bell in the navbar, read the full history on the Notifications page, and choose what you receive on the Notification Preferences page.

Both pages are available to any signed-in user — there is no role guard on either.

| Screen | Route |
|--------|-------|
| Notifications inbox | `/notifications` |
| Notification preferences | `/settings/notifications` |

## The Bell

The bell in the navbar shows a badge with your unread count, capped at 99+. Clicking it opens a dropdown with your ten most recent notifications, a **Mark all as read** action, and a **View all notifications** link through to the full page. Timestamps are relative — "Just now", "5 minutes ago", "2 hours ago", "3 days ago". Clicking a notification takes you to whatever it refers to, or to `/notifications` if it has no target.

## The Notifications Page

**Navigate to it:** click the bell, then **View all notifications**, or go to `/notifications`.

The page header shows the title and "Manage and view all your notifications in one place".

### Filtering

Three filter buttons sit above the list: **All**, **Unread** and **Read**. Switching filter resets you to the first page.

### Reading and clearing

- Clicking a notification marks it read.
- **Mark all as read** clears every unread notification at once and reports how many were marked.
- The delete icon on a row removes that notification.

### Pagination

The list shows 20 notifications per page. Because the endpoint returns no total count, the pager discovers the last page only when a page comes back short — so the page count grows as you move forward rather than being known up front.

### Team invitations in the inbox

An invitation notification carries **Accept** and **Dismiss** buttons inline. Dismiss only removes the notification: "This only removes the notification from your inbox. The invitation stays open, so you can still accept it later from the email you received."

### Empty states

| Filter | Message |
|--------|---------|
| All | "No notifications" |
| Unread | "No unread notifications" |
| Read | "No read notifications" |

All three add "You're all caught up!" below.

## Notification Preferences

**Navigate to it:** `/settings/notifications`.

The page has two cards, each with a chip reading "*n* of 4 active" and four switches — eight switches in total. Every switch defaults to on.

### Email Notifications

"Receive notifications via email."

| Switch | Description shown |
|--------|-------------------|
| Application status updates | Receive notifications when application statuses change |
| Interview scheduled | Get notified when interviews are scheduled or rescheduled |
| New candidate added | Notifications when new candidates apply to positions |
| System announcements | Important system updates and announcements |

### In-App Notifications

"Receive notifications within the application."

| Switch | Description shown |
|--------|-------------------|
| Application status updates | In-app notifications for application status updates |
| Interview scheduled | In-app alerts for interview scheduling |
| New candidate added | In-app notifications for new candidate applications |
| System announcements | In-app notifications for system announcements |

Changes save immediately and confirm with "Notification preferences updated". A failure shows "Failed to update notification preferences", and a page that cannot load its preferences shows "Failed to load notification preferences".

### Important: the switches are not yet enforced

The eight preferences are stored against your user account and read back by `GET /api/notification-preferences`, but **no notification or email path in the backend reads them**. Turning a switch off records your choice; it does not currently stop the corresponding email or in-app notification from being delivered.

Treat these switches as a stated preference until enforcement lands.

## What Actually Raises a Notification

The switches cover four themes, but the product raises far more notification types than that. The `NotificationType` enum in `recruiting-tool-backend/prisma/schema.prisma` has 65 members; the ones with no matching preference switch have no way to be turned off at all.

| Theme | Notification types | Covered by a switch |
|-------|-------------------|:-------------------:|
| Applications | `APPLICATION_RECEIVED`, `APPLICATION_SUBMITTED`, `APPLICATION_REVIEWED`, `APPLICATION_STATUS`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED` | Partly |
| Interviews | `INTERVIEW_SCHEDULED`, `INTERVIEW_BOOKED_BY_CANDIDATE`, `INTERVIEW_UPDATED`, `INTERVIEW_CANCELLED`, `INTERVIEW_RESCHEDULED`, `INTERVIEW_COMPLETED`, `INTERVIEW_FEEDBACK_SUBMITTED`, `INTERVIEW_REMINDER_24H`, `INTERVIEW_REMINDER_1H` | Partly |
| Hiring processes | `HIRING_PROCESS_STARTED`, `HIRING_PROCESS_STAGE_CHANGED`, `HIRING_PROCESS_COMPLETED`, `HIRING_PROCESS_OFFER_EXTENDED`, `HIRING_PROCESS_OFFER_ACCEPTED`, `HIRING_PROCESS_OFFER_REJECTED` | ❌ |
| Candidates | `CANDIDATE_STAGE_ADVANCED`, `CANDIDATE_STAGE_REJECTED`, `CANDIDATE_ADDED_TO_PROCESS`, `CANDIDATE_REMOVED_FROM_PROCESS`, `CANDIDATE_NOTE_ADDED`, `CANDIDATE_SCORE_UPDATED` | ❌ |
| Team | `TEAM_INVITATION_SENT`, `TEAM_INVITATION_ACCEPTED`, `TEAM_INVITATION_REJECTED`, `TEAM_INVITATION_EXPIRED`, `TEAM_MEMBER_ADDED`, `TEAM_MEMBER_REMOVED`, `TEAM_ROLE_CHANGED` | ❌ |
| Company connections | `COMPANY_CONNECTION_REQUESTED`, `COMPANY_CONNECTION_APPROVED`, `COMPANY_CONNECTION_REJECTED`, `COMPANY_SETTINGS_UPDATED` | ❌ |
| Subscription | `SUBSCRIPTION_TRIAL_ENDING`, `SUBSCRIPTION_TRIAL_ENDED`, `SUBSCRIPTION_PLAN_UPGRADED`, `SUBSCRIPTION_PLAN_DOWNGRADED`, `SUBSCRIPTION_PAYMENT_SUCCESS`, `SUBSCRIPTION_PAYMENT_FAILED`, `SUBSCRIPTION_RENEWED`, `SUBSCRIPTION_CANCELLED`, `SUBSCRIPTION_LIMIT_WARNING`, `SUBSCRIPTION_LIMIT_REACHED` | ❌ |
| Account | `ACCOUNT_WELCOME`, `ACCOUNT_EMAIL_VERIFIED`, `ACCOUNT_PASSWORD_CHANGED`, `ACCOUNT_PROFILE_UPDATED` | ❌ |
| Job positions | `JOB_POSITION_CREATED`, `JOB_POSITION_PUBLISHED`, `JOB_POSITION_UPDATED`, `JOB_POSITION_CLOSED`, `JOB_POSITION_PENDING_APPROVAL`, `JOB_POSITION_APPROVED`, `JOB_POSITION_REJECTED` | ❌ |
| Async stages | `ASYNC_STAGE_SUBMISSION_RECEIVED`, `ASYNC_STAGE_REMINDER_SENT` | ❌ |
| System | `SYSTEM`, `SYSTEM_ANNOUNCEMENT`, `SYSTEM_MAINTENANCE`, `SYSTEM_FEATURE_UPDATE` | Partly (System announcements) |

"Covered by a switch" describes intent only — see the note above, since none of the switches is enforced yet.

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notification-preferences` | Read your eight preferences |
| PATCH | `/api/notification-preferences` | Update them |

## Next Steps

- [Team Management](./team-management.md) - Where team invitation notifications come from
- [Interviews](./interviews.md) - Interview notifications and reminders
- [Email Templates](./email-templates.md) - The content of the emails candidates receive
