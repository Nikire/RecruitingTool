# Hiring Processes

**Route:** `/hr/hiring-processes`
**Access:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

A Hiring Process represents the evaluation of a **specific candidate** for a **specific job position**. It is the central workflow object that tracks where a candidate sits in the pipeline.

## How It Works

1. You create a hiring process by linking a **candidate** + **job position**
2. The system copies the position's stage template and creates individual instances of each stage
3. The first stage is set to `CURRENT`
4. You move the candidate through the stages as they progress
5. The process ends with the status `CLOSED` (hired), `REJECTED` or `CANCELLED`

> **Constraint:** There can only be one active hiring process per candidate per job position.

## Statuses

| Status | Meaning |
|--------|---------|
| `OPEN` | Just created, not started |
| `IN_PROGRESS` | Under active evaluation |
| `CLOSED` | Candidate hired / process completed |
| `REJECTED` | Candidate rejected |
| `CANCELLED` | Process cancelled |

## Stage Statuses

| Status | Meaning |
|--------|---------|
| `CURRENT` | Active stage the candidate is in |
| `DONE` | Completed stage |
| `CANCELLED` | Skipped / cancelled stage |

## Stage Actions

From a hiring process you can:
- **Schedule an interview** for the current stage
- **Add a stage note** — rate and describe the candidate's performance
- **Advance to the next stage** — mark the current stage as DONE and move on
- **Reject the candidate** — end the process

## AI Scoring in Hiring Processes

The grouped list view shows AI scores per candidate (if they have been scored). You can:
- **Analyze** — Score a candidate for the first time
- **Re-analyze** — Score an already scored candidate again
- Sort candidates by score to prioritize

> Only HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN can trigger scoring.
