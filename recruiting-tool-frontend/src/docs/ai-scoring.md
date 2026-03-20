# AI Scoring

**Access:** HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Borderless uses **Google Gemini AI** to automatically score and rank candidates based on their resume and the job requirements.

## How Scoring Works

1. Candidate must have a resume uploaded
2. Click **"Analyze"** or **"Re-analyze"** on a candidate
3. Gemini AI reads the resume and the job description
4. Returns a **score (0–100)** with a detailed breakdown:
   - Education match
   - Experience relevance
   - Skills alignment
   - Other criteria

## Where to Use It

- **Candidates page** — Score individual candidates
- **Hiring Processes page** — Score candidates from the grouped list view (sorted by score)
- **Job Position detail** — View all candidates ranked by AI score

## Batch Scoring

From the hiring processes view, you can score all candidates for a position at once using the batch analyze button.

## Score Display

| Score | Meaning |
|-------|---------|
| 80–100 | Strong match |
| 60–79 | Good match |
| 40–59 | Moderate match |
| 0–39 | Weak match |

Scores are displayed as colored chips (green/yellow/orange/red).

## AI Quota

Each score consumes **1 AI credit** from your company's monthly quota. Quota is based on subscription plan:

| Plan | Credits/Month |
|------|-------------|
| Free | Limited |
| Professional | Standard |
| Enterprise | High |

> SUPER_ADMIN can view and adjust quotas per company at `/admin/ai-quota`.

## Quota Visibility

Users can see their current AI usage in **Profile → Subscription** (`/profile/subscription`).
