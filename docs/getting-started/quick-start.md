# Quick Start Guide

Get up and running with Recruiting Tool in 5 minutes! This guide walks you through creating your first company, job position, and hiring process.

## Prerequisites

Before you begin, make sure you have:
- Completed the [Installation Guide](./installation.md)
- Docker containers running (`docker-compose ps`)
- Access to the application at http://localhost:3000

## Step 1: Login as Admin (30 seconds)

1. Open your browser and navigate to **http://localhost:3000**
2. Click **Login** button
3. Enter admin credentials (from your `.env` file):
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
4. Click **Sign In**

You'll be redirected to the dashboard.

## Step 2: Create Your Company (1 minute)

1. Click on **Admin Panel** in the sidebar (or navigate to `/admin`)
2. Click on **Companies** in the admin menu
3. Click the **Create Company** button
4. Fill in the company form:
   - **Name**: Your Company Name
   - **Description**: Brief description of your company
5. Click **Create**

Your company is now created! All job positions and candidates will be associated with this company.

## Step 3: Create Your First Job Position (1 minute)

1. Navigate to **Job Positions** page (from dashboard or sidebar)
2. Click **Create Job Position** button
3. Fill in the job details:
   - **Title**: e.g., "Senior Software Engineer"
   - **Description**: Job description and requirements
   - **Department**: e.g., "Engineering"
   - **Employment Type**: Full-time, Part-time, Contract, etc.
   - **Location**: Office location or "Remote"
   - **Salary Range**: Min and Max salary (optional)
   - **Required Skills**: List of required skills (optional)
   - **Status**: Set to **OPEN** to make it visible

4. **Add Hiring Stages** (optional but recommended):
   - Click **Add Stage** button
   - Create stages like:
     - Stage 1: Phone Screening
     - Stage 2: Technical Interview
     - Stage 3: Team Interview
     - Stage 4: Final Interview
     - Stage 5: Offer
   - Each stage can have:
     - **Title**: Stage name
     - **Type**: Interview type
     - **Description**: What happens in this stage
     - **Estimated Time**: Duration estimate

5. Click **Create Job Position**

Your job position is now created and visible on the public careers page!

## Step 4: View Your Job on the Careers Page (30 seconds)

1. Navigate to **Careers** page (public view)
   - URL: http://localhost:3000/careers
   - Or click **Careers** in the navbar

2. You should see your newly created job position listed
3. Click on the job title to view full details
4. Notice the **Apply** button (for external applicants)

## Step 5: Create a Candidate (1 minute)

1. Navigate to **Admin Panel** → **Candidates**
2. Click **Create Candidate** button
3. Fill in candidate information:
   - **Name**: John Doe
   - **Email**: johndoe@example.com
   - **Phone**: +1 234 567 8900 (optional)
   - **Source**: e.g., "LinkedIn", "Referral", "Job Board"
   - **Resume**: Upload a PDF resume (optional)

4. Click **Create**

The candidate profile is now created!

## Step 6: Create a Hiring Process (1 minute)

1. From the Candidate detail page, click **Create Hiring Process**
   - OR navigate to **Dashboard** → **Create Hiring Process**

2. Fill in the form:
   - **Candidate**: Select "John Doe" (from dropdown)
   - **Job Position**: Select your created job position
   - **Title**: Auto-generated as "{Job Title} - {Candidate Name}"
   - **Status**: Set to **IN_PROGRESS**

3. Click **Create**

A hiring process is now created with all the stages from your job position template!

## Step 7: Navigate Through Hiring Stages (1 minute)

1. From the Hiring Process detail page, you'll see all stages
2. The first stage is automatically marked as **CURRENT**
3. Click on a stage to:
   - View stage details
   - Add notes
   - Schedule an interview
   - Move candidate to next stage

**Stage Management:**
- **Current Stage**: The stage the candidate is currently in
- **Done**: Completed stages
- **Upcoming**: Future stages

4. Click **Move to Next Stage** button to progress the candidate

## Step 8: Schedule an Interview (Optional - 1 minute)

1. From a stage detail, click **Schedule Interview** button
2. Fill in interview details:
   - **Date**: Select interview date
   - **Time**: Select interview time
   - **Duration**: e.g., 60 minutes
   - **Meeting Link**: Zoom/Google Meet link (optional)
   - **Notes**: Interview notes or agenda

3. Click **Schedule**

An email notification will be sent to the candidate (if SendGrid is configured).

## Step 9: Add Candidate Notes (30 seconds)

