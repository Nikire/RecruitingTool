# Candidate Management

Learn how to effectively manage candidate profiles, track their progress, and collaborate with your team.

## Overview

Candidates are at the heart of your recruiting process. Each candidate profile contains:
- **Personal Information**: Name, email, phone, source
- **Resume/Documents**: Uploaded files (PDFs, DOCs)
- **Hiring Processes**: Associated job applications
- **Notes**: Team collaboration and feedback
- **Activity Log**: Timeline of all actions

## Creating Candidates

### Method 1: Manual Creation

1. Navigate to **Admin Panel** → **Candidates**
2. Click **Create Candidate** button
3. Fill in the form:
   - **Name** (required): Full name
   - **Email** (required): Must be unique
   - **Phone**: Contact number (optional)
   - **Source**: Where did you find this candidate?
     - LinkedIn
     - Job Board (Indeed, Glassdoor, etc.)
     - Referral
     - Career Fair
     - Company Website
     - Other
   - **Resume**: Upload PDF or DOC file (max 10MB)
4. Click **Create**

### Method 2: From Application

When an external applicant applies through the careers page:
1. Navigate to **Admin Panel** → **Applications**
2. Find the application
3. Click **Accept** button
4. System automatically creates candidate and hiring process

### Method 3: Bulk Import (Future Feature)

CSV import for multiple candidates.

## Candidate Profile

### Personal Information

**View/Edit:**
1. Click on candidate name to open detail page
2. Click **Edit** button
3. Update any field
4. Click **Save**

**Fields:**
- Name
- Email (unique, case-insensitive)
- Phone number
- Source (where they were found)
- Created date (auto-generated)
- Last updated (auto-generated)

### Resume and Documents

**Upload Files:**
1. From candidate detail page
2. Click **Upload File** button
3. Select file (PDF, DOC, DOCX, TXT)
4. Maximum file size: 10MB
5. Click **Upload**

**Download Files:**
1. View files list on candidate profile
2. Click file name to download
3. Files are stored securely in MinIO/S3

**Delete Files:**
1. Click delete icon next to file
2. Confirm deletion
3. File is permanently removed from storage

**Supported File Types:**
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Plain Text (.txt)

### Hiring Processes

**View Associated Hiring Processes:**
- All hiring processes for this candidate are listed
- Shows job position, status, and current stage
- Click to open hiring process detail

**Create New Hiring Process:**
1. Click **Create Hiring Process** button
2. Select job position
3. System checks if candidate has already applied to this job
4. If allowed, creates new hiring process with stages from job template

**Constraint:**
- One candidate can only have **one hiring process per job position**
- Prevents duplicate applications
- If candidate wants to reapply, must complete or close existing process first

## Candidate Notes

### Adding Notes

Notes enable team collaboration and documentation of candidate interactions.

**Create Note:**
1. From candidate detail page
2. Scroll to **Notes** section
3. Click **Add Note** button
4. Write your note in the text area
5. Click **Save**

**Note Information:**
- Author name (auto-populated)
- Timestamp (auto-generated)
- Note content (rich text supported)

### Viewing Notes

- All notes are displayed in chronological order (newest first)
- Each note shows:
  - Author name
  - Date and time
  - Note content

### Editing Notes

1. Click **Edit** icon on your own notes
2. Update content
3. Click **Save**

**Permissions:**
- You can only edit notes you created
- All team members can view all notes

### Deleting Notes

1. Click **Delete** icon on your own notes
2. Confirm deletion
3. Note is permanently removed

**Permissions:**
- You can only delete notes you created
- Admins can delete any note

### Note Best Practices

**What to Include:**
- Phone screen feedback
- Interview impressions
- Strengths and weaknesses
- Cultural fit observations
- Salary expectations discussed
- Red flags or concerns
- Next steps

**Example Note:**
```
Phone Screen - 12/01/2025

Strengths:
- 5 years React experience
- Strong communication skills
- Excited about the role

Concerns:
- Limited backend experience
- Salary expectations: $120k (our range: $90k-$110k)

Next Steps:
- Schedule technical interview
- Prepare React coding challenge
```

## Searching and Filtering Candidates

### Search Bar

1. Use search bar at top of candidates list
2. Search by:
   - Name
   - Email
   - Source

3. Results update in real-time as you type

### Filters

**Filter by Source:**
1. Click **Filter** button
2. Select source from dropdown
3. View candidates from that source only

