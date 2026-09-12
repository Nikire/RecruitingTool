# Applications

Guide to the Applications inbox, where every application submitted through the public careers page arrives for review.

## Overview

When someone applies to one of your job postings, the application lands in the Applications inbox. From there you read the applicant's details, download their resume, record an internal review decision, and — when you want to take them forward — convert the application into a candidate with a full hiring process in one click.

**Navigate to Applications:** Sidebar → **Recruitment** → **Applications**, or go directly to `/hr/applications`. The page title is **Job Applications**.

An application is not a candidate. Until you accept it, it is just an inbound submission: it has no hiring process, no stages, and does not appear on the Candidates page.

## Who Can Open This Page

The Applications page checks your role itself, and shows an **Access Denied** panel to anyone outside the following roles:

| Role | Applications page |
|------|-------------------|
| HR | ✅ |
| COMPANY_OWNER | ✅ |
| ADMIN | ✅ |
| SUPER_ADMIN | ✅ |
| HR_MANAGER | ❌ Access Denied |
| RECRUITER | ❌ Access Denied |
| COMPANY_ADMIN | ❌ Access Denied |

The route itself (`/hr/applications`) admits HR_MANAGER, RECRUITER and COMPANY_ADMIN, and the API behind it would answer them — `GET /api/applications` allows RECRUITER and above for reading, and HR and above for writing. The block is in the page, not in the API. If you are an HR Manager or Company Admin and you see Access Denied here, that is the current behavior, not a misconfigured account.

## Filtering by Status

A single **Filter by Status** dropdown sits at the top of the page:

| Option | Shows |
|--------|-------|
| All Applications | Every application, any status (default) |
| Pending | Submitted, not yet reviewed |
| Reviewed | Read by your team, no decision recorded yet |
| Accepted | Converted into a candidate and hiring process |
| Rejected | Turned down |
| Archived | Set aside |

Note that **Archived** can be filtered for, but it is not one of the statuses you can set from the application detail dialog. See [Recording Your Review](#recording-your-review).

## Two Views: Grouped and Flat

A **Group by Position** switch sits above the list, on the right. It is **on by default**.

### Grouped by position (default)

Applications are collected under one collapsible section per job position, sorted alphabetically by job title. Applications that no longer point at a job position are collected in a final **No Job Position** group.

Each group header shows the job title and a chip with the number of applications in it. Click the header (or the chevron) to expand it. Groups start collapsed.

Inside an expanded group, each row shows:

- Applicant name
- Applicant email
- Status chip
- Applied date
- A **View** button

Pagination at the bottom of the page pages through **positions**, not applications — the "Positions per page" selector offers 5, 10, 25 and 50, and defaults to 10. Every application belonging to a position on the current page is loaded with it. Within a group, applications are ordered newest first.

### Flat table

Turn **Group by Position** off to get a single sortable table of every application, 25 rows per page, with these columns:

| Column | Notes |
|--------|-------|
| Applicant name | |
| Email | |
| Phone | Shows `-` when the applicant left it blank |
| Job position | With the company name underneath |
| Status | Colored chip |
| Applied date | Date and time |
| Actions | A view button; clicking anywhere on the row also opens the application |

A counter above the table shows how many applications the current filter matched.

## Reviewing an Application

Click **View** (grouped view) or any row (flat table) to open the application detail dialog. It shows, in order:

1. **Applicant information** — name, email, phone, applied date.
2. **Job position** — the posting applied to, with the company name.
3. **Resume** — the uploaded file name with a download button. Only shown when a resume was attached.
4. **Cover letter** — the applicant's text, in a scrollable box. Only shown when one was written.
5. **HR review** — the status selector and internal notes (see below).

Answers to a posting's custom application questions are stored with the application, but they are **not displayed in this dialog** — there is currently no screen in the product that renders them.

### Recording Your Review

The **HR Review** section holds two fields:

| Field | Notes |
|-------|-------|
| Status | Pending, Reviewed, Accepted or Rejected. **Archived is not offered here**, even though you can filter by it |
| Internal notes | Free text, visible only to your team — never to the applicant |

Click **Save Changes** to store them. The button stays disabled until you actually change something.

Once a review has been saved, a line under the notes records when it happened and who did it: *Reviewed on {date} by {name}*.

### Accept & Create

**Accept & Create** is the button that turns an application into real pipeline work. Pressing it:

1. Looks for a candidate in your company with the applicant's email address.
2. Creates that candidate if they do not exist, carrying over the source the applicant selected on the apply form.
3. Creates a hiring process titled *"{Job title} - {Candidate name}"*.
4. Copies the job position's stage template into that hiring process.
5. Sets the application status to **Accepted**.

The button disappears once the application is already Accepted, and accepting the same application twice is rejected by the API.

Candidate email addresses are unique per company, so accepting an application from someone already in your database attaches a new hiring process to the existing candidate rather than creating a duplicate.

### Deleting an Application

**Delete**, at the bottom left of the dialog, soft-deletes the application after a confirmation prompt. Use it for spam and duplicates; use **Rejected** for real applicants you are turning down, so the record and its notes survive for your audit trail.

## Where Applications Come From

Applications are created by the public apply form on a job posting. That endpoint is rate-limited to **5 submissions per hour per IP address**, which is the most common reason a legitimate applicant reports an error while trying to apply several times in a row.

Only postings that are **OPEN** *and* **approved by moderation** are visible on the public careers board, so a posting still waiting for approval receives no applications at all. See [Job Positions](./job-positions.md#public-careers-page).

## Permissions

| Action | RECRUITER | HR | HR_MANAGER | COMPANY_OWNER | COMPANY_ADMIN | ADMIN | SUPER_ADMIN |
|--------|-----------|----|------------|---------------|---------------|-------|-------------|
| Read applications (API) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update / accept / delete (API) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Open the Applications page | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |

Role thresholds on the API are read as "this role **and everything above it**", so `@Auth(['RECRUITER', …])` on the read endpoints means recruiters and up, and `@Auth(['HR', …])` on the write endpoints means HR and up.

Submitting an application requires no account at all.

## Troubleshooting

### The page says "Access Denied"

Your role is not one of HR, COMPANY_OWNER, ADMIN or SUPER_ADMIN. Ask a Company Owner to change your role from **Settings → Team**. See [Team Management](./team-management.md).

### An applicant says they applied but nothing appears

Check the status filter first — it persists while you stay on the page. Then confirm the posting they applied to belongs to your company and is not soft-deleted. Applications whose job position was deleted move to the **No Job Position** group rather than disappearing.

### "Application is already accepted"

The application was accepted earlier, possibly by a teammate. Open the Candidates page and search for the applicant's email; their candidate profile and hiring process already exist.

## Related

- [Candidates](./candidates.md) - What an accepted application becomes
- [Job Positions](./job-positions.md) - Publishing the postings applications arrive from
- [Hiring Process](./hiring-process.md) - The pipeline created when you accept
- [Team Management](./team-management.md) - Roles that can open this page
