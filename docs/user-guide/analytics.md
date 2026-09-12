# Analytics

Guide to using the Analytics dashboard to measure recruiting performance and pipeline health.

## Overview

The Analytics page provides data-driven insight into your company's hiring activity. All metrics are calculated from live data and filtered to the date range you select.

**Navigate to Analytics:** Sidebar → **Analytics**, or go directly to `/hr/analytics`.

Analytics is listed as a **Professional** and **Enterprise** plan feature via the `analyticsEnabled` plan flag. Note that neither the page nor the analytics API currently enforces that flag, so a Free-plan company can still open the page — but the plan entitlement is what the feature is sold under. See [Subscription and Limits](./subscription-and-limits.md).

## Date Range Filtering

A **Date Range** dropdown sits in the top-right of the page header. It controls the window every card, chart and table on the page reflects. There are exactly four options:

| Option | Window |
|--------|--------|
| Last 30 Days | 30 days back from today (default) |
| Last 90 Days | 90 days back from today |
| Last 6 Months | 180 days back from today |
| Last Year | 365 days back from today |

There is no 7-day preset and no custom start/end date picker. Changing the selection refetches every panel immediately.

## Data Freshness

There is no Refresh button. Analytics responses are cached for **10 minutes** on the server, and the browser treats them as fresh for the same 10 minutes, so a record you create right now will not move these numbers until the cache rolls over. This is deliberate — the queries are expensive and the metrics are not meant to be read second by second.

## Dashboard Sections

The dashboard is a single grid of six panels, in this order.

### Overview Metrics

Five summary cards across the top:

| Card | What it counts | Respects the date range? |
|------|----------------|--------------------------|
| Total Applications | Hiring processes created in the **current calendar month** | No |
| Hired This Month | Hiring processes closed in the **current calendar month** | No |
| Active Processes | Hiring processes currently OPEN or IN_PROGRESS | No |
| Avg. Time to Hire | Average days from process creation to close, rounded | Yes |
| Conversion Rate | Closed processes as a percentage of all processes in the window | Yes |

Two things to know before quoting these numbers:

- The first three cards are pinned to the **current calendar month** (or to "right now") and do **not** move when you change the date range. Only the last two follow it.
- "Hired" throughout this dashboard means a hiring process whose status is **CLOSED**. A process you closed because the candidate withdrew counts the same as one you closed with an offer accepted, so keep rejected candidates on REJECTED rather than CLOSED if you want these figures to mean what they say.

### Pipeline Funnel

A bar chart of how many candidates sit at each step of the pipeline — Application, Screening, Interview, Technical Interview, Final Interview, Offer, Hired — with the conversion rate between steps. Hover any bar for its exact count and conversion rate. The overall application-to-hire conversion is printed underneath.

A low conversion rate at one step is where candidates are dropping out.

The seven steps are fixed — they are not your own stage names. A process is counted at a step if its stage list contains a stage of that type, so a candidate counts toward "Technical Interview" as soon as the job's template gives them one, not when they actually reach it. Use [Stage Duration Bottleneck](#stage-duration-bottleneck) for progress that is actually measured.

### Applications by Source

A donut chart breaking applications down by the source the applicant selected on the apply form, with a table beside it listing each source, its count and its conversion rate. Renders an empty state when no source data exists.

Use it together with the Source Effectiveness table below: this chart says which channels deliver *volume*, the table says which deliver *hires*.

### Time to Hire Trend

A line chart of average time to hire over the selected window, with three figures above it:

| Figure | Meaning |
|--------|---------|
| Current Avg. | Average days to hire in the selected window |
| Prev. Period | The same measure over the immediately preceding window of equal length |
| Change | The difference between the two |

Hover a point for that period's average and the number of hires behind it.

### Stage Duration Bottleneck

A table showing how long candidates spend in each stage:

| Column | Meaning |
|--------|---------|
| Stage | Stage name |
| Average | Mean days spent in the stage |
| Median | Median days spent in the stage |
| Completed | How many candidates have finished the stage |

The slowest stage is flagged with a **Bottleneck** chip. Read the median alongside the average — a large gap between them means one or two stalled candidates are distorting the mean rather than the stage being slow for everyone.

### Source Effectiveness

A full-width table ranking your sourcing channels by outcome, not volume:

| Column | Meaning |
|--------|---------|
| Source | Where the applicant came from |
| Applications | Applications received from that source |
| Hires | Hires that came from that source |
| Success Rate | Hires divided by applications |
| Avg. Time to Hire | Average days to hire for that source |
| AI Quality Score | Average AI score of candidates from that source, when scores exist |

The AI Quality Score column only carries data for candidates you have scored — see [AI Candidate Scoring](./ai-scoring.md).

## Empty States

Each panel handles emptiness on its own rather than the page blanking out — you will see *"No pipeline data available"*, *"No source data available"*, *"No stage duration data available"*, *"No time-to-hire data available"* or *"No source effectiveness data available"* in the panel that has nothing to show. If several panels are empty at once, widen the date range or confirm hiring processes exist for the period.

## Permissions

Every analytics endpoint is declared `HR` and above, which on the role ladder means HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN. RECRUITER and USER accounts are refused.

| Action | USER | RECRUITER | HR and above |
|--------|------|-----------|--------------|
| Access Analytics page | ❌ | ❌ | ✅ |
| View all metrics and charts | ❌ | ❌ | ✅ |

## Next Steps

- [Job Positions](./job-positions.md) - Understand what drives your pipeline data
- [Hiring Process](./hiring-process.md) - The source of hiring metrics
- [Subscription and Limits](./subscription-and-limits.md) - Plans and feature entitlements
- [AI Candidate Scoring](./ai-scoring.md) - Where the AI Quality Score column comes from
