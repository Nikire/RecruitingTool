# AI Candidate Scoring

Guide to scoring candidates against a job position with AI, reading the scores, and tuning how they are calculated.

## Overview

Borderless can analyze a candidate's resume and notes against a job position's requirements and return a score from 0 to 100, broken into three dimensions: skills, experience and education. Scoring runs on Google Gemini, one candidate at a time, from the Hiring Processes page. Scores let you sort a shortlist by fit instead of by application date.

Scoring is never automatic. Nothing is scored until someone presses the button, and a score only exists for a specific candidate-and-position pair.

## Where Scoring Lives

Scoring is driven from the **Hiring Processes** page (`/hr/hiring-processes`) in its **grouped** layout, where every hiring process is filed under its job position. Expand a group to see the candidates in it.

### Scoring one candidate

Each row carries a sparkle icon at the AI score column. Click it to score that candidate against the group's job position. A spinner replaces the icon while the analysis runs; it takes several seconds, because the resume is read and analyzed in full.

When it finishes, the icon becomes a **score chip** showing the overall score. A toast confirms *"Candidate scored successfully"*.

### Re-scoring

A small refresh icon sits next to an existing score chip. Click it to run the analysis again — useful after a new resume is uploaded or stage evaluation notes have been added, because the analysis takes HR notes and ratings into account.

A re-score costs another credit, exactly like the first one.

### Reading the score chip

Hover the chip to see the three dimension scores: *Skills · Experience · Education*.

The chip is colored by tier:

| Overall score | Tier | Chip color |
|---------------|------|-----------|
| 85 – 100 | Excellent | Green |
| 70 – 84 | Good | Blue |
| 50 – 69 | Fair | Amber |
| 0 – 49 | Poor | Red |

Scores can legitimately be 0. The model is instructed not to treat any number as a floor, so a 0 means the candidate has no measurable match to the role.

### Group-level chips and sorting

Each job position group header shows, alongside the position title:

- **{n}/{total} scored** — how many candidates in that group have a score.
- **Avg: {n}** — the mean overall score across the scored candidates, colored by the same tier scale. Only appears once at least one candidate has been scored.
- A **sort icon**, which appears only once at least one candidate in the group has been scored. Click it to order that group's rows by overall score, highest first; click again to return to the default order.

## Configuring the Scoring Weights

The three dimensions are combined into the overall score using weights you control per company.

**Navigate to the weights:** Sidebar → **Settings** → **Company Profile** (`/hr/settings/company`), then find the **AI Scoring Weights** card.

The **Company Profile** item is only shown in the sidebar to Company Owners, although the page itself admits HR, HR_MANAGER, RECRUITER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN if you go to the URL directly.

| Slider | Default |
|--------|---------|
| Skills | 40% |
| Experience | 35% |
| Education | 25% |

A running **Total** is shown under the sliders. It turns red and a warning appears — *"Weights must sum to 100"* — whenever the three values do not add up to exactly 100, and **Save Weights** stays disabled until they do. The API enforces the same rule, so a sum of 99 or 101 is rejected server-side too.

New weights apply to the next scoring run. Existing scores are not recalculated.

## Plans, Credits and Limits

Scoring consumes one **AI scoring credit** per run, tracked per company under the `CANDIDATE_SCORING` quota. The counter resets on the first day of each month.

| Plan | AI scoring credits per month |
|------|------------------------------|
| Free | 0 — scoring is not available |
| Professional | 200 |
| Enterprise | Unlimited |

On the Free plan the credit allowance is zero, so every scoring attempt fails immediately with *"AI scoring quota exceeded for this month"*. There is no separate "AI is disabled" message — an exhausted allowance and an unavailable plan produce the same error.

A quota banner at the top of the Hiring Processes page shows your AI scoring credits used against your limit, green below 70%, amber to 90%, red above. Enterprise accounts see the used figure with no bar.

Two further limits apply:

| Limit | Value |
|-------|-------|
| Scoring requests | 10 per hour per IP address |
| Gemini configuration | Scoring returns a server error if the backend has no `GEMINI_API_KEY` set |

## Who Can Trigger Scoring

The sparkle and refresh icons are shown only to these roles:

| Role | Can trigger scoring from the UI |
|------|---------------------------------|
| HR_MANAGER | ✅ |
| COMPANY_OWNER | ✅ |
| ADMIN | ✅ |
| SUPER_ADMIN | ✅ |
| HR | ❌ (the API would allow it; the button is not rendered) |
| RECRUITER | ❌ |

Everyone who can see the Hiring Processes page can *read* an existing score; only the roles above can create one. Users without scoring rights see *"Not scored"* where the button would be.

## What Is Not Available in the Product

The backend carries more AI capability than the interface exposes. None of the following is reachable from any screen today:

| Backend capability | Endpoint | Status in the product |
|--------------------|----------|-----------------------|
| Batch scoring a whole position | `POST /api/ai/batch-score` and its status, results and cancel routes | No UI. No page calls it |
| Side-by-side candidate comparison | `POST /api/ai/compare-candidates` | `CompareCandidatesDialog` is written and exported, but no route or page mounts it |
| Resume parsing into structured fields | `POST /api/ai/parse-resume` | No UI. Nothing in the frontend calls it |

Treat these as backend-only for now. They are documented here so that seeing them in the API reference does not read as a missing button.

## Troubleshooting

### "AI scoring quota exceeded for this month"

You have used every credit in your monthly allowance, or you are on the Free plan, which has none. Upgrade at `/profile/subscription` or wait for the first of the month.

### The sparkle icon is missing on every row

Either your role does not permit scoring (see the table above), or the group has no job position attached — a score is always against a specific posting, so processes without one cannot be scored.

### Scoring fails with a server error

The backend needs a Gemini API key. Ask your administrator to confirm `GEMINI_API_KEY` is set; without it the service logs *"Gemini API key not configured"* on startup and every scoring call fails.

### Too many requests

Scoring is capped at 10 requests per hour per IP. Wait for the window to roll over before trying again.

## Related

- [Hiring Process](./hiring-process.md) - Where scores are displayed and sorted
- [Subscription and Limits](./subscription-and-limits.md) - Plans, quotas and quota banners
- [Candidates](./candidates.md) - Resumes and notes the analysis reads
- [Job Positions](./job-positions.md) - Requirements and skills the analysis scores against
