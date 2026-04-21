# Analytics

Guide to using the Analytics dashboard to measure recruiting performance and pipeline health.

## Overview

The Analytics page provides data-driven insight into your company's hiring activity. All metrics are calculated from live data and filtered to the date range you select.

**Navigate to Analytics:** Sidebar → **Analytics**, or go directly to `/hr/analytics`.

Analytics requires the `analyticsEnabled` feature flag, which is available on the **Professional** and **Enterprise** plans. If your company is on the Free plan, the Analytics page will not be accessible. See [Subscription and Limits](./subscription-and-limits.md) to upgrade.

## Date Range Filtering

At the top of the page, a date range picker controls which period all charts and metrics reflect. You can choose from the following presets:

- **Last 7 days** (default)
- **Last 30 days**
- **Last 90 days**
- **Last 12 months**
- **Custom** — pick any start and end date

When you switch presets, all metrics and charts update automatically. For a custom range, select both dates and the dashboard refreshes.

The selected period is displayed below the picker so you always know what window the data covers.

## Refresh Button

Click **Refresh** in the top-right corner to force a reload of all analytics data. A toast notification confirms that data has been refreshed. Use this if you have just created or updated records and want the metrics to reflect the latest state immediately.

## Dashboard Sections

### Overview Metrics

Five summary cards appear across the top of the dashboard:

| Metric | Description |
|--------|-------------|
| Total Applications | Number of new applications received within the selected period |
| Active Processes | Hiring processes currently in progress |
| Hired This Month | Candidates hired in the current calendar month |
| Avg. Time to Hire | Average number of days from process creation to hire |
| Time to First Interview | Average days elapsed before the first interview stage is reached |

### Hiring Metrics

#### Conversion Funnel

A visual funnel showing how candidates progress through the key stages of your pipeline:

1. Application → Screening
2. Screening → Interview
3. Interview → Offer
4. Offer → Hired

Each step shows the conversion rate as a percentage. A low conversion rate at any step can highlight where candidates are dropping out of your pipeline.

#### Hiring Trends Chart

A bar chart plotting the number of hires per time period within the selected date range. Use this to identify seasonal patterns or measure the impact of recruiting campaigns.

### Candidate Metrics

#### Source Distribution

A donut chart that breaks down candidates by the source through which they were found (LinkedIn, Job Board, Referral, Career Fair, Company Website, Other). The chart only renders when source data is available.

Use this section to evaluate which sourcing channels deliver the most candidates, then compare against hire rates to identify the most cost-effective sources.

## No Data State

If no hiring activity exists within the selected date range, the dashboard displays an empty state message. Try expanding the date range or checking that hiring processes have been created for the period.

## Permissions

| Action | USER | HR | ADMIN | SUPER_ADMIN |
|--------|------|----|-------|-------------|
| Access Analytics page | ❌ | ✅ | ✅ | ✅ |
| View all metrics and charts | ❌ | ✅ | ✅ | ✅ |

Analytics access also requires the plan-level `analyticsEnabled` feature flag to be active.

## Next Steps

- [Job Positions](./job-positions.md) - Understand what drives your pipeline data
- [Hiring Process](./hiring-process.md) - The source of hiring metrics
- [Subscription and Limits](./subscription-and-limits.md) - Upgrade to access Analytics
