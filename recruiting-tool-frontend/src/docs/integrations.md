# Integrations

## Google Calendar

**Setup:** `/settings/calendar`

Connect your Google account to sync interviews with your personal calendar.

### Setup Steps
1. Go to **Settings → Calendar**
2. Click **"Connect Google Calendar"**
3. Authorize via Google OAuth
4. Done — future interviews auto-create calendar events

### What Gets Synced
- Interview title, date, time, duration
- Attendees (interviewers)
- Auto-generated Google Meet video link
- Cancellations and reschedules

> Each user connects their own calendar individually. The company calendar view at `/hr/calendar` aggregates all team interviews.

---

## Stripe (Payments)

Stripe handles all billing and subscription management.

### Supported Operations
- Subscription creation via Stripe Checkout
- Plan upgrades and downgrades
- Automatic renewal
- Invoice management
- Cancellation (at period end)
- Webhook-driven subscription status sync

### For SUPER_ADMIN
Configure Stripe API keys in **Admin → System Settings**.

---

## Google Gemini AI

Powers the AI candidate scoring feature.

### Configuration
Set the `GEMINI_API_KEY` environment variable in the backend.

### Rate Limits
API calls are quota-managed per company. Configure limits per company at `/admin/ai-quota`.

---

## Email (Resend)

Borderless uses the **Resend HTTP API** for all transactional emails.

### Configuration
Set in backend environment:
- `SMTP_PASSWORD` — Resend API key (used as Bearer token)
- `SMTP_ENABLED=true` — Enable email sending
- `SMTP_FROM` — Sender address (e.g., `noreply@borderlessats.com`)

### Email Types
- Application confirmations
- Interview scheduling notifications
- Interview reminders (24h before)
- Status change notifications
- Team invitations
- Password reset emails

---

## MinIO / S3 (File Storage)

All uploaded files (resumes, documents) are stored in MinIO (local) or AWS S3 (production).

### Supported File Types
`PDF`, `DOC`, `DOCX`, `TXT`

### Size Limit
10 MB per file

### Security
Files are stored with private access. Signed URLs are generated for temporary, time-limited access.

---

## N8N (Workflow Automation)

N8N can be integrated for custom workflows triggered by Borderless events via webhooks.

### Use Cases
- Custom notification workflows
- CRM integrations
- Slack notifications on candidate actions
- Custom reporting

Refer to the N8N Integration documentation for setup details.
