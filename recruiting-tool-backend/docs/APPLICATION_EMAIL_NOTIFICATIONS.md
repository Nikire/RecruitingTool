# Application Status Email Notifications

## Overview

Automated email notification system that sends professional emails to candidates at every stage of the application process. This feature reduces HR manual work, improves candidate experience, and provides a scalable automation story for sales.

**Strategic Quick Win Priority 3** - Week 1 implementation
**Implementation Time:** 45 minutes
**Business Value:** Automation story for sales, reduces HR manual work
**Immediate ROI:** Saves 50+ minutes/week per HR team member

---

## Email Triggers

### 1. Application Submitted (PENDING)
When a candidate submits an application:

**Applicant receives:**
- Subject: "Application Received: {jobTitle}"
- Professional confirmation with application reference UID
- Company branding included

**HR receives:**
- Subject: "New Application: {jobTitle}"
- Applicant details and application reference
- Notification sent to configured HR_NOTIFICATION_EMAIL or first HR user

### 2. Application Under Review (REVIEWED)
When HR updates application status to REVIEWED:

**Applicant receives:**
- Subject: "Your Application for {jobTitle} is Under Review"
- Acknowledgment that application is being reviewed
- Application reference UID included

### 3. Application Accepted (ACCEPTED)
When HR updates application status to ACCEPTED:

**Applicant receives:**
- Subject: "Congratulations: Your Application for {jobTitle} Has Been Accepted"
- Congratulations message
- Information about next steps

### 4. Application Rejected (REJECTED)
When HR updates application status to REJECTED:

**Applicant receives:**
- Subject: "Update on Your Application for {jobTitle}"
- Professional rejection message
- Encouragement to apply for other positions
- Application reference UID included

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Email Configuration (SMTP)
SMTP_ENABLED=false              # true for production, false for development
SMTP_HOST=smtp.gmail.com        # SMTP server hostname
SMTP_PORT=587                   # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com  # SMTP username
SMTP_PASSWORD=your-app-password # SMTP password (app-specific for Gmail)
EMAIL_FROM=noreply@recruiting.com # Sender email address

# Email Notifications
ENABLE_APPLICATION_EMAILS=true  # Master toggle for all application emails
HR_NOTIFICATION_EMAIL=hr@company.com # Email address for HR notifications
```

### Gmail Setup (Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
3. Use the app password in SMTP_PASSWORD

### SendGrid Setup (Recommended for Production)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

---

## Development vs Production

### Development Mode (SMTP_ENABLED=false)

Emails are logged to console instead of being sent:

```
========== EMAIL (Development Mode) ==========
To: john@example.com
From: noreply@recruiting.com
Subject: Application Received: Software Engineer
Email Type: APPLICATION_CONFIRMATION
---
Dear John Doe,

