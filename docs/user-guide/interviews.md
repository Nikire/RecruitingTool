# Interview Management

Complete guide to scheduling, conducting, and evaluating interviews.

## Overview

Interviews are scheduled at the stage level within a hiring process. Features include:
- Interview scheduling with date/time
- Meeting link integration (Zoom, Google Meet)
- Email notifications to candidates
- Interview scorecards for structured evaluations
- Consensus reports across multiple interviewers

## Scheduling Interviews

### Create Interview

1. Navigate to hiring process detail page
2. Find the stage where interview should be scheduled
3. Click **Schedule Interview** button
4. Fill in interview form:
   - **Scheduled Date** (optional): Select date
   - **Scheduled Time** (optional): Select time (HH:mm format)
   - **Duration** (optional): Minutes (e.g., 60 for 1 hour)
   - **Meeting Link** (optional): Zoom, Google Meet, Teams link
   - **Notes** (optional): Interview agenda or special instructions

5. Click **Schedule**

### Interview Status

Automatically determined based on date/time:
- **PENDING**: No date or time set (placeholder interview)
- **SCHEDULED**: Both date and time provided
- **COMPLETED**: Interview finished (manually marked)
- **CANCELLED**: Interview cancelled

### Email Notifications

When interview is scheduled (date and time provided):
- Candidate receives email notification automatically
- Email includes:
  - Interview date and time
  - Meeting link (if provided)
  - Job position title
  - Company name
  - HR contact information

**Prerequisites:**
- SendGrid must be configured (see [Configuration Guide](../getting-started/configuration.md))
- Candidate must have valid email address

## Managing Interviews

### View All Interviews

**From Stage:**
1. Navigate to hiring process
2. Click on stage
3. View all interviews scheduled for that stage

**From Interview List (Future):**
- Upcoming interviews across all hiring processes
- Filter by status, date, interviewer

### Update Interview

1. From interview detail or stage view
2. Click **Edit** or **Reschedule** button
3. Update any field:
   - Date/time
   - Duration
   - Meeting link
   - Notes
   - Status
4. Click **Save**

**Auto-status update:**
- If you add date and time, status automatically changes to SCHEDULED
- New email notification sent to candidate

### Cancel Interview

1. Find interview in stage view
2. Click **Cancel** button
3. Confirm cancellation
4. Interview status set to CANCELLED
5. Cancellation email sent to candidate

### Complete Interview

1. After interview is finished
2. Mark interview as **COMPLETED**
3. Optionally add notes about outcome
4. Submit scorecard for structured feedback

## Interview Scorecards

Scorecards provide structured evaluation framework for interviews.

### Scorecard Templates

**Admins create templates with:**
- **Categories**: e.g., Technical Skills, Communication, Cultural Fit
- **Criteria**: Specific evaluation points within each category
- **Scoring**: Max score per criterion (e.g., 1-5 scale)
- **Weights**: Category importance (total 100%)

**Example Template:**
```
Technical Skills (40% weight)
- Programming proficiency (max 5 points)
- Problem-solving (max 5 points)
- System design (max 5 points)

Communication (30% weight)
- Clarity of explanation (max 5 points)
- Listening skills (max 5 points)

Cultural Fit (30% weight)
- Team collaboration (max 5 points)
- Company values alignment (max 5 points)
```

### Submitting Scorecard

1. After interview is completed
2. Click **Submit Scorecard** button
3. Select scorecard template
4. Rate each criterion (1 to max score)
5. Add notes for each criterion (optional)
6. Overall notes (optional)
7. Click **Submit**

**Calculation:**
- Overall score = Weighted average across all categories
- Category score = Average of criteria scores within category
- Final score = Sum of (Category score × Category weight)

### Viewing Scorecards

**Individual Scorecard:**
1. View interview detail
2. See all submitted scorecards
3. Click on scorecard to view full evaluation

**Consensus Summary:**
1. After multiple team members submit scorecards
2. Click **View Consensus** button
3. See aggregated report:
   - Average overall score across evaluators
   - Average score per category
   - Variance (areas of disagreement)
   - High-variance items flagged for discussion
   - Individual evaluator summaries

### Scorecard Best Practices

