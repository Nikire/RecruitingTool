# Email Templates

Complete guide to creating and managing custom email templates for automated candidate communications.

## Overview

Email templates let you customize every automated email sent to candidates and HR team members. Templates override the default Borderless branded emails with your own subject lines, body content, and dynamic variables.

**Where to find it:** **Email Templates** in the sidebar — a top-level item, not under Settings — or go directly to `/hr/email-templates`.

Templates are defined at the company level. Every template supports Handlebars variables (e.g., `{{candidateName}}`) that are automatically replaced with real data when the email is sent.

---

## Template Types

Each template is tied to a specific event in the hiring workflow. These are the eleven types the Email Templates page offers in the **Template Type** dropdown.

| Type | Sent to | Used when |
|------|---------|-----------|
| **Application Received** | Candidate | An application is submitted |
| **Application Under Review** | Candidate | An application moves into review |
| **Application Shortlisted** | Candidate | An application is shortlisted |
| **Application Rejected** | Candidate | An application is rejected |
| **Application Status Update** | Candidate | An application status changes and no more specific type applies |
| **Interview Invitation** | Candidate | A candidate is invited to interview |
| **Interview Reminder** | Candidate | An upcoming interview is approaching |
| **Offer Letter** | Candidate | An offer is extended |
| **Async Stage Invitation** | Candidate | HR sends a submission request link, and again for the deadline reminder |
| **Async Stage Submission Received** | Candidate | A candidate finishes an async submission |
| **Custom** | Candidate | Any ad-hoc message that does not fit the types above |

A twelfth type, `OUTREACH`, exists in the database enum and can be selected in the template editor, but outreach templates are **filtered out of the Email Templates list** — they are managed from the admin area at `/admin/outreach-templates`. A template you save as Outreach here will disappear from this page.

There is no "Interview Scheduled" or "Stage Advancement" template type.

---

## Creating a Template

1. Navigate to **Email Templates** (`/hr/email-templates`).
2. Click **Create Template**.
3. Fill in the form:
   - **Name**: Internal label to identify this template (not visible to candidates).
   - **Subject**: Email subject line. Supports variables such as `{{jobTitle}}`.
   - **Body**: Full email body. Write in plain text or HTML. Use variable chips to insert dynamic values.
4. Select the **Template Type** from the dropdown.
5. Click the variable chips below the body editor to insert dynamic placeholders at the cursor position.
6. Check **Set as Default** if you want this template to be used automatically for the selected type.
7. Click **Create**.

---

## Template Variables

Insert variables by clicking the chips in the editor, or type them directly into the subject or body. These fourteen chips are what the editor offers:

| Variable | Description |
|----------|-------------|
| `{{candidateName}}` | Full name of the candidate |
| `{{positionTitle}}` | Job position title |
| `{{companyName}}` | Your company name |
| `{{interviewerName}}` | Name of the HR contact who triggered the email |
| `{{meetingLink}}` | Video call link for the interview |
| `{{interviewDate}}` | Date of the scheduled interview |
| `{{interviewTime}}` | Time of the scheduled interview |
| `{{newStage}}` | Stage the candidate moved to |
| `{{previousStage}}` | Stage the candidate moved from |
| `{{status}}` | The new application status |
| `{{hiringProcessUrl}}` | Link to the candidate's hiring process page |
| `{{submissionUrl}}` | Secure link for async stage submission |
| `{{deadline}}` | Submission deadline (formatted date and time) |
| `{{stageName}}` | Name of the async stage |

Which variables are actually supplied depends on the event that sends the email, so a variable that does not apply to a template's context renders empty. Preview the template before making it the default.

The built-in default templates also use `{{jobTitle}}`, and the Custom template uses `{{message}}` — neither is offered as a chip, but both are substituted for the events that supply them.

---

## Setting a Default Template

Only **one template per type** can be the default at a time.

- Enabling **Set as Default** on a new template automatically removes the default flag from the previous one for that type.
- If no default template exists for a type, Borderless falls back to the built-in branded email.
- You can change the default at any time by editing a template and checking **Set as Default**.

---

## Creating Default Templates in Bulk

To quickly set up a complete template library:

1. Click **Create Default Templates** on the Email Templates page.
2. The system generates twelve pre-filled, branded HTML templates — one for each of the eleven types listed above, plus one Outreach template that stays hidden from this page.
3. Every generated template is created with **Set as Default** on.
4. Existing templates are preserved — a template whose name already exists for your company is skipped, so re-running the action is safe.

After generation, review and edit each template to match your company's tone and branding.

---

## Previewing a Template

Before activating a template, verify how it will look with real data:

1. Find the template in the list.
2. Click the **Preview** button.
3. The system renders the template with sample values substituted for all variables.
4. Review the subject line and body for formatting issues.

Preview does not send an email — it only shows a rendered view.

---

## Editing a Template

1. Find the template in the list.
2. Click the template name or the **Edit** button.
3. Update any field: name, subject, body, type, or default status.
4. Click **Save**.

Changes take effect immediately for all subsequent emails of that type.

---

## Deleting a Template

1. Click the **Delete** button on the template.
2. Confirm the deletion.

If you delete the active default template for a type, the system reverts to the built-in Borderless email for that type until a new default is set.

---

## Permissions

Everything on this page is served by `/api/email-templates`, guarded at the controller level with `@Auth(['HR', 'ADMIN'])`. The backend role guard reads that as **"HR and every role above HR"**, so the same set of roles gets every action — there is no read-only tier.

| Action | HR | HR_MANAGER | RECRUITER | COMPANY_ADMIN | COMPANY_OWNER | ADMIN | SUPER_ADMIN |
|--------|:--:|:----------:|:---------:|:-------------:|:-------------:|:-----:|:-----------:|
| Open `/hr/email-templates` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View templates | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create template | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit template | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete template | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Preview template | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create default templates (bulk) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |

A **RECRUITER** can open the page — the HR route group admits them — but every request is refused with 403, so the list never loads. See [Roles and Permissions](./roles-and-permissions.md).

---

## Best Practices

### Personalize Every Template

Use `{{candidateName}}` in every subject line and opening salutation. Personalized emails have higher open rates and make candidates feel valued.

**Example subject:** `Hi {{candidateName}}, your next step for {{jobTitle}} is ready`

### Keep Async Invitation Emails Clear

For **Async Stage Invitation** templates, always include:
- `{{submissionUrl}}` — the candidate cannot submit without this
- `{{deadline}}` — if a deadline is set, state it prominently
- `{{stageName}}` — so the candidate knows what is expected

### Mirror Your Brand Voice

Update the **Create Default Templates** output to match your company's tone before setting templates as default. Replace generic placeholder text with language that reflects how your team actually communicates.

### Test Before Activating

Use the **Preview** button to check rendering before marking a template as the default. Pay special attention to:
- Line breaks and spacing in the body
- Variable placeholders rendering correctly (no missing `{{}}` in the preview)
- Subject line length (keep under 60 characters for best deliverability)

---

## Next Steps

- [Async Stages](./async-stages.md) - Send submission requests to candidates
- [Interviews](./interviews.md) - Schedule interviews (uses the Interview Invitation and Interview Reminder templates)
- [Hiring Process](./hiring-process.md) - Manage stage advancement (uses the Application Status Update template)
- [Roles and Permissions](./roles-and-permissions.md) - Who can edit templates
