# Email Templates

Complete guide to creating and managing custom email templates for automated candidate communications.

## Overview

Email templates let you customize every automated email sent to candidates and HR team members. Templates override the default Borderless branded emails with your own subject lines, body content, and dynamic variables.

**Where to find it:** **Settings → Email Templates**

Templates are defined at the company level. Every template supports Handlebars variables (e.g., `{{candidateName}}`) that are automatically replaced with real data when the email is sent.

---

## Template Types

Each template is tied to a specific event in the hiring workflow.

| Type | Triggered when |
|------|----------------|
| **Interview Scheduled** | An interview is scheduled for a candidate |
| **Stage Advancement** | A candidate moves to the next stage |
| **Application Status Update** | An application status changes |
| **Async Stage Invitation** | HR sends a submission request link |
| **Async Stage Submission Received** | A candidate submits async materials (sent to HR) |

---

## Creating a Template

1. Navigate to **Settings → Email Templates**.
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

Insert variables by clicking the chips in the editor, or type them directly into the subject or body.

| Variable | Description |
|----------|-------------|
| `{{candidateName}}` | Full name of the candidate |
| `{{jobTitle}}` | Job position title |
| `{{companyName}}` | Your company name |
| `{{newStage}}` | Stage the candidate moved to |
| `{{previousStage}}` | Stage the candidate moved from |
| `{{hiringProcessUrl}}` | Link to the candidate's hiring process page |
| `{{submissionUrl}}` | Secure link for async stage submission |
| `{{deadline}}` | Submission deadline (formatted date and time) |
| `{{stageName}}` | Name of the async stage |
| `{{hrName}}` | Name of the HR contact who triggered the email |
| `{{interviewDate}}` | Date of the scheduled interview |
| `{{meetingLink}}` | Video call link for the interview |

Variables that are not relevant to a template type will render as empty strings if used — stick to variables that match the template's context.

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
2. The system generates pre-filled templates for all five template types.
3. Existing templates are preserved — duplicate types are skipped.

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

| Action | HR Specialist | HR Manager | HR Admin |
|--------|:------------:|:----------:|:--------:|
| View templates | ✅ | ✅ | ✅ |
| Create template | ❌ | ✅ | ✅ |
| Edit template | ❌ | ✅ | ✅ |
| Delete template | ❌ | ❌ | ✅ |
| Set default template | ❌ | ✅ | ✅ |
| Create default templates (bulk) | ❌ | ✅ | ✅ |

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
- [Interviews](./interviews.md) - Schedule interviews (uses Interview Scheduled template)
- [Hiring Process](./hiring-process.md) - Manage stage advancement (uses Stage Advancement template)
