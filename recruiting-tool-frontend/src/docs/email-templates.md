# Email Templates

**Route:** `/hr/email-templates`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Email Templates let you customize the automated emails Borderless sends to candidates.

## Available Template Types

| Type | When Sent |
|------|----------|
| `APPLICATION_RECEIVED` | When a candidate applies via careers page |
| `APPLICATION_UNDER_REVIEW` | When application status changes to REVIEWED |
| `APPLICATION_ACCEPTED` | When application is accepted |
| `APPLICATION_REJECTED` | When application is rejected |
| `INTERVIEW_SCHEDULED` | When an interview is scheduled |
| `INTERVIEW_CANCELLED` | When an interview is cancelled |
| `INTERVIEW_REMINDER` | Sent 24 hours before interview |

## Template Variables

Use these **Handlebars variables** in your templates:

| Variable | Description |
|----------|-------------|
| `{{candidateName}}` | Candidate's full name |
| `{{positionTitle}}` | Job position title |
| `{{companyName}}` | Your company name |
| `{{interviewDate}}` | Interview date |
| `{{interviewTime}}` | Interview time |
| `{{meetingLink}}` | Video conference link |
| `{{interviewerName}}` | Name of the interviewer |

## How It Works

1. Create a template for a specific type
2. Borderless checks for your company's custom template first
3. If none exists — falls back to the default system template
4. Templates are rendered with Handlebars before sending

## Preview

Each template has a **Preview** button that shows how the email will look with sample data filled in.

## Plain Text vs HTML

Templates support both plain text and basic HTML formatting. Keep HTML simple for maximum email client compatibility.
