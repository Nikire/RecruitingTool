# AI Scoring

**Access:** HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Borderless uses **Google Gemini AI** to automatically score and rank candidates based on their resume and the role requirements.

## How Scoring Works

1. The candidate must have an uploaded resume
2. Click **"Analyze"** or **"Re-analyze"** on a candidate
3. Gemini AI reads the resume and the job description
4. It returns a **score (0–100)** with a detailed breakdown:
   - Education match
   - Experience relevance
   - Skills alignment
   - Other criteria

## Where to Use It

- **Candidates page** — Score individual candidates
- **Hiring Processes page** — Score candidates from the grouped list view (sorted by score)
- **Job Position detail** — See every candidate ranked by AI score

## Batch Scoring

From the hiring processes view you can score every candidate for a position at once using the batch analysis button.

## Score Display

| Score | Meaning |
|-------|---------|
| 80–100 | Strong match |
| 60–79 | Good match |
| 40–59 | Moderate match |
| 0–39 | Weak match |

Scores are shown as colored chips (green/yellow/orange/red).

## AI Quota

Every score consumes **1 AI credit** from your company's monthly quota. The quota depends on the subscription plan:

| Plan | Credits/Month |
|------|-------------|
| Free | Limited |
| Professional | Standard |
| Enterprise | High |

> SUPER_ADMIN can view and adjust per-company quotas at `/admin/ai-quota`.

## Quota Visibility

Users can see their current AI usage under **Profile → Subscription** (`/profile/subscription`).
