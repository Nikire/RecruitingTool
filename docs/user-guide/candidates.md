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

**Navigate to Candidates:** Sidebar → **Recruitment** → **Candidates**, or go directly to `/hr/candidates`.

The **Create Candidate** button at the top of the page opens a menu with three ways in:

| Menu option | Use it for |
|-------------|-----------|
| From Job Application | Turning an existing application into a candidate |
| Add Manually | Phone calls, referrals, walk-ins |
| Import from CSV | Bulk import from a spreadsheet |

### Method 1: Manual Creation

1. Navigate to **Recruitment** → **Candidates**
2. Click **Create Candidate** → **Add Manually**
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
1. Navigate to **Recruitment** → **Applications**
2. Find the application
3. Click **Accept & Create**
4. System automatically creates candidate and hiring process

See [Applications](./applications.md#accept--create) for what that button does in detail.

### Method 3: Bulk Import from CSV

Use this to load a list of candidates you already hold in a spreadsheet or another tool.

**Steps:**

1. Click **Create Candidate** → **Import from CSV**
2. Click **Download CSV Template** to get `candidate-import-template.csv`, pre-filled with the correct headers and two example rows
3. Fill in your rows and save the file as `.csv`
4. Click **Select CSV File** and choose it — the file is validated as soon as you pick it
5. Read the **Import Preview**, then click **Import Candidates**

**Template columns:**

| Column | Required | Rules |
|--------|----------|-------|
| `name` | Yes | Cannot be blank |
| `email` | Yes | Must contain `@`; must not already exist in your company |
| `phone` | No | At least 7 characters if present |
| `linkedin` | No | Must start with `http` or `https` if present |
| `notes` | No | Stored as the candidate's source details |

Headers are matched case-insensitively and values are trimmed, so trailing spaces from a spreadsheet export are harmless.

**The preview step:**

Before anything is written, the dialog reports **Total rows**, **Valid rows** and — if any failed — **Invalid rows**. Click **View Errors** to expand a table listing each bad row by its line number in the file (row 2 is the first data row), with the name, email and one chip per validation error. **Import Candidates** is disabled unless at least one row is valid.

**The result step:**

After importing, the dialog reports **Successfully imported** and, when relevant, **Failed to import**, followed by the same row-by-row error table. Rows that fail do not stop the rest of the import — valid rows are created and invalid ones are reported. If every row succeeded, the dialog closes itself after a moment.

Duplicate emails are the most common failure: a candidate whose email already exists in your company is reported as *"Candidate with email … already exists"* and skipped. Email uniqueness is scoped to your company, so the same address belonging to another company on the platform is not a conflict.

**What gets stored:**

Imported candidates are created with their name and email, a source of **CSV Import**, their `notes` column as the source details, and their `linkedin` column as the source URL. The `phone` column is validated but is **not** currently saved to the candidate record — add phone numbers from the candidate profile after importing if you need them.

## Candidate Profile

### Profile Layout

Clicking a candidate's name opens their profile at `/hr/candidates/:uid`. A header shows the candidate's details with an **Edit** button, and everything else is split across five tabs:

| Tab | Contents |
|-----|----------|
| Pipeline | Every hiring process this candidate is in, with each process's stages, when the candidate entered and left each one, and how long they spent there |
| Interviews | Every interview scheduled for this candidate, across all of their hiring processes |
| Notes | Team notes on the candidate, newest first |
| Activity | The automatic event timeline — see [Candidate Activity Log](#candidate-activity-log) |
| Files | Upload new files, and the list of files already attached |

The first tab is labeled **Pipeline**. **Back to Candidates** above the header returns you to the list.

Editing is done only through the **Edit** button in the header, which opens the same update dialog used elsewhere in the app — the tabs themselves are read-and-add surfaces, not edit forms.

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
2. Open the **Notes** tab
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

## Searching Candidates

### Search Bar

The Candidates page has a single filter bar with one control: a search box, placeholder *"Search by name or email..."*.

- It matches the candidate's **name** and **email address**, case-insensitively, on a partial match.
- It does **not** match source, phone number, notes or resume contents.
- The list pages back to page 1 whenever the search changes.
- **Clear Filters**, offered from the "no results" empty state, empties the box and restores the full list.

### Filters and Sorting Are Not Exposed

There is no source filter, no hiring-process status filter and no sort control on the Candidates page today. The list is returned newest-created first.

The API behind the list (`GET /api/candidate/list`) does accept `source`, `status`, `skills`, `startDate`, `endDate`, `sortBy` and `sortOrder` parameters, so these filters exist server-side — but nothing in the interface sets them. If you need that slicing today, use [Analytics](./analytics.md) or the public API.

## Candidate Activity Log

The **Activity** tab on the candidate profile shows an automatic, chronological timeline of what has happened to this candidate. You cannot write to it — every entry is recorded by the system as the event occurs.

**Events recorded:**

| Event | Recorded when |
|-------|---------------|
| Candidate Created | The candidate record is first created |
| Stage Changed | The candidate moves between stages in a hiring process |
| Status Changed | A hiring process status changes |
| Interview Scheduled | An interview is created for this candidate |
| Interview Updated | An existing interview is changed or rescheduled |
| Interview Cancelled | An interview is cancelled |
| Interview Completed | An interview is marked complete |
| Note Added | Someone adds a note |
| Application Received | An application from this person arrives |
| Email Sent | The system sends the candidate an email |

If nothing has happened yet, the tab reads *"No activity history yet"*.

File uploads are not part of this timeline — see the **Files** tab for what is currently attached.

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
- See [Applications Guide](./applications.md)

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
- [Applications](./applications.md) - Convert inbound applications into candidates
- [Hiring Process](./hiring-process.md) - Track candidates through recruitment stages
- [Interviews](./interviews.md) - Schedule and manage interviews
