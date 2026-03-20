# Applications

**Route:** `/hr/applications`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Applications are submissions from candidates who apply via the **public careers page** (`/careers`). They are separate from internal hiring processes — an application is the entry point before you decide to create a formal hiring process.

## Application Lifecycle

```
PENDING → REVIEWED → ACCEPTED
                   ↘ REJECTED
```

| Status | Meaning |
|--------|---------|
| `PENDING` | Just submitted, not yet reviewed |
| `REVIEWED` | HR has opened and reviewed it |
| `ACCEPTED` | Candidate accepted — usually creates a hiring process |
| `REJECTED` | Candidate rejected |

## What HR Can Do

- **View all applications** with filters (status, position, date)
- **Download resume** if the applicant uploaded one
- **Add internal notes** — only visible to HR team
- **Update status** — PENDING → REVIEWED → ACCEPTED/REJECTED
- **Send status email** to applicant when status changes
- **Create a hiring process** directly from an accepted application

## Auto-Emails

When an application is submitted:
1. **Confirmation email** — sent to applicant
2. **HR notification email** — sent to HR team

When status changes:
- `ACCEPTED` — email sent to applicant
- `REJECTED` — email sent to applicant

> Email content uses the company's email templates if configured, otherwise falls back to default templates.

## Check Status Page

Candidates can check their application status at `/check-status` using their email and application reference — no login required.
