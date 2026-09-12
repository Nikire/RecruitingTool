# Hiring Process Management

Complete guide to managing multi-stage hiring workflows for candidates.

## Overview

A hiring process tracks a specific candidate's application to a specific job position through multiple stages.

**Key Concepts:**
- **One hiring process** = One candidate + One job position
- **Stages** are copied from job position template
- **Progress tracking** through each stage
- **Collaboration** via stage notes and interviews

## Creating Hiring Processes

### Prerequisites

Before creating a hiring process:
1. Job position must exist
2. Candidate must exist
3. Candidate cannot have existing hiring process for that job

### Method 1: From Candidate Profile

1. Navigate to candidate detail page
2. Click **Create Hiring Process** button
3. Select job position from dropdown
4. Click **Create**

### Method 2: From Dashboard

1. Navigate to **Dashboard**
2. Click **Create Hiring Process** button
3. Select candidate from dropdown
4. Select job position from dropdown
5. Click **Create**

### Method 3: From Accepted Application

When you accept an application:
1. Navigate to **Recruitment → Applications**
2. Find application to accept
3. Click **Accept & Create**
4. System automatically creates:
   - Candidate profile (if doesn't exist)
   - Hiring process with stages from job template

### Auto-Generated Data

When a hiring process is created:
- **Title**: Auto-generated as "{Job Title} - {Candidate Name}"
- **Stages**: Copied from job position template
- **First Stage**: Automatically set to CURRENT
- **Status**: Set to IN_PROGRESS

## Hiring Process Status

### OPEN
- Hiring process created but not started
- Waiting for first action

### IN_PROGRESS
- Candidate actively progressing through stages
- Most common status

### CLOSED
- Hiring process completed
- Candidate was not selected

### CANCELLED
- Hiring process cancelled (job cancelled or candidate withdrew)

### REJECTED
- Candidate rejected during process

## Stage Management

### Anatomy of a Stage

A stage is more than a label on a timeline. Each one carries:

| Property | Notes |
|----------|-------|
| Title | Free text, e.g. "Technical Interview" |
| Type | One of 18 stage types (see below). Set on the job position's stage template |
| Description | What happens in this stage |
| Position | Its order in the pipeline |
| Status | OPEN, CURRENT, DONE or CANCELLED |
| Estimated time | Optional. Pre-fills the duration when you schedule an interview on this stage |
| Note | One stage note with free text and a star rating |
| Interviews | Any number of live interviews |
| Async submissions | Any number of things the candidate submits on their own time |

The last two matter most: **every stage carries both an interview block and an async block, whatever its type**. Nothing stops you from requesting a take-home submission on a stage typed FINAL_INTERVIEW, or scheduling a call on one typed TAKE_HOME_ASSIGNMENT. The type describes intent for your team; it does not restrict what you can do.

### Stage Types

The 18 types, grouped by how you would normally run them:

| Usually run live (schedule an interview) | Usually run asynchronously (request a submission) |
|------------------------------------------|----------------------------------------------------|
| PHONE_SCREEN | SCREENING |
| HR_INTERVIEW | CASE_STUDY |
| INTERVIEW | TAKE_HOME_ASSIGNMENT |
| TECHNICAL_INTERVIEW | SKILLS_ASSESSMENT |
| PANEL_INTERVIEW | PORTFOLIO_REVIEW |
| GROUP_INTERVIEW | BACKGROUND_CHECK |
| ONSITE_INTERVIEW | REFERENCE_CHECK |
| FINAL_INTERVIEW | |
| CULTURE_FIT | |
| SALARY_NEGOTIATION | |
| OFFER | |

That split is advice, not enforcement — see the note above. For what each type means, see [Job Positions](./job-positions.md#stage-templates), where stage templates are authored.

### Stage Status

Each stage has a status:
- **OPEN**: Not yet started
- **CURRENT**: Candidate is in this stage now
- **DONE**: Stage completed
- **CANCELLED**: Stage skipped or cancelled

### Viewing Stages

The hiring process detail page renders the stages as a vertical timeline. Each step on the timeline is a numbered circle colored by status, and each stage's body is an expandable accordion.

**The accordion header** carries a status icon, the stage title, and a note button on the right.

| Header element | Meaning |
|----------------|---------|
| Open padlock icon | The stage is CURRENT |
| Check circle icon | The stage is DONE |
| Closed, grayed-out padlock icon | The stage is OPEN or CANCELLED — not reached yet |
| Note button | Add or edit this stage's note. When a note with a rating already exists, the button shows it as ★ n |

The stage that is CURRENT is expanded by default; the others start collapsed.

**Inside an expanded stage** you always get two sections, in this order.

#### Interviews

The stage's description, then every interview booked on this stage, then the actions:

- **Schedule Interview** — opens the scheduling dialog. See [Interviews](./interviews.md#create-interview).
- **Send Booking Link** — only appears when booking is enabled in the **Calendar & Booking Settings** card, which lives both at **Settings → Calendar** (`/settings/calendar`) and on the Company Profile page. Instead of picking a time yourself, this creates a draft interview and emails the candidate a link to choose their own slot from your availability. After sending, a green confirmation names the address it went to — *"Booking link sent to {email}"* — with a **Copy link** action next to it so you can paste the same link into your own message if the email does not arrive.

If booking is not enabled, only **Schedule Interview** is shown.

Both actions are visible only to users who can manage resources (HR, Company Owner, Admin, Super Admin).

#### Async Submissions

Below the interviews, **Request Submission** opens the dialog that emails the candidate a link to upload files or write a response for this stage, with an optional deadline. Submissions appear in the panel underneath as they arrive. See [Async Stages](./async-stages.md).

### Moving Between Stages

**Progress to Next Stage:**
1. From hiring process detail page
2. Find current stage
3. Click **Move to Next Stage** button
4. Current stage marked as DONE
5. Next stage marked as CURRENT

**Skip Stage:**
1. Click on stage to skip
2. Click **Skip Stage** button
3. Stage marked as CANCELLED
4. Next stage becomes CURRENT

**Go Back to Previous Stage:**
1. Click on previous stage
2. Click **Reopen Stage** button
3. Stage marked as CURRENT again
4. Subsequent stages reset to OPEN

### Stage Notes

**Add Note to Stage:**
1. Expand the stage in the accordion
2. Click the note button on the stage header
3. Write your note and set a star rating
4. Click **Save**

A stage holds one note. Opening the note button again edits the existing note rather than adding a second one, and the rating you set is what shows on the header (★ n) and in the stage-notes panels on the Hiring Processes list and the Interviews page.

**Use Cases:**
- Interview feedback
- Candidate performance
- Reasons for moving forward/backward
- Red flags or concerns

## Interviews

Interviews are scheduled at the stage level.

**Schedule Interview:**
1. Navigate to stage detail
2. Click **Schedule Interview** button
3. Fill in interview details:
   - Date and time
   - Duration (minutes)
   - Meeting link (Zoom, Google Meet)
   - Notes/agenda
4. Click **Schedule**

**Interview Status:**
- **PENDING**: Not yet scheduled (no date/time)
- **SCHEDULED**: Date and time confirmed
- **COMPLETED**: Interview finished
- **CANCELLED**: Interview cancelled

See [Interviews Guide](./interviews.md) for complete interview management.

## Async Stage Submissions

Some stages require candidates to submit materials asynchronously (take-home tests, portfolios, written responses).

**Request a Submission:**
1. Expand the stage in the accordion.
2. In the **Async Submissions** section, click **Request Submission**.
3. Set an optional deadline.
4. Send the link — the candidate is emailed automatically.

**Review a Submission:**
- The panel updates when the candidate submits.
- Download files, read text responses, and add HR notes.
- Click **Mark as Reviewed** when done.

See [Async Stages Guide](./async-stages.md) for complete details.

## Group by Position

The Hiring Processes page offers two ways to view the list: a flat table and a grouped layout. The grouped layout is the default.

### Enabling the Group by Position Toggle

A toggle labeled **Group by Position** appears in the top-right area of the page, above the list. When enabled, all hiring processes are organized under collapsible sections, one section per job position. When disabled, processes are shown in a flat paginated table.

### How the Grouped Layout Works

Each job position appears as a header row showing:
- The job position title
- How many candidates have been AI-scored out of the total in that group
- The average AI score for that group (when at least one candidate has been scored)
- The total number of processes in the group

Click the header row (or the expand/collapse icon) to show or hide the candidates in that group.

Within an expanded group, each row shows the process title, candidate name and email, current status, active stage, AI score (if available), and action buttons.

### Sorting Within a Group

If one or more candidates in a group have been AI-scored, a sort icon appears on the group header. Click it to sort that group's rows by AI score from highest to lowest. Click again to return to the default order.

### Stage Notes Panel

Each process row in the grouped view includes a note icon. Click it to expand an inline panel that shows notes written for each stage of that process. Notes display the stage name, note content (up to three lines), and the star rating if one was given. This lets you review stage feedback without leaving the list.

## Hiring Process Details

**View Complete Process:**
1. Click on hiring process title
2. View:
   - Candidate information
   - Job position details
   - All stages with status
   - Interview history
   - Stage notes
   - Overall progress

**Edit Hiring Process:**
1. From detail page, click **Edit** button
2. Update:
   - Status
   - Title (if needed)
3. Save changes

**Delete Hiring Process:**
1. Click **Delete** button
2. Confirm deletion
3. Hiring process soft-deleted (preserved for audit)

## Collaboration Features

### Team Notes

- Add notes at hiring process level
- Add notes at stage level
- All team members can view all notes
- Track who wrote each note and when

### Interview Feedback

- Each interviewer records their assessment as a **stage note** with a star rating
- Every team member can read every stage note, with its author and timestamp
- The note icon on a row of the Hiring Processes list expands all of that candidate's stage notes at once, so a panel's views sit side by side

Structured scorecards with weighted criteria and an automatic consensus summary are **not available in the product** — the backend endpoints exist but nothing renders them. See [Interview Scorecards](./interviews.md#interview-scorecards--not-available-in-the-product).

### Activity Timeline

Track all actions:
- Hiring process created
- Stages progressed
- Interviews scheduled
- Notes added
- Status changes

## Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|-----|-------|-------------|
| View hiring processes | ✅ | ✅ | ✅ | ✅ |
| Create hiring process | ❌ | ✅ | ✅ | ✅ |
| Edit hiring process | ❌ | ✅ | ✅ | ✅ |
| Delete hiring process | ❌ | ✅ | ✅ | ✅ |
| Move between stages | ❌ | ✅ | ✅ | ✅ |
| Add stage notes | ✅ | ✅ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ✅ | ✅ |

## Best Practices

### Keep Stages Moving

- Progress candidates regularly
- Don't leave candidates in limbo
- Set reminders for stage deadlines

### Document Everything

- Add notes after every interview
- Document reasons for progression/rejection
- Record salary discussions

### Communicate with Candidates

- Keep candidates informed of progress
- Set expectations for timeline
- Provide feedback when possible

### Use Status Effectively

- Mark processes as CLOSED when decided
- Mark as REJECTED with reason in notes
- Keep IN_PROGRESS only for active candidates

## Troubleshooting

### Can't Create Hiring Process

**Issue**: "This candidate has already applied to this job position"

**Solution**: Each candidate can only have one hiring process per job. Check if hiring process already exists for this candidate-job combination.

### Stages Not Copied from Job

**Issue**: Hiring process created without stages

**Solution**: Ensure job position has stage templates defined. If job has no stages, hiring process will be created without stages. Add stages to job position and create new hiring process.

### Can't Move to Next Stage

**Issue**: "No next stage available"

**Solution**: You've reached the final stage. Change hiring process status to CLOSED or REJECTED to complete process.

## Next Steps

- [Interviews](./interviews.md) - Schedule and manage interviews
- [Job Positions](./job-positions.md) - Create job templates and stage templates
- [Candidates](./candidates.md) - Manage candidate profiles
- [Async Stages](./async-stages.md) - Stages candidates complete on their own time
- [AI Candidate Scoring](./ai-scoring.md) - The score chips on the grouped list
