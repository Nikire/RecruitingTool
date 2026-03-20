# Admin Panel

**Route:** `/admin`
**Access:** ADMIN, SUPER_ADMIN only

The Admin Panel is the platform-level control center for Borderless. HR users cannot access this area.

## Dashboard (`/admin`)

Overview statistics for the entire platform:
- Total users, companies, candidates
- Active hiring processes
- Recent system activity

## Companies (`/admin/companies`) — SUPER_ADMIN

View and manage all companies on the platform:
- List all companies with subscription status
- Click into a company to see its users, positions, and activity
- Edit company details if needed

## Users (`/admin/users`)

View all users across all companies:
- Filter by role, status, company
- Create new users manually
- View user activity logs
- Deactivate/reactivate users (SUPER_ADMIN only)

## Subscriptions (`/admin/subscriptions`)

View all company subscriptions:
- Current plan, status, billing dates
- MRR (Monthly Recurring Revenue) per company
- Filter by plan or status
- Summary statistics (total active, trialing, past due)

## AI Quota (`/admin/ai-quota`) — SUPER_ADMIN

Manage AI scoring quotas per company:
- Search and select a company
- View their current AI usage (used / limit / remaining)
- Edit the monthly limit
- Set to `-1` for unlimited

## Plan Limits (`/admin/plan-limits`)

Configure the feature limits for each subscription tier (Free, Professional, Enterprise):
- Max users
- Max job positions
- Max candidates per position
- Storage limits
- AI scoring credits per month
- Feature flags (email templates, analytics)

## Feature Flags (`/admin/feature-flags`)

Toggle features on/off globally or per company:
- Enable/disable new features for gradual rollout
- A/B testing support
- Instant effect — no restart needed

## Custom Plans (`/admin/custom-plans`)

Create custom subscription tiers for specific companies:
- Custom pricing
- Custom feature allocation
- Overrides standard plan limits

## General Settings (`/admin/general-settings`)

Platform-wide configuration:
- Email provider settings
- System parameters
- Default values

## System Settings (`/admin/settings`)

Low-level system configuration:
- Database settings
- Storage configuration
- Rate limiting
- Security parameters

## Deleted Records (`/admin/deleted-records`)

View and restore soft-deleted entities:
- Candidates, job positions, users, etc.
- Restore accidentally deleted records
- Permanently hard-delete if needed

## Contact Messages (`/admin/contact-messages`)

View submissions from the `/contact` public form:
- User feedback and inquiries
- Track responses

## Webhooks (`/admin/webhooks`)

Configure outbound webhooks to external systems:
- Set endpoint URLs
- Choose which events to send
- Test webhook delivery
- View delivery history and retry failed events