1. Navigate to the Candidate detail page
2. Scroll to **Notes** section
3. Click **Add Note** button
4. Write your note (e.g., "Strong technical skills, good cultural fit")
5. Click **Save**

Notes are visible to your HR team and help with collaboration.

## Next Steps

Congratulations! You've completed the basic workflow. Now explore more features:

### Manage Applications

- Navigate to **Admin Panel** → **Applications**
- View applications submitted through the public careers page
- Review, accept, or reject applications
- Convert accepted applications to candidates and hiring processes

### Team Collaboration

- Navigate to **Admin Panel** → **Users**
- Create users for your HR team
- Assign roles:
  - **USER**: Basic access
  - **HR**: Can manage candidates and hiring processes
  - **ADMIN**: Full administrative access
  - **SUPER_ADMIN**: Can delete users and companies

### Analytics & Reporting

- Navigate to **Dashboard** to view:
  - Active hiring processes
  - Candidates by stage
  - Time-to-hire metrics
  - Application volume

### Email Templates

- Navigate to **Admin Panel** → **Email Templates** (if available)
- Customize email templates for:
  - Application confirmations
  - Interview invitations
  - Status updates

### Interview Scorecards

- Create scorecard templates for structured evaluations
- Add categories and criteria
- Submit scorecards after interviews
- View consensus reports across multiple interviewers

## Common Workflows

### Workflow 1: External Applicant

1. Applicant visits careers page
2. Clicks **Apply** on a job
3. Fills application form (name, email, resume)
4. Application submitted
5. HR reviews application in **Admin → Applications**
6. HR accepts application → Automatically creates candidate and hiring process
7. Candidate progresses through stages
8. HR makes hiring decision

### Workflow 2: Referral Candidate

1. HR creates candidate manually
2. HR creates hiring process
3. Candidate progresses through stages
4. HR schedules interviews
5. Team submits interview scorecards
6. HR makes hiring decision

### Workflow 3: Bulk Application Review

1. Navigate to **Admin → Applications**
2. Filter by job position
3. Review applications in batch
4. Accept promising candidates
5. Reject unsuitable candidates
6. All accepted candidates automatically enter hiring process

## Tips & Best Practices

### Job Position Templates

Create reusable stage templates for each job type:
- **Engineering Roles**: Phone screen → Technical → Team → Final
- **Sales Roles**: Phone screen → Sales demo → Team → Final
- **Support Roles**: Phone screen → Customer scenario → Team → Final

### Candidate Sourcing

Use the **Source** field to track where candidates come from:
- LinkedIn
- Job Boards (Indeed, Glassdoor)
- Referrals
- Career Fair
- Company Website

This helps analyze which sources yield the best candidates.

### Stage Notes

Add notes at each stage to document:
- Interview feedback
- Strengths and concerns
- Next steps
- Salary expectations

### Email Notifications

If SendGrid is configured:
- Candidates receive automatic notifications
- Interview invitations are sent automatically
- Status changes trigger emails

### File Organization

- Upload resumes and documents to candidate profiles
- Files are stored in MinIO (accessible from candidate detail page)
- Download files anytime for review

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Quick search (future feature)
- **Esc**: Close dialogs
- Navigate with arrow keys in lists

## Mobile Access

Recruiting Tool is responsive and works on mobile devices:
- Review candidates on the go
- Approve applications from your phone
- Check dashboard metrics
- Add quick notes

## Troubleshooting

### Can't Create Hiring Process

**Issue**: "This candidate has already applied to this job position"

**Solution**: Each candidate can only have one hiring process per job position. Check if a hiring process already exists.

### Stages Not Showing

**Issue**: Hiring process has no stages

**Solution**: Make sure your job position has stages defined. Stages are automatically copied when creating a hiring process.

### Email Not Sending

**Issue**: Interview notifications not being sent

**Solution**: Check SendGrid configuration in backend `.env`. See [Configuration Guide](./configuration.md#email-notification-configuration).

## Getting Help

- **User Guide**: [Complete feature documentation](../user-guide/candidates.md)
- **API Docs**: [API reference](../api/authentication.md)
- **Issues**: [GitHub Issues](https://github.com/Nikire/RecruitingTool/issues)

## What's Next?

Now that you're familiar with the basics, dive deeper:

- [Candidates Management](../user-guide/candidates.md)
- [Job Positions](../user-guide/job-positions.md)
- [Hiring Process](../user-guide/hiring-process.md)
- [Interviews](../user-guide/interviews.md)
- [Team Management](../user-guide/team-management.md)

Happy recruiting! 🚀
