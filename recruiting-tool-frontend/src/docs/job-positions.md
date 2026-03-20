# Job Positions

**Route:** `/hr/job-positions`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Job Positions represent open roles in your company. They are the foundation for the entire hiring workflow — applications and hiring processes are always linked to a job position.

## Statuses

| Status | Meaning |
|--------|---------|
| `OPEN` | Active — visible on careers page, accepts applications |
| `CLOSED` | No longer accepting new candidates |
| `CANCELLED` | Cancelled position — archived |

## Stages (Hiring Pipeline Template)

Each job position has a **stages template** — an ordered list of steps a candidate goes through. Examples:
- Phone Screen
- Technical Interview
- Final Interview
- Offer

When you create a hiring process for a candidate, these stages are **copied** to that process. Each candidate has their own independent copy of the stages.

### Stage Fields
- **Title** — Name of the stage
- **Type** — Category (Interview, Assessment, etc.)
- **Estimated Time** — Duration in days
- **Position** — Order in the pipeline

## Careers Page

Job positions with status `OPEN` and visibility set to public are automatically listed at `/careers`. Candidates can apply directly from there.

## Detail Page

Clicking on a job position opens the detail page (`/hr/job-positions/:uid`) which shows:
- All active hiring processes for this position
- Candidate pipeline with current stage
- AI rankings for all candidates
- Stage-by-stage conversion metrics
