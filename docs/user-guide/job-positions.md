# Job Position Management

Comprehensive guide to creating, managing, and publishing job positions.

## Overview

Job positions represent open roles your company is hiring for. Each job position includes:
- Job details (title, description, requirements)
- Stage templates for hiring workflow
- Applications from external candidates
- Associated hiring processes

## Job Position Quota Banner

At the top of the Job Positions page, a quota banner shows how many job positions your company has created relative to your plan's limit. The progress bar color changes as you approach the ceiling:

- **Green** — below 70% of the limit
- **Yellow** — between 70% and 90%
- **Red** — above 90% or limit exceeded

If you are on the Enterprise plan, the banner shows your current count without a limit. To increase your job position limit, upgrade at `/profile/subscription`. See [Subscription and Limits](./subscription-and-limits.md) for plan details.

## Creating Job Positions

**Navigate to Job Positions:** Sidebar → **Recruitment** → **Job Positions** (`/hr/job-positions`), then click **Create Job Position**.

The create dialog is grouped into collapsible sections. Only two things are mandatory: a **title** and at least **one stage**. Everything else is optional, and blank fields simply do not appear on the public posting.

There is **no status field on create** — every new posting starts as OPEN. Status is changed later from the edit dialog.

### Job Details

| Field | Type | Notes |
|-------|------|-------|
| Job Title | Text | Required |
| Description | Markdown editor | The body of the posting, up to 5,000 characters |
| Job Type | Choice | Full Time, Part Time, Contract, Internship, Temporary, Freelance |
| Experience Level | Choice | Entry Level, Mid Level, Senior Level, Lead, Executive |
| Education Level | Choice | High School, Associate Degree, Bachelor's Degree, Master's Degree, Doctorate, No Requirement |
| Work Location | Choice | Remote, On-site, Hybrid |
| Urgent Hiring | Switch | Off by default. When on, the posting is highlighted to candidates as urgent |

### Location

Location is three separate fields, not one free-text line:

| Field | Notes |
|-------|-------|
| City | |
| State / Province | |
| Country | |

**Work Location** (above) is what tells an applicant whether the role is remote; these three fields say where the role is based.

### Salary

| Field | Notes |
|-------|-------|
| Minimum Salary | Number |
| Maximum Salary | Number |
| Currency | USD, EUR, GBP, MXN, ARS or COP. Defaults to USD |
| Pay Period | Hourly, Monthly or Yearly |
| Show salary publicly | Switch, **off by default** |

**Show salary publicly** is the one to watch: with it off, you can record a salary band internally and applicants never see it. Turn it on and the range appears on the public posting.

### Requirements and Skills

**Requirements**, **Responsibilities** and **Skills** are chip lists — type an entry and press Enter (or click **Add**), and it becomes a removable chip. They are stored as lists rather than as one block of text.

### Benefits and Deadline

| Field | Notes |
|-------|-------|
| Benefits | Chip list, same behavior as above |
| Application Deadline | Date. Leave blank if there is no deadline |

### Custom Questions

