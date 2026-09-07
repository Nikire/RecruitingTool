# Integrations

## Google Calendar

**Setup:** `/settings/calendar`

Connect your Google account to sync interviews with your personal calendar.

### Setup Steps
1. Go to **Settings → Calendar**
2. Click **"Connect Google Calendar"**
3. Authorize through Google OAuth
4. Done — future interviews will automatically create calendar events

### What Gets Synced
- Interview title, date, time and duration
- Attendees (interviewers)
- Automatically generated Google Meet video link
- Cancellations and reschedules

> Every user connects their own calendar individually. The team calendar view at `/hr/calendar` aggregates every interview across the team.

---

## Stripe (Payments)

Stripe handles all billing and subscription management.

### Supported Operations
- Subscription creation through Stripe Checkout
- Plan upgrades and downgrades
- Automatic renewal
- Invoice management
- Cancellation (at period end)
- Subscription status sync through webhooks

### For SUPER_ADMIN
Configure the Stripe API keys under **Admin → System Settings**.

---

## Google Gemini AI

Powers the AI candidate scoring feature.

### Setup
Set the `GEMINI_API_KEY` environment variable on the backend.

### Rate Limits
API calls are governed by a per-company quota. Configure the limits per company at `/admin/ai-quota`.

---

## Email (Resend)

Borderless uses the **Resend HTTP API** for every transactional email.

### Setup
Set in the backend environment:
- `SMTP_PASSWORD` — Resend API key (used as the Bearer token)
- `SMTP_ENABLED=true` — Turns email sending on
- `SMTP_FROM` — Sender address (e.g. `noreply@borderlessats.com`)

### Email Types
- Application confirmations
- Interview scheduling notifications
- Interview reminders (24 h in advance)
- Status change notifications
- Team invitations
- Password reset emails

---

## MinIO / S3 (File Storage)

Every uploaded file (resumes, documents) is stored in MinIO (local) or AWS S3 (production).

### Supported File Types
`PDF`, `DOC`, `DOCX`, `TXT`

### Size Limit
10 MB per file

### Security
Files are stored with private access. Signed URLs are generated for temporary, time-limited access.

---

## N8N (Workflow Automation)

N8N can be integrated for custom workflows triggered by Borderless events through webhooks.

### Use Cases
- Custom notification flows
- CRM integrations
- Slack notifications about candidate actions
- Custom reporting

See the N8N Integration documentation for the configuration details.
