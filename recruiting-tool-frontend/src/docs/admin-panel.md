# Admin Panel

**Route:** `/admin`
**Access:** ADMIN, SUPER_ADMIN only

The Admin Panel is the platform-level control center for Borderless. HR users cannot reach this area.

## Dashboard (`/admin`)

Overall platform-wide statistics:
- Total users, companies, candidates
- Active hiring processes
- Recent system activity

## Companies (`/admin/companies`) — SUPER_ADMIN

View and manage every company on the platform:
- List all companies with their subscription status
- Drill into a company to see its users, positions and activity
- Edit company details when needed

## Users (`/admin/users`)

View every user across all companies:
- Filter by role, status, company
- Create new users manually
- View user activity logs
- Deactivate/reactivate users (SUPER_ADMIN only)

## Subscriptions (`/admin/subscriptions`)

View every company subscription:
- Current plan, status, billing dates
- MRR (Monthly Recurring Revenue) per company
- Filter by plan or status
- Summary statistics (total active, trialing, past due)

## AI Quota (`/admin/ai-quota`) — SUPER_ADMIN

Manage AI scoring quotas per company:
- Search for and select a company
- View its current AI usage (used / limit / remaining)
- Edit the monthly limit
- Set `-1` for unlimited

## Plan Limits (`/admin/plan-limits`)

Configure the feature limits for each subscription tier (Free, Professional, Enterprise):
- Maximum users
- Maximum job positions
- Maximum candidates per position
- Storage limits
- AI scoring credits per month
- Feature flags (email templates, analytics)

## Feature Flags (`/admin/feature-flags`)

Turn features on or off globally or per company:
- Enable/disable new features for a gradual rollout
- A/B testing support
- Takes effect immediately — no restart needed

## Custom Plans (`/admin/custom-plans`)

Create bespoke subscription tiers for specific companies:
- Custom pricing
- Custom feature allocation
- Overrides the standard plan limits

## General Settings (`/admin/general-settings`)

Platform-wide configuration:
- Email provider configuration
- System parameters
- Default values

## System Settings (`/admin/settings`)

Low-level system configuration:
- Database configuration
- Storage configuration
- Rate limiting
- Security parameters

## Deleted Records (`/admin/deleted-records`)

View and restore soft-deleted entities:
- Candidates, job positions, users, etc.
- Restore accidentally deleted records
- Delete permanently if needed

## Contact Messages (`/admin/contact-messages`)

Read submissions from the public `/contact` form:
- User feedback and questions
- Response tracking

## Webhooks (`/admin/webhooks`)

Configure outbound webhooks to external systems:
- Set destination URLs
- Choose which events to send
- Test webhook delivery
- Review delivery history and retry failed events
