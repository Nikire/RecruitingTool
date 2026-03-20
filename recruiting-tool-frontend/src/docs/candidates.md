# Candidates

**Route:** `/hr/candidates`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

The Candidates page is the central directory of all people in your recruiting pipeline. A candidate represents a person — not a specific application to a job position.

## What You Can Do

- **View all candidates** in your company's database
- **Create a candidate** manually (name, email, phone)
- **Edit candidate** details
- **Delete a candidate** (soft delete)
- **Upload a resume/CV** (PDF, DOC, DOCX, TXT — max 10MB)
- **Add notes** visible only to the HR team
- **View activity timeline** showing all actions taken on a candidate
- **AI score the candidate** against a job position
- **Create a hiring process** directly from the candidate profile

## Candidate vs Application

| Concept | Description |
|---------|-------------|
| **Candidate** | A person in your database — reusable across multiple positions |
| **Application** | A submission from the public careers page for a specific job |
| **Hiring Process** | An active evaluation of a candidate for a specific job position |

> A candidate can have multiple hiring processes (for different positions), but only ONE hiring process per position at a time.

## AI Scoring

From a candidate's profile, you can click **"Score with AI"** to get an automated scoring using Google Gemini. The score (0–100) reflects how well the candidate's resume matches the job requirements.

> Requires an uploaded resume and deducts from your company's AI quota.

## File Uploads

Supported formats: `PDF`, `DOC`, `DOCX`, `TXT`
Maximum size: `10 MB`

Files are stored securely in MinIO (S3-compatible). Links expire after a set period for security.