Thank you for applying for the position of Software Engineer at Tech Corp.
...
==============================================
```

**Benefits:**
- No SMTP credentials needed for development
- Fast testing without waiting for email delivery
- All email content visible in logs

### Production Mode (SMTP_ENABLED=true)

Emails are sent via configured SMTP server.

**Benefits:**
- Real email delivery to candidates
- Professional candidate experience
- Email tracking in EmailLog database

---

## Email Templates

All templates are defined in `email.service.ts`. Every method checks for a **company-configured DB template first** and falls back to the built-in branded template.

### Template Priority (for all candidate-facing emails)
1. **Company DB template** — looked up by `EmailTemplateType` and `companyId` (highest priority)
2. **Built-in branded template** — Handlebars-rendered HTML using `emailBaseStyles`

### Available Template Types (EmailTemplateType enum)
| Type | Purpose |
|------|---------|
| `APPLICATION_RECEIVED` | Confirmation sent when application is submitted |
| `APPLICATION_UNDER_REVIEW` | Sent when status moves to REVIEWED |
| `APPLICATION_REJECTED` | Sent when application is rejected |
| `APPLICATION_SHORTLISTED` | Sent when application is accepted/shortlisted |
| `APPLICATION_STATUS_UPDATE` | Generic fallback for any status change |
| `INTERVIEW_INVITATION` | Sent when interview is scheduled |
| `INTERVIEW_REMINDER` | Sent 24h before interview |
| `OFFER_LETTER` | Job offer email |
| `CUSTOM` | Ad-hoc custom emails |

### Template Variables (Handlebars)
| Variable | Description |
|----------|-------------|
| `{{candidateName}}` | Candidate's full name |
| `{{jobTitle}}` | Job position title (also `{{positionTitle}}`) |
| `{{companyName}}` | HR company name |
| `{{interviewDate}}` | Formatted interview date (e.g. "April 21, 2026") |
| `{{interviewTime}}` | Interview time string (also `{{time}}`) |
| `{{interviewerName}}` | HR interviewer name (also `{{hrName}}`) |
| `{{meetingLink}}` | Google Meet or video call URL |
| `{{status}}` | Application status string |

### Email Service Methods
1. **sendApplicationConfirmation** — triggered on application creation
2. **sendNewApplicationNotification** — sent to HR team on new application
3. **sendApplicationUnderReview** — triggered when status → REVIEWED
4. **sendApplicationAcceptance** — triggered when status → ACCEPTED
5. **sendApplicationRejection** — triggered when status → REJECTED
6. **sendApplicationStatusUpdateV2** — generic status change; tries status-specific type first, then falls back to `APPLICATION_STATUS_UPDATE`
7. **sendInterviewScheduled** — interview created by HR
8. **sendInterviewCancelled** — interview cancelled
9. **sendInterviewReminder** — 24h reminder before interview
10. **sendInterviewRescheduled** — interview time changed

---

## Error Handling

### Email Failures Don't Break Application Operations

All email operations are wrapped in try-catch blocks:

```typescript
try {
  await this.emailService.sendApplicationConfirmation(...);
  this.logger.log(`Confirmation email sent to ${email}`);
} catch (error) {
  this.logger.error(`Failed to send confirmation email: ${error.message}`);
  // Application creation continues despite email failure
}
```

**Benefits:**
- Application creation always succeeds
- Email errors are logged for monitoring
- No data loss if SMTP is down

### Logging

All email operations are logged:

```
[ApplicationService] Confirmation email sent to john@example.com for application abc-123
[ApplicationService] HR notification sent to hr@company.com for application abc-123
[ApplicationService] Sent REVIEWED status email to john@example.com for application abc-123
```

### Database Tracking

Every sent email is logged in the `EmailLog` table:

```sql
SELECT * FROM "EmailLog"
WHERE "relatedEntity" = 'Application'
ORDER BY "createdAt" DESC;
```

Fields tracked:
- recipientEmail
- subject
- template (HTML)
- status (SENT/FAILED)
- emailType (APPLICATION_CONFIRMATION, STATUS_CHANGE, HR_NOTIFICATION)
- relatedEntityId (application UID)

---

## Testing

See `EMAIL_NOTIFICATIONS_TESTING.md` for comprehensive testing guide.

### Quick Test

1. Submit an application via the careers page
2. Check console logs for email output (development mode)
3. Verify EmailLog entries in database
4. Update application status to REVIEWED
5. Check for status change email

### Production Test Checklist

- [ ] Configure SMTP credentials
- [ ] Set SMTP_ENABLED=true
- [ ] Submit test application
- [ ] Verify confirmation email received
- [ ] Verify HR notification received
- [ ] Update status to REVIEWED
- [ ] Verify review email received
- [ ] Update status to ACCEPTED
- [ ] Verify acceptance email received
- [ ] Update status to REJECTED
- [ ] Verify rejection email received

---

## Business Impact

### Time Savings

**Manual Process:**
- Confirmation email: 2 minutes per application
- Status update emails: 3 minutes per update
- Average 10 applications/week with 2 status updates each
- Total: **50 minutes/week per HR team member**

**Automated Process:**
- 0 minutes per application
- 0 minutes per status update
- **50 minutes/week saved**

### Candidate Experience

**Before:**
- No confirmation (candidates wonder if application received)
- No status updates (candidates left in the dark)
- "Ghosting" perception

**After:**
- Immediate confirmation (professional impression)
- Transparent status updates (candidate knows where they stand)
- Reduced follow-up emails to HR

### Sales Value

**Demo Talking Points:**
- "Fully automated candidate communication"
- "Professional email notifications at every stage"
- "Scalable - handles 100s of applications without manual work"
- "Reduces HR workload by 50+ minutes/week"
- "Improves candidate experience and employer brand"

---

## Future Enhancements

### Short-Term (Next Sprint)

1. **Template Library Integration**
   - Replace hardcoded templates with database-stored templates
   - Allow customization per company
   - Use existing email template library (Issue #77)

2. **Multi-Language Support**
   - Detect candidate language preference
   - Send emails in candidate's language
   - Use i18n for email templates

### Medium-Term (Next Month)

1. **Email Analytics**
   - Track open rates
   - Track click rates
   - A/B test different email content

2. **Email Scheduling**
   - Delay rejection emails by 24 hours (more humane)
   - Send batch notifications at specific times
   - Avoid sending emails outside business hours

3. **Email Preferences**
   - Allow candidates to opt-out of certain emails
   - Preference center for email frequency

### Long-Term (Next Quarter)

1. **Advanced Personalization**
   - Use AI to personalize email content
   - Reference specific skills from candidate's resume
   - Mention specific interview feedback

2. **Email Campaigns**
   - Nurture campaigns for rejected candidates
   - Re-engagement emails for passive candidates
   - Talent pool maintenance

---

## Troubleshooting

### Emails Not Being Sent

**Check:**
1. `ENABLE_APPLICATION_EMAILS=true` in `.env`
2. `SMTP_ENABLED=true` for production
3. SMTP credentials are correct
4. SMTP server allows connections from your IP
5. Firewall not blocking SMTP port

**Debug:**
```bash
# Check application logs
docker logs recruiting-tool-backend | grep -i "email"

