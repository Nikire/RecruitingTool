# Email Notifications Testing Guide

## Overview

This document describes the automated email notification system for application status changes and how to test it.

## Email Notification Triggers

### 1. Application Submitted (PENDING)
**Trigger:** Candidate submits application via public careers page

**Emails Sent:**
- **To Applicant:** Confirmation email
  - Subject: "Application Received: {jobTitle}"
  - Content: Thank you message with application reference UID
  - Company branding included (if available)

- **To HR:** New application notification
  - Subject: "New Application: {jobTitle}"
  - Content: Applicant name, position, reference UID
  - Recipients: Configured HR_NOTIFICATION_EMAIL or first HR user in database

**Test Scenario:**
```bash
POST /api/applications
{
  "applicantName": "John Doe",
  "applicantEmail": "john@example.com",
  "jobPositionUid": "{valid-job-uid}"
}
```

**Expected Behavior:**
- Application created with PENDING status
- 2 emails sent (applicant confirmation + HR notification)
- Logs show email send attempts
- EmailLog entries created in database

---

### 2. Application Under Review (REVIEWED)
**Trigger:** HR/Admin updates application status to REVIEWED

**Emails Sent:**
- **To Applicant:** Review notification
  - Subject: "Your Application for {jobTitle} is Under Review"
  - Content: Application is being reviewed, will hear back soon
  - Reference UID included

**Test Scenario:**
```bash
PUT /api/applications/{application-uid}
{
  "status": "REVIEWED"
}
```

**Expected Behavior:**
- Application status updated to REVIEWED
- 1 email sent to applicant
- Log entry: "Sent REVIEWED status email to {email}"

---

### 3. Application Accepted (ACCEPTED)
**Trigger:** HR/Admin updates application status to ACCEPTED OR uses acceptApplication endpoint

**Emails Sent:**
- **To Applicant:** Acceptance email
  - Subject: "Congratulations: Your Application for {jobTitle} Has Been Accepted"
  - Content: Congratulations message, next steps information

**Test Scenario:**
```bash
# Option 1: Direct status update
PUT /api/applications/{application-uid}
{
  "status": "ACCEPTED"
}

# Option 2: Accept endpoint (creates hiring process + sends email)
POST /api/applications/{application-uid}/accept
```

**Expected Behavior:**
- Application status updated to ACCEPTED
- If using accept endpoint: Candidate + HiringProcess created
- 1 email sent to applicant
- Log entry: "Sent ACCEPTED status email to {email}"

---

### 4. Application Rejected (REJECTED)
**Trigger:** HR/Admin updates application status to REJECTED

**Emails Sent:**
- **To Applicant:** Rejection notification
  - Subject: "Update on Your Application for {jobTitle}"
  - Content: Professional rejection message, encouragement to apply for other positions
  - Reference UID included

**Test Scenario:**
```bash
PUT /api/applications/{application-uid}
{
  "status": "REJECTED"
}
```

**Expected Behavior:**
- Application status updated to REJECTED
- 1 email sent to applicant
- Log entry: "Sent REJECTED status email to {email}"

---

## Configuration

### Environment Variables

```bash
# Email sending (SMTP)
SMTP_ENABLED=false              # true for production, false for development
SMTP_HOST=smtp.gmail.com        # SMTP server
SMTP_PORT=587                   # SMTP port
SMTP_USER=your-email@gmail.com  # SMTP username
SMTP_PASSWORD=your-app-password # SMTP password (app-specific for Gmail)
EMAIL_FROM=noreply@recruiting.com # Sender email

# Notification toggles
ENABLE_APPLICATION_EMAILS=true  # Master toggle for all application emails
HR_NOTIFICATION_EMAIL=hr@company.com # HR notification recipient
```

### Development Mode (SMTP_ENABLED=false)

When SMTP is disabled, emails are **logged to console** instead of being sent:

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

### Production Mode (SMTP_ENABLED=true)

Emails are sent via configured SMTP server (e.g., Gmail, SendGrid, AWS SES).

---

## Testing Checklist

### Manual Testing

- [ ] **Test 1:** Submit application
  - [ ] Applicant receives confirmation email
  - [ ] HR receives notification email
  - [ ] EmailLog entries created (2 entries)
  - [ ] Emails contain correct application UID
  - [ ] Company name appears in emails (if job has company)

- [ ] **Test 2:** Update status to REVIEWED
  - [ ] Applicant receives review notification
  - [ ] Email contains application UID
  - [ ] EmailLog entry created

