# Candidates

**Route:** `/hr/candidates`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Candidates page is the central directory of every person in your recruiting pipeline. A candidate represents a person — not a specific application for a job position.

## What You Can Do

- **View every candidate** in your company database
- **Create a candidate** manually (name, email, phone)
- **Edit the candidate's** details
- **Delete a candidate** (soft delete)
- **Upload a resume/CV** (PDF, DOC, DOCX, TXT — 10 MB maximum)
- **Add notes** visible only to the HR team
- **View the activity timeline** with every action taken on a candidate
- **Score the candidate with AI** against a job position
- **Create a hiring process** straight from the candidate profile

## Candidate vs. Application

| Concept | Description |
|---------|-------------|
| **Candidate** | A person in your database — reusable across multiple positions |
| **Application** | A submission from the public careers page for a specific job |
| **Hiring process** | An active evaluation of a candidate for one specific job position |

> A candidate can have multiple hiring processes (for different positions), but only ONE per position at a time.

## AI Scoring

From a candidate profile you can click **"Score with AI"** to get an automated score powered by Google Gemini. The score (0–100) reflects how well the candidate's resume matches the role requirements.

> Requires an uploaded resume and consumes your company's AI quota.

## File Uploads

Supported formats: `PDF`, `DOC`, `DOCX`, `TXT`
Maximum size: `10 MB`

Files are stored securely in MinIO (S3 compatible). Links expire after a set period for security reasons.
