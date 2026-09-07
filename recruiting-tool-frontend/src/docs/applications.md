# Applications

**Route:** `/hr/applications`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Applications are submissions from candidates who apply through the **public careers page** (`/careers`). They are independent from internal hiring processes — an application is the entry point before you decide to create a formal hiring process.

## Application Lifecycle

```
PENDING → REVIEWED → ACCEPTED
                   ↘ REJECTED
```

| Status | Meaning |
|--------|---------|
| `PENDING` | Just submitted, not reviewed yet |
| `REVIEWED` | HR has opened and reviewed it |
| `ACCEPTED` | Candidate accepted — usually creates a hiring process |
| `REJECTED` | Candidate rejected |

## What HR Can Do

- **View every application** with filters (status, position, date)
- **Download the resume** if the applicant uploaded one
- **Add internal notes** — visible only to the HR team
- **Update the status** — PENDING → REVIEWED → ACCEPTED/REJECTED
- **Send a status email** to the applicant when the status changes
- **Create a hiring process** straight from an accepted application

## Automatic Emails

When an application is submitted:
1. **Confirmation email** — sent to the applicant
2. **HR notification email** — sent to the HR team

When the status changes:
- `ACCEPTED` — an email is sent to the applicant
- `REJECTED` — an email is sent to the applicant

> Email content uses your company's email templates when configured; otherwise it falls back to the system default templates.

## Status Check Page

Candidates can check the status of their application at `/check-status` using their email and application reference — no login required.
