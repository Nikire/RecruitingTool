# Job Position Management

Comprehensive guide to creating, managing, and publishing job positions.

## Overview

Job positions represent open roles your company is hiring for. Each job position includes:
- Job details (title, description, requirements)
- Stage templates for hiring workflow
- Applications from external candidates
- Associated hiring processes

## Creating Job Positions

**Navigate to Job Positions:**
1. From dashboard or sidebar, click **Job Positions**
2. Click **Create Job Position** button

**Required Fields:**
- **Title**: Job position name (e.g., "Senior Software Engineer")
- **Description**: Full job description, requirements, responsibilities
- **Status**: OPEN, CLOSED, or CANCELLED

**Optional Fields:**
- **Department**: Engineering, Sales, Marketing, etc.
- **Employment Type**: Full-time, Part-time, Contract, Internship
- **Location**: Office location or "Remote"
- **Salary Range**: Min and max salary
- **Required Skills**: Comma-separated list
- **Benefits**: Company benefits description
- **Application Deadline**: Last date to apply

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
- **INTERVIEW**: General interview
- **TECHNICAL_INTERVIEW**: Technical assessment
- **FINAL_INTERVIEW**: Final round with leadership
- **OFFER**: Offer extended

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

### OPEN
- Visible on public careers page
- Accepts new applications
- Active for external candidates

### CLOSED
- Not visible on public careers page
- No longer accepting applications
- Existing hiring processes continue

### CANCELLED
- Job is no longer needed
- Existing hiring processes can be closed
- Hidden from careers page

## Public Careers Page

### Publishing Jobs

1. Set status to **OPEN**
2. Save job position
3. Job appears on public careers page: `/careers`

### Applicant View

External candidates can:
- Browse all open positions
- View job details
- Click **Apply** button
- Submit application with resume

### Application Process

1. Applicant fills form (name, email, phone, resume, cover letter)
2. Application submitted
3. HR reviews in **Admin → Applications**
4. HR accepts/rejects application
5. Accepted applications auto-create candidate and hiring process

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
- [Interviews](./interviews.md) - Schedule and manage interviews
- [Candidates](./candidates.md) - Manage candidate profiles
