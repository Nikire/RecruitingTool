# Hiring Processes

**Route:** `/hr/hiring-processes`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

A Hiring Process represents the evaluation of a **specific candidate** for a **specific job position**. It's the core workflow object that tracks where a candidate is in the pipeline.

## How It Works

1. You create a hiring process linking a **candidate** + **job position**
2. The system copies the job position's stage template and creates individual stage instances
3. The first stage is set to `CURRENT`
4. You progress the candidate through stages as they advance
5. The process ends with status `CLOSED` (hired), `REJECTED`, or `CANCELLED`

> **Constraint:** Only one active hiring process per candidate per job position.

## Statuses

| Status | Meaning |
|--------|---------|
| `OPEN` | Just created, not started |
| `IN_PROGRESS` | Actively being evaluated |
| `CLOSED` | Candidate hired/process completed |
| `REJECTED` | Candidate rejected |
| `CANCELLED` | Process cancelled |

## Stage Statuses

| Status | Meaning |
|--------|---------|
| `CURRENT` | Active stage the candidate is in |
| `DONE` | Stage completed |
| `CANCELLED` | Stage skipped/cancelled |

## Stage Actions

From a hiring process, you can:
- **Schedule an interview** for the current stage
- **Add a stage note** — rate and describe the candidate's performance
- **Advance to next stage** — mark current stage as DONE, move to next
- **Reject the candidate** — end the process

## AI Scoring in Hiring Processes

The grouped list view shows AI scores per candidate (if scored). You can:
- **Analyze** — Score a candidate for the first time
- **Re-analyze** — Re-score an already-scored candidate
- Sort candidates by score to prioritize

> Only HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN can trigger scoring.
