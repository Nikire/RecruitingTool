# Email Templates

**Route:** `/hr/email-templates`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Email Templates let you customize the automatic emails Borderless sends to candidates.

## Available Template Types

| Type | When It Is Sent |
|------|----------|
| `APPLICATION_RECEIVED` | When a candidate applies through the careers page |
| `APPLICATION_UNDER_REVIEW` | When the application status changes to REVIEWED |
| `APPLICATION_ACCEPTED` | When the application is accepted |
| `APPLICATION_REJECTED` | When the application is rejected |
| `INTERVIEW_SCHEDULED` | When an interview is scheduled |
| `INTERVIEW_CANCELLED` | When an interview is cancelled |
| `INTERVIEW_REMINDER` | Sent 24 hours before the interview |

## Template Variables

Use these **Handlebars variables** in your templates:

| Variable | Description |
|----------|-------------|
| `{{candidateName}}` | Candidate's full name |
| `{{positionTitle}}` | Job position title |
| `{{companyName}}` | Your company name |
| `{{interviewDate}}` | Interview date |
| `{{interviewTime}}` | Interview time |
| `{{meetingLink}}` | Video meeting link |
| `{{interviewerName}}` | Interviewer's name |

## How It Works

1. Create a template for a specific type
2. Borderless first checks whether a custom template exists for your company
3. If it does not — it falls back to the system default template
4. Templates are rendered with Handlebars before sending

## Preview

Every template has a **Preview** button that shows how the email will look with sample data filled in.

## Plain Text vs. HTML

Templates support both plain text and basic HTML formatting. Keep the HTML simple for better email client compatibility.