**Filter by Status:**
1. Filter by hiring process status:
   - Active (in process)
   - Completed (hired or rejected)
   - No hiring process

**Sort Options:**
- Name (A-Z)
- Email (A-Z)
- Created date (newest/oldest)
- Last updated (most recent)

## Candidate Activity Log (Future Feature)

Track all actions taken on a candidate:
- Created date
- Hiring process created
- Interviews scheduled
- Notes added
- Stage progression
- Status changes
- File uploads

## Soft Delete and GDPR Compliance

### Soft Delete

**Delete Candidate:**
1. From candidate detail page
2. Click **Delete** button
3. Confirm deletion
4. Candidate is soft-deleted (not permanently removed)

**What Happens:**
- Candidate is hidden from lists
- Data is preserved for audit trail
- Can be restored by admin if needed

### GDPR Purge (Right to be Forgotten)

**Permanently Delete Candidate:**
1. Only accessible by **SUPER_ADMIN** role
2. Navigate to candidate detail
3. Click **Purge** button
4. Confirm permanent deletion
5. All associated data is permanently removed:
   - Candidate record
   - Hiring processes
   - Notes
   - Files (from storage)
   - Activity logs

**GDPR Compliance:**
- Complies with "right to be forgotten" requests
- Irreversible action
- Audit log created for compliance tracking

## Candidate Roles & Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|-----|-------|-------------|
| View candidates | ✅ | ✅ | ✅ | ✅ |
| Create candidate | ❌ | ✅ | ✅ | ✅ |
| Edit candidate | ❌ | ✅ | ✅ | ✅ |
| Delete candidate (soft) | ❌ | ✅ | ✅ | ✅ |
| Purge candidate (GDPR) | ❌ | ❌ | ❌ | ✅ |
| Add notes | ✅ | ✅ | ✅ | ✅ |
| Edit own notes | ✅ | ✅ | ✅ | ✅ |
| Delete own notes | ✅ | ✅ | ✅ | ✅ |
| Delete any notes | ❌ | ❌ | ✅ | ✅ |
| Upload files | ❌ | ✅ | ✅ | ✅ |
| Delete files | ❌ | ❌ | ✅ | ✅ |

## Tips & Best Practices

### Keep Profiles Updated

- Update candidate information as you learn more
- Add phone numbers after initial contact
- Update source if they came through multiple channels

### Document Everything

- Add notes after every interaction
- Include both positive and negative feedback
- Document salary discussions
- Note any special requirements or accommodations

### Organize Files

- Upload all relevant documents:
  - Resume/CV
  - Cover letter
  - Portfolio
  - Certifications
  - Writing samples
  - References
- Name files clearly: "JohnDoe_Resume_2025.pdf"

### Track Source Effectiveness

- Accurately track where candidates come from
- Analyze which sources yield the best hires
- Adjust recruiting strategy based on data

### Avoid Duplicate Candidates

- Search by email before creating new candidate
- System enforces unique emails (case-insensitive)
- If duplicate found, update existing candidate instead

## Integration with Other Features

### Hiring Process

- Each candidate can have multiple hiring processes (for different jobs)
- Hiring processes track progress through stages
- See [Hiring Process Guide](./hiring-process.md)

### Interviews

- Interviews are scheduled at the stage level
- View all candidate interviews from profile
- See [Interviews Guide](./interviews.md)

### Applications

- External applications are converted to candidates
- Application data is preserved
- See [Applications Guide](./applications.md) (future)

## Troubleshooting

### Can't Create Candidate

**Issue**: "A candidate with this email address already exists"

**Solution**: Email addresses must be unique (case-insensitive). Search for existing candidate by email and update that profile instead.

### Can't Delete Candidate

**Issue**: "Cannot delete candidate with active hiring processes"

**Solution**: Close or complete all hiring processes first, then delete candidate. Or use soft delete which preserves data.

### File Upload Failed

**Issue**: "Failed to upload file" or "File too large"

**Solution**:
- Check file size is under 10MB
- Ensure file type is PDF, DOC, DOCX, or TXT
- Verify storage service (MinIO) is running
- Check backend logs for detailed error

## Next Steps

- [Job Positions](./job-positions.md) - Create and manage job openings
- [Hiring Process](./hiring-process.md) - Track candidates through recruitment stages
- [Interviews](./interviews.md) - Schedule and manage interviews
