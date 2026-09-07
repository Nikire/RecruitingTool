# Job Positions

**Route:** `/hr/job-positions`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Job Positions represent the open roles at your company. They are the foundation of the whole hiring flow — applications and hiring processes are always linked to a job position.

## Statuses

| Status | Meaning |
|--------|---------|
| `OPEN` | Active — visible on the careers page, accepting applications |
| `CLOSED` | No longer accepting new candidates |
| `CANCELLED` | Position cancelled — archived |

## Stages (Hiring Pipeline Template)

Every job position has a **stage template** — an ordered list of steps a candidate goes through. For example:
- Screening call
- Technical interview
- Final interview
- Offer

When you create a hiring process for a candidate, these stages are **copied** into that process. Every candidate gets their own independent copy of the stages.

### Stage Fields
- **Title** — Stage name
- **Type** — Category (Interview, Assessment, etc.)
- **Estimated time** — Duration in days
- **Position** — Order in the pipeline

## Careers Page

Job positions with the `OPEN` status and public visibility are automatically listed on `/careers`. Candidates can apply directly from there.

## Detail Page

Clicking a job position opens the detail page (`/hr/job-positions/:uid`), which shows:
- Every active hiring process for this position
- The candidate pipeline with the current stage
- AI rankings for all candidates
- Conversion metrics per stage
