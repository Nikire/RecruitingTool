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
1. Navigate to **Admin → Applications**
2. Find application to accept
3. Click **Accept** button
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

### Stage Status

Each stage has a status:
- **OPEN**: Not yet started
- **CURRENT**: Candidate is in this stage now
- **DONE**: Stage completed
- **CANCELLED**: Stage skipped or cancelled

### Viewing Stages

**Timeline View:**
- Visual representation of progress
- Shows completed, current, and upcoming stages
- Click on stage to view details

**Accordion View:**
- Expandable list of all stages
- View stage details, notes, and interviews
- Add notes to each stage

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
1. Open stage detail
2. Click **Add Note** button
3. Write note about stage progress
4. Click **Save**

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

- Multiple team members can submit scorecards
- View consensus summary across evaluators
- Identify areas of agreement/disagreement

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
- [Job Positions](./job-positions.md) - Create job templates
- [Candidates](./candidates.md) - Manage candidate profiles