**Before Interview:**
- Review scorecard template
- Prepare questions aligned with criteria
- Understand scoring scale

**During Interview:**
- Take notes on each criterion
- Observe specific examples for each area
- Don't rely on memory alone

**After Interview:**
- Submit scorecard within 24 hours
- Provide specific examples in notes
- Be honest and objective

## Interview Types

### Phone Screening

- **Duration**: 20-30 minutes
- **Purpose**: Initial qualification check
- **Scorecard**: Basic screening criteria
- **Interviewer**: HR or Recruiter

### Technical Interview

- **Duration**: 60-90 minutes
- **Purpose**: Assess technical skills
- **Scorecard**: Technical proficiency criteria
- **Interviewer**: Senior engineers or tech lead

### Team Interview

- **Duration**: 30-60 minutes
- **Purpose**: Cultural fit and team compatibility
- **Scorecard**: Soft skills and collaboration criteria
- **Interviewer**: Future teammates

### Final Interview

- **Duration**: 30-45 minutes
- **Purpose**: Executive approval and final questions
- **Scorecard**: Leadership assessment criteria
- **Interviewer**: VP, Director, or C-level

## Meeting Link Integration

### Zoom Integration

Paste Zoom meeting link directly:
```
https://zoom.us/j/1234567890?pwd=xxxxx
```

### Google Meet

Paste Google Meet link:
```
https://meet.google.com/xxx-xxxx-xxx
```

### Microsoft Teams

Paste Teams meeting link:
```
https://teams.microsoft.com/l/meetup-join/...
```

### Custom Video Platform

Any video conferencing link works!

## Rescheduling Interviews

### Reschedule Process

1. Open interview detail
2. Click **Reschedule** button
3. Update date/time
4. Add reason for reschedule (optional)
5. Click **Save**

**Reschedule History:**
- All reschedule actions are logged
- Track how many times interview was rescheduled
- View reschedule reasons

**Email Notification:**
- Candidate receives updated interview details
- Includes new date/time and meeting link

## Interview Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|-----|-------|-------------|
| View interviews | ✅ | ✅ | ✅ | ✅ |
| Schedule interview | ❌ | ✅ | ✅ | ✅ |
| Edit interview | ❌ | ✅ | ✅ | ✅ |
| Cancel interview | ❌ | ✅ | ✅ | ✅ |
| Delete interview | ❌ | ❌ | ✅ | ✅ |
| Submit scorecard | ✅ | ✅ | ✅ | ✅ |
| View scorecards | ❌ | ✅ | ✅ | ✅ |
| View consensus | ❌ | ✅ | ✅ | ✅ |

## Best Practices

### Scheduling

- Schedule at least 1-2 days in advance
- Confirm candidate availability first
- Send calendar invites separately if needed
- Include timezone in meeting details

### Interview Preparation

- Review candidate resume before interview
- Prepare questions aligned with scorecard
- Test meeting link before interview
- Have backup communication method

### Conducting Interviews

- Start on time
- Follow structured format (scorecard criteria)
- Take detailed notes
- Leave time for candidate questions
- Explain next steps at end

### Post-Interview

- Submit scorecard within 24 hours
- Debrief with team if panel interview
- Make timely hiring decisions
- Communicate outcome to candidate

## Troubleshooting

### Email Not Sent

**Issue**: Interview scheduled but candidate didn't receive email

**Solution**:
- Check SendGrid configuration in backend .env
- Verify candidate email is valid
- Check email service health: `GET /api/health/email`
- Review backend logs for email errors

### Can't Schedule Interview

**Issue**: Schedule button disabled or not visible

**Solution**:
- Ensure you have HR, ADMIN, or SUPER_ADMIN role
- Verify stage exists in hiring process
- Check that hiring process status is IN_PROGRESS

### Scorecard Not Submitting

**Issue**: Form validation errors or submission fails

**Solution**:
- Ensure all criteria are rated (no blank scores)
- Verify scores are within valid range (1 to max)
- Check that template is active
- Review backend logs for validation errors

## Next Steps

- [Hiring Process](./hiring-process.md) - Manage multi-stage workflows
- [Team Management](./team-management.md) - Assign interviewers and roles
- [Candidates](./candidates.md) - View candidate profiles