- [ ] **Test 3:** Update status to ACCEPTED
  - [ ] Applicant receives acceptance email
  - [ ] EmailLog entry created

- [ ] **Test 4:** Use accept endpoint
  - [ ] Application accepted
  - [ ] Hiring process created
  - [ ] Acceptance email sent
  - [ ] No duplicate emails

- [ ] **Test 5:** Update status to REJECTED
  - [ ] Applicant receives professional rejection email
  - [ ] EmailLog entry created

- [ ] **Test 6:** Email failure scenarios
  - [ ] Invalid email address → Application still created
  - [ ] SMTP error → Application still created
  - [ ] Error logged but doesn't crash

- [ ] **Test 7:** Configuration toggles
  - [ ] ENABLE_APPLICATION_EMAILS=false → No emails sent
  - [ ] ENABLE_APPLICATION_EMAILS=true → Emails sent
  - [ ] HR_NOTIFICATION_EMAIL used when configured
  - [ ] Falls back to first HR user if not configured

### Automated Testing (Future)

```typescript
// Example test structure
describe('Application Email Notifications', () => {
  it('should send confirmation email on application creation', async () => {
    // Mock EmailService
    // Create application
    // Assert sendApplicationConfirmation called
  });

  it('should send status change email when status updated', async () => {
    // Mock EmailService
    // Update application status
    // Assert appropriate email method called
  });

  it('should not fail application creation if email fails', async () => {
    // Mock EmailService to throw error
    // Create application
    // Assert application created successfully
  });
});
```

---

## Monitoring & Debugging

### Check Email Logs

Query the EmailLog table:

```sql
SELECT * FROM "EmailLog"
WHERE "relatedEntity" = 'Application'
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Application Logs

```bash
# Filter for email-related logs
docker logs recruiting-tool-backend | grep -i "email"

# Filter for specific application
docker logs recruiting-tool-backend | grep "application-uid"
```

### Common Issues

**Issue:** Emails not being sent
- Check `ENABLE_APPLICATION_EMAILS=true`
- Check `SMTP_ENABLED=true` (for production)
- Verify SMTP credentials
- Check application logs for errors

**Issue:** HR not receiving notifications
- Check `HR_NOTIFICATION_EMAIL` is set
- Verify HR user exists in database with role "HR"
- Check EmailLog for send status

**Issue:** Emails sent multiple times
- Status change emails only sent when status actually changes
- Check application update logic

---

## Email Templates

All templates are defined in `email.service.ts`:

1. **sendApplicationConfirmation** - New application confirmation
2. **sendNewApplicationNotification** - HR notification
3. **sendApplicationUnderReview** - Status changed to REVIEWED
4. **sendApplicationAcceptance** - Status changed to ACCEPTED
5. **sendApplicationRejection** - Status changed to REJECTED

### Future Enhancement: Template Library

Consider migrating to database-stored templates:

```typescript
await emailService.sendEmailFromTemplate(
  'application-confirmation',
  {
    to: applicant.email,
    variables: {
      candidateName: applicant.name,
      jobTitle: job.title,
      companyName: company.name,
    }
  }
);
```

This would allow:
- Customizing email templates per company
- A/B testing different email content
- Live preview in admin panel
- Multi-language support

---

## Business Impact

### Automation Benefits

**Time Saved:**
- No manual confirmation emails: ~2 min per application
- No manual status updates: ~3 min per status change
- Average 10 applications/week = **50 minutes/week saved**

**Candidate Experience:**
- Immediate confirmation (professionalism)
- Transparent communication (status updates)
- Reduces "ghosting" perception

**Sales Pitch:**
- "Fully automated candidate communication"
- "Professional email notifications at every stage"
- "Scalable - handles 100s of applications without manual work"

### ROI Calculation

- Manual emails: 5 min/application × 40 apps/month = **200 min/month**
- Automated emails: 0 min/application
- **Savings: 3.3 hours/month** per HR team member

---

## Next Steps

1. ✅ **Completed:** Basic email notification system
2. ✅ **Completed:** Configuration via environment variables
3. ✅ **Completed:** Error handling and logging
4. 🔲 **Future:** Unit tests for email service
5. 🔲 **Future:** Database-stored email templates
6. 🔲 **Future:** Multi-language email support
7. 🔲 **Future:** Email analytics (open rates, click rates)
