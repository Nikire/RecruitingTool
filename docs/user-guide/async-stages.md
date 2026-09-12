# Async Stage Submissions

Complete guide to sending candidates secure submission links and reviewing their uploaded materials.

## Overview

Async stages let you collect materials from candidates without scheduling a live session. You send the candidate a secure, one-time link. They visit a public page, upload files and/or write a text response. You then review the submission directly in the hiring process panel.

**Common use cases:**
- Take-home coding assignments
- Portfolio or work sample submissions
- Written assessments or questionnaires
- Design challenges or case studies

Each link is unique to the candidate and stage. Once the candidate submits, the link is consumed and cannot be reused.

---

## Sending a Submission Request (HR)

1. Open the hiring process for the candidate.
2. Locate the stage that requires an async submission and click to expand the stage accordion.
3. In the **Async Submissions** section, click **Request Submission**.
4. Optionally set a **Deadline** using the date and time picker. Setting a deadline triggers an automatic reminder email 24 hours before it expires.
5. Click **Send Link**.

The candidate receives an email containing the secure submission link. The panel updates immediately to show **Awaiting Submission**, along with the submission URL and a **Copy Link** button so you can share it manually if needed.

### Revoking a Link

If you need to cancel the request before the candidate submits:

1. In the **Async Submissions** section, click **Revoke Link**.
2. Confirm the action in the dialog.

The link is invalidated immediately. You can send a new request to the candidate at any time.

---

## Submitting as a Candidate (Public Page)

The candidate receives an email with a unique link. No account or login is required.

1. Candidate opens the link in any browser.
2. The page displays:
   - Stage name and description
   - Job position title
   - Company name
   - Submission deadline (if set)
3. The candidate can write a **text response** in the provided field (optional).
4. The candidate can attach **up to 10 files** (maximum 100 MB per file) using the file picker. No file-type filter is applied — any format is accepted.
5. When ready, the candidate clicks **Submit**. A response or at least one file is required: "Add a written response or at least one file before submitting."
6. A confirmation message appears on screen: **Submission Received!** — "Our team will review it and be in touch soon."

Selecting more than ten files, or a file over 100 MB, does not fail the whole selection. The page keeps what fits and tells the candidate which files it dropped and why.

After submission, the link becomes inactive. Reopening it shows **Submission Already Received**.

---

## Token Lifecycle

Every submission link is a single-use token. This is what governs the states you and the candidate see.

| State | How it is reached | What the candidate sees |
|-------|-------------------|-------------------------|
| **Issued** | You click **Request Submission**. A 64-character token is minted and emailed as `/submit/<token>`. Any earlier unused, unrevoked token for the same stage and hiring process is revoked at the same moment. | The submission form |
| **Awaiting submission** | The token is live and unused | The submission form |
| **Consumed** | The candidate submits. The token is stamped used and cannot be reused. | **Submission Already Received** |
| **Revoked** | You click **Revoke Link**, or you sent a fresh link which superseded this one | **Invalid or Expired Link** — "This submission link is no longer valid." |
| **Expired** | The deadline you set has passed. Tokens sent with no deadline never expire. | **This Link Has Expired** — "The deadline for this assignment has passed. Contact the recruiter if you need an extension." |

### How each state is signalled by the API

| Situation | HTTP status |
|-----------|-------------|
| Token not found, or revoked | 401 "Invalid or revoked submission link" |
| Token past its deadline | **410** "This submission link has expired" |
| Token already used, on submit | 409 "This submission link has already been used" |

The public page maps these directly: 410 renders the expiry notice, and 401, 403 or 404 render the invalid-link notice. Any other failure renders "We Couldn't Load Your Assignment" with a **Retry** button, because the link itself may still be valid.

### Public endpoints

The candidate page at `/submit/:token` is backed by three unauthenticated routes:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/public/async-stage/:token` | Validate the token and return the stage title, description, job title, company name, deadline, and whether it has already been submitted |
| POST | `/api/public/async-stage/:token/submit` | Submit text and up to 10 files of at most 100 MB each, as `multipart/form-data` |
| GET | `/api/public/async-stage/:token/files/:fileUid/download` | Return a signed download URL for one submitted file, scoped to the same token |

The download route is token-scoped, so a candidate can only ever retrieve files from their own submission.

---

## Reviewing a Submission (HR)

When the candidate submits, the stage panel updates automatically.

1. Open the hiring process and expand the relevant stage.
2. The **Async Submissions** section now shows **Submission Received**.
3. Review the candidate's **text response** directly in the panel.
4. Click **Download** next to any attached file to save it locally.
5. Optionally, click **Add Note** to record your internal evaluation comments.
6. When your review is complete, click **Mark as Reviewed**.

The panel turns green to confirm the stage has been reviewed. This signals to the rest of the team that the submission has been evaluated.

---

## Submission Reminder Emails

A scheduled job runs **once a day at 09:00 server time**. It emails a reminder for every token whose deadline falls between **24 and 48 hours** from the moment it runs, and which has not been used, revoked, or already submitted against.

In practice that means a candidate gets one reminder roughly a day before their deadline, on the morning of the run that catches it.

- No action is required from HR for reminders to send.
- Tokens sent with no deadline never trigger a reminder, because the job keys off the deadline.
- If the candidate submits before the job runs, no reminder is sent.
- Reminders reuse the **Async Stage Invitation** email, flagged as a reminder — customize it on the [Email Templates](./email-templates.md) page at `/hr/email-templates`.

The job is `AsyncStageReminderService` in `recruiting-tool-backend/src/modules/async-stage/async-stage-reminder.service.ts`.

---

## Permissions

Every HR-side async stage endpoint is declared `@Auth(['HR', 'HR_MANAGER', 'COMPANY_OWNER', 'ADMIN', 'SUPER_ADMIN'])`. The backend role guard reads that as **"HR and every role above HR"**, so one row covers all of them.

| Action | HR | HR_MANAGER | RECRUITER | COMPANY_ADMIN | COMPANY_OWNER | ADMIN | SUPER_ADMIN |
|--------|:--:|:----------:|:---------:|:-------------:|:-------------:|:-----:|:-----------:|
| Send submission link | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Revoke link | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View submission | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Download files | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Mark as reviewed | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |

A RECRUITER can open the hiring process page but every async stage call is refused with 403. The candidate side needs no role at all — it is authenticated by the token. See [Roles and Permissions](./roles-and-permissions.md).

---

## Best Practices

### Choose the Right Stage Type

Use async submissions when:
- You want candidates to work at their own pace
- The task requires more than 30 minutes of focused work
- You need a portfolio or artifact rather than a live demo

Use live interviews instead when:
- Real-time problem-solving is being evaluated
- You need to ask follow-up questions during the assessment

### Set a Deadline

Always set a deadline for time-sensitive stages. A deadline:
- Creates urgency for the candidate
- Triggers an automatic reminder email
- Keeps the hiring process moving on schedule

### Document Your Evaluation

Before clicking **Mark as Reviewed**, add an HR note with your assessment. Include:
- What the candidate did well
- Areas of concern
- Your recommendation (advance / reject)

This gives the rest of the team context before making a final decision.

---

## Next Steps

- [Hiring Process](./hiring-process.md) - Manage multi-stage workflows
- [Email Templates](./email-templates.md) - Customize invitation and notification emails
- [Interviews](./interviews.md) - Schedule live interviews
- [Roles and Permissions](./roles-and-permissions.md) - Who can send, revoke and review submissions
- [File Manager](./file-manager.md) - Where submitted files count against your storage quota