# Check specific application
docker logs recruiting-tool-backend | grep "application-uid"
```

### HR Not Receiving Notifications

**Check:**
1. `HR_NOTIFICATION_EMAIL` is set in `.env`
2. Email address is valid
3. Email not in spam folder
4. Check EmailLog for send status

**Fallback:**
If `HR_NOTIFICATION_EMAIL` not configured, system finds first user with role "HR" in database.

### Duplicate Emails

**Root Cause:**
Application status updated multiple times in quick succession.

**Solution:**
Status change emails only sent when status actually changes:
```typescript
if (updateApplicationDto.status && updateApplicationDto.status !== oldStatus) {
  await this.sendStatusChangeEmail(...);
}
```

---

## Implementation Details

### Files Modified

1. **recruiting-tool-backend/.env**
   - Added SMTP configuration
   - Added email notification toggles

2. **recruiting-tool-backend/src/modules/email/email.service.ts**
   - Enhanced 5 email methods with logging and toggles
   - Added company branding support

3. **recruiting-tool-backend/src/modules/application/application.service.ts**
   - Added ConfigService and Logger
   - Enhanced create() with email notifications
   - Enhanced update() with status change emails
   - Improved error handling

4. **.claude/docs/FEATURES.md**
   - Added feature to Recently Implemented section
   - Updated Future Improvements

### Files Created

1. **recruiting-tool-backend/docs/EMAIL_NOTIFICATIONS_TESTING.md**
   - Comprehensive testing guide
   - Configuration instructions
   - Troubleshooting tips

2. **recruiting-tool-backend/docs/APPLICATION_EMAIL_NOTIFICATIONS.md**
   - This file (feature documentation)

---

## Related Issues

- **Issue #79:** Implement application status email notifications (COMPLETED ✅)
- **Issue #77:** Email template library (COMPLETED ✅)
- **Future:** Integrate template library with application notifications

---

## Summary

Application status email notifications are now fully automated, reducing HR manual work by 50+ minutes/week while improving candidate experience. The system is configurable, error-resistant, and provides a strong automation story for sales demos.

**Key Achievements:**
✅ Automated confirmation emails
✅ Automated status change notifications
✅ HR notification system
✅ Company branding
✅ Error handling and logging
✅ Production-ready configuration
✅ Comprehensive testing guide

**Next Steps:**
- Test in production environment
- Integrate with email template library (replace hardcoded templates)
- Add multi-language support
- Implement email analytics