At the bottom of the dialog you can add **custom application questions** that applicants must answer on the apply form. See [Custom Questions](#custom-questions-on-the-apply-form).

## Stage Templates

### Creating Stage Templates

Stages define your hiring workflow. When you create a hiring process from this job position, these stages are automatically copied.

**Add Stage:**
1. In job position form, scroll to **Stages** section
2. Click **Add Stage** button
3. Fill in stage details:
   - **Title**: e.g., "Phone Screening", "Technical Interview"
   - **Type**: INTERVIEW, TECHNICAL_INTERVIEW, FINAL_INTERVIEW, OFFER
   - **Description**: What happens in this stage
   - **Estimated Time**: Duration estimate (e.g., "1 week")
   - **Position**: Auto-numbered (0, 1, 2, ...)

**Stage Types:**

Borderless supports 18 stage types covering the full range of modern recruiting workflows:

| Stage Type | Typical Use |
|-----------|-------------|
| SCREENING | Initial application review |
| PHONE_SCREEN | Short introductory call |
| HR_INTERVIEW | Conversation with an HR team member |
| INTERVIEW | General-purpose interview |
| PANEL_INTERVIEW | Candidate interviewed by multiple people simultaneously |
| GROUP_INTERVIEW | Multiple candidates interviewed together |
| ONSITE_INTERVIEW | In-person interview at the company office |
| TECHNICAL_INTERVIEW | Technical questions or whiteboard exercise |
| FINAL_INTERVIEW | Last round, often with senior leadership |
| CASE_STUDY | Business or analytical case exercise |
| TAKE_HOME_ASSIGNMENT | Candidate completes work outside the interview setting |
| SKILLS_ASSESSMENT | Structured evaluation of a specific skill set |
| PORTFOLIO_REVIEW | Review of the candidate's past work or portfolio |
| CULTURE_FIT | Conversation focused on values and team fit |
| BACKGROUND_CHECK | Employment history and credential verification |
| REFERENCE_CHECK | Outreach to the candidate's listed references |
| SALARY_NEGOTIATION | Discussion of compensation terms |
| OFFER | Formal offer extended to the candidate |

Choose the type that best describes what happens in each stage. The type is shown in the hiring process timeline to help the whole team understand what each step involves.

**Example Workflow:**
```
1. Phone Screening (30 min)
2. Technical Interview (1 hour)
3. Team Interview (1 hour)
4. Final Interview with CTO (30 min)
5. Offer
```

### Editing Stage Templates

**Modify Stages:**
1. Edit job position
2. Update stage details
3. Changes only affect new hiring processes (not existing ones)

**Reorder Stages:**
- Stages are automatically ordered by position
- Edit position number to reorder

## Job Status

Every posting carries **two independent states**: a lifecycle status you control, and a moderation status the Borderless platform team controls. A posting reaches the public careers board only when both are right.

### Lifecycle Status

You set this from the edit dialog.

| Status | Effect |
|--------|--------|
| OPEN | Eligible for the public careers page and for new applications |
| CLOSED | Off the careers page, no longer accepting applications. Existing hiring processes continue |
| CANCELLED | Role no longer needed. Off the careers page; existing hiring processes can be closed |

New postings are created as OPEN.

### Moderation Status

This is the anti-spam gate on the public board and it is not yours to set.

| Moderation status | What it means |
|-------------------|---------------|
| PENDING_APPROVAL | Waiting for review. The posting is **not** on the public careers board |
| APPROVED | Cleared for publication |
| REJECTED | Blocked from publication, with a reason from the reviewer |

**How a posting is assigned a moderation status when you create it:**

- If your company has an **active paid subscription**, the posting is **APPROVED automatically** and is live as soon as you save it.
- Otherwise it starts at **PENDING_APPROVAL** and waits for a platform administrator to approve it.
- Postings created by a platform SUPER_ADMIN are approved automatically, because they are the reviewers.

The two states are independent: a posting can be APPROVED and CLOSED at the same time.

### Seeing Where Your Postings Stand

On the Job Positions list, any posting that is not APPROVED shows a moderation label next to its status chip. If you have one or more postings waiting, a banner appears above the list:

> **Waiting for review** — {n} of your postings are being reviewed by our team and are not on the public careers board yet.

If your company has no active paid subscription, the banner adds an upgrade prompt — *"Postings from paid plans publish instantly, with no review wait."* — with a **See plans** link to `/profile/subscription`.

Opening a rejected posting shows the same banner in its rejected form, with the reviewer's **Reason** spelled out so you know what to change before resubmitting.

Approval and rejection happen in the platform moderation queue at `/admin/job-moderation`, which only SUPER_ADMIN accounts can reach.

## Public Careers Page

### Publishing Jobs

A posting appears on the public careers board when **both** of the following are true:

1. Its lifecycle status is **OPEN**.
2. Its moderation status is **APPROVED**.

On a paid plan those happen together the moment you save. On the Free plan, a brand new OPEN posting stays invisible to the public until an administrator approves it — see [Moderation Status](#moderation-status) above. This is the single most common reason a new posting cannot be found on `/careers`.

### Where the Posting Appears

| Surface | URL |
|---------|-----|
| Platform-wide careers board | `/careers` |
| Your company's branded board | `/careers/company/{company-slug}` |
| The posting itself (canonical URL) | `/jobs/{company-slug}/{job-title-slug}-{uid}` |

The canonical job URL is the one to paste into an email or a social post: it carries your company name and the job title as readable text. Only the UID at the end is load-bearing — the slugs in front of it are decoration and are never used to look anything up, so a link still resolves if the title changes later.

The branded company board (`/careers/company/{slug}`) is the URL to put on your own website; it resolves by company name slug, with the company UID accepted as an unambiguous fallback.

### Applicant View

External candidates can:
- Browse open, approved positions
- View job details
- Click **Apply**
- Submit an application with a resume

### The Apply Form

An applicant fills in:

| Field | Required |
|-------|----------|
| Full name | Yes |
| Email address | Yes |
| Phone number | Yes |
| Resume | Upload |
| Cover letter | No |
| *How did you hear about this job?* | No |

The source question offers eleven options — Website, LinkedIn, Indeed, Glassdoor, Referral, Job Fair, University, Recruiter, Direct Application, Social Media and Other — plus a blank "prefer not to say". Whatever the applicant picks is carried onto the candidate record when you accept the application, which is what makes the Source Effectiveness report in [Analytics](./analytics.md) meaningful.

Application submissions are rate-limited to **5 per hour per IP address**.

### Custom Questions on the Apply Form

Each posting can carry its own extra questions, authored in the **Custom Questions** section of the create or edit dialog. Applicants answer them on the apply form, and questions you mark as required block submission until they are answered.

Answers are stored with the application. **They are not currently displayed anywhere in the HR interface** — the application detail dialog shows the applicant's details, resume and cover letter, but not their custom answers. Keep that in mind before relying on a custom question to make a screening decision.

### What Happens After Someone Applies

1. The application arrives in **Recruitment → Applications** (`/hr/applications`)
2. HR reviews it and records a status
3. **Accept & Create** converts it into a candidate plus a hiring process, with stages copied from this job position's template

See the [Applications guide](./applications.md) for the whole review workflow.

## Managing Job Positions

### Viewing All Jobs

**Job Positions List:**
- View all job positions
- Filter by status (Open, Closed, Cancelled)
- Search by title or department
- See application count for each job

### Editing Jobs

1. Click on job title to open detail
2. Click **Edit** button
3. Update any fields
4. Click **Save**

**Note**: Editing stage templates only affects new hiring processes.

### Closing Jobs

1. Open job position detail
2. Change status to **CLOSED**
3. Save

**Effect:**
- Removed from careers page
- No longer accepts applications
- Existing hiring processes continue normally

### Deleting Jobs

1. From job detail, click **Delete** button
2. Confirm deletion
3. Job is soft-deleted

**Soft Delete Behavior:**
- Job hidden from lists
- Associated hiring processes preserved (jobPositionId set to NULL)
- Applications preserved (jobPositionId set to NULL)
- Can be restored by admin if needed

## Analytics

**Job Position Metrics:**
- Total applications received
- Active hiring processes
- Average time-to-hire
- Conversion rate by stage
- Source effectiveness

Navigate to **Analytics** to view detailed reports.

## Job Position Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|-----|-------|-------------|
| View job positions | ✅ | ✅ | ✅ | ✅ |
| Create job position | ❌ | ✅ | ✅ | ✅ |
| Edit job position | ❌ | ✅ | ✅ | ✅ |
| Delete job position | ❌ | ✅ | ✅ | ✅ |
| View analytics | ❌ | ✅ | ✅ | ✅ |

## Best Practices

### Write Clear Job Descriptions

- Start with role summary
- List key responsibilities
- Define required qualifications
- Include nice-to-have skills
- Mention company culture and benefits
- Be specific about requirements

### Define Realistic Stage Templates

- Keep stages concise (4-6 stages ideal)
- Estimate realistic timeframes
- Include only necessary interview rounds
- Consider candidate experience

### Keep Jobs Updated

- Close jobs when filled
- Update descriptions as role evolves
- Review salary ranges periodically
- Remove outdated jobs

## Next Steps

- [Hiring Process](./hiring-process.md) - Track candidates through stages
- [Applications](./applications.md) - Review what the public posting brings in
- [Interviews](./interviews.md) - Schedule and manage interviews
- [Candidates](./candidates.md) - Manage candidate profiles
- [Subscription and Limits](./subscription-and-limits.md) - The job position quota and the paid-plan moderation shortcut
