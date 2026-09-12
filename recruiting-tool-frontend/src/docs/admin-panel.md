# Admin Panel

**Route:** `/admin`
**Access:** ADMIN, SUPER_ADMIN only

The Admin Panel is the platform-level control center for Borderless. HR users cannot reach this area. From here you run the whole platform: every company and user, subscriptions and quotas, the job-posting moderation queue, the sales CRM and outreach campaigns, and the platform-wide reporting dashboards.

---

## How access works

Three separate checks decide what you can see. They do not always agree, so it is worth knowing all three.

1. **The route guard** (`App.tsx`) admits both `ADMIN` and `SUPER_ADMIN` to every `/admin/*` route.
2. **The sidebar** (`AdminLayout.tsx`) hides the SUPER_ADMIN-only entries from an ADMIN, so an ADMIN simply never sees those menu items.
3. **The page itself** may check your role again. Companies, Users, Plan Limits, Feature Flags, General Settings, Webhooks & API Keys, Custom Plans and Settings all render an **Access Denied** panel for a non-SUPER_ADMIN who reaches them by typing the URL.

On the backend the role list is a ladder, not a set: `@Auth(['ADMIN'])` means "ADMIN and anything above it", so SUPER_ADMIN passes too. `@Auth(['SUPER_ADMIN'])` is the only truly exclusive gate.

---

## Navigation map

The sidebar groups the 29 pages as follows.

| Group                 | Page                | Route                         | Required role |
| --------------------- | ------------------- | ----------------------------- | ------------- |
| —                     | Dashboard           | `/admin`                      | ADMIN         |
| Outreach              | Prospect CRM        | `/admin/outreach-crm`         | ADMIN         |
| Outreach              | Outreach Templates  | `/admin/outreach-templates`   | ADMIN         |
| Outreach              | Outreach Campaigns  | `/admin/outreach-campaigns`   | ADMIN         |
| Management            | Companies           | `/admin/companies`            | SUPER_ADMIN   |
| Management            | Users               | `/admin/users`                | SUPER_ADMIN   |
| Management            | Subscriptions       | `/admin/subscriptions`        | ADMIN         |
| Management            | Deleted Records     | `/admin/deleted-records`      | ADMIN         |
| Management            | Contact Messages    | `/admin/contact-messages`     | ADMIN         |
| Management            | Email Logs          | `/admin/email-logs`           | SUPER_ADMIN   |
| Business Intelligence | Revenue Dashboard   | `/admin/revenue`              | ADMIN         |
| Business Intelligence | Quota Inspector     | `/admin/quota-inspector`      | ADMIN         |
| Business Intelligence | Company Health      | `/admin/health`               | ADMIN         |
| Business Intelligence | Trial Tracker       | `/admin/trials`               | ADMIN         |
| Business Intelligence | Pipeline Analytics  | `/admin/pipeline-analytics`   | ADMIN         |
| Operations            | Job Moderation      | `/admin/job-moderation`       | SUPER_ADMIN   |
| Operations            | Demo Bookings       | `/admin/demos`                | ADMIN         |
| Operations            | Email Health        | `/admin/email-deliverability` | ADMIN         |
| Operations            | Changelog           | `/admin/changelog`            | ADMIN         |
| Operations            | Task Tracker        | `/admin/tasks`                | ADMIN         |
| Configuration         | Plan Limits         | `/admin/plan-limits`          | SUPER_ADMIN   |
| Configuration         | Feature Flags       | `/admin/feature-flags`        | SUPER_ADMIN   |
| Configuration         | General Settings    | `/admin/general-settings`     | SUPER_ADMIN   |
| Configuration         | Webhooks & API Keys | `/admin/webhooks`             | SUPER_ADMIN   |
| Configuration         | Custom Plans        | `/admin/custom-plans`         | SUPER_ADMIN   |
| Configuration         | AI Quota            | `/admin/ai-quota`             | SUPER_ADMIN   |
| Configuration         | Settings            | `/admin/settings`             | SUPER_ADMIN   |
| Configuration         | Documentation       | `/admin/docs`                 | SUPER_ADMIN   |

Three routes exist but have no sidebar entry:

| Page               | Route                       | How you get there                                |
| ------------------ | --------------------------- | ------------------------------------------------ |
| Company detail     | `/admin/companies/:uid`     | Click a row on Companies                         |
| Prospect detail    | `/admin/outreach-crm/:uid`  | Click **View Details** on a prospect             |
| Outreach Analytics | `/admin/outreach-analytics` | The **Outreach Analytics** card on the Dashboard |

---

## Dashboard (`/admin`)

The Dashboard is a launcher, not a report. It shows your name and a grid of navigation cards split into **Management** and **Configuration** sections — one card per destination, with a one-line description. Cards for SUPER_ADMIN-only pages are hidden from an ADMIN.

There are no platform counters on this page. For numbers, go to Revenue Dashboard, Pipeline Analytics or Quota Inspector.

---

## Outreach

### Prospect CRM (`/admin/outreach-crm`)

Track the companies you are selling to. This is the sales pipeline, entirely separate from candidate data.

**On the list page you can:**

- Read the four stat cards: Total Prospects, In Progress, Demo Scheduled, Converted
- Search by company name, and filter by status, by source, or by **Starred only**
- Click **Add Prospect** to create one — company name, website, industry, company size, country, city, **Found via** (source), status, tags and notes
- Star a prospect to pin it to your shortlist
- Click **View Details** to open the prospect page
- Delete a prospect behind a confirmation dialog

**Statuses:** New, Contacted, Follow Up 1, Follow Up 2, Responded, Demo Scheduled, Demo Done, Proposal Sent, Converted, Lost, Archived.

**Sources:** Clutch, GoodFirms, LinkedIn, Sales Navigator, Upwork, Toptal, Google Maps, Referral, Direct, Other, Apollo Campaign, n8n Workflow.

**On the detail page (`/admin/outreach-crm/:uid`) you can:**

- Review Company Info and the linked campaign reference
- Add and remove **Contacts** — full name, role, email, LinkedIn URL, phone, and a "primary contact" flag
- **Log Activity** with an activity type, an optional channel, an optional status move and notes. Activity types are Note, Message Sent, Response Received, Follow Up, Demo Scheduled, Demo Completed, Proposal Sent, Status Changed and Contact Added. Channels are LinkedIn, Email, WhatsApp, Phone, In Person and Other.
- Pick a saved outreach template when logging an activity, so the message you actually sent is recorded with it
- Read the Activity Timeline

> **Careful:** deleting a prospect removes its contacts and its whole activity history with it. There is no restore.

### Outreach Analytics (`/admin/outreach-analytics`)

A read-only funnel report over the same CRM data. It shows four KPIs — Total Prospects, Response Rate, Demos Scheduled and Conversion Rate (with average days to convert) — plus a conversion funnel, prospects by source, prospects by status, and activities over the last 30 days.

There is no sidebar link. Open it from the **Outreach Analytics** card on the Dashboard.

### Outreach Templates (`/admin/outreach-templates`)

The library of cold-outreach copy. Templates are grouped by channel — LinkedIn connection request, LinkedIn message, email, WhatsApp, response handling and directory listings — and each one carries several variants in both Spanish and English.

**What you can do:**

- Expand a template to read its variants
- Copy a variant to the clipboard
- Edit a variant. Saving stores a **persistent override** for that template ID, language and variant index.
- Reset a variant, which deletes the override and reverts to the copy that ships in the code

Variables you can use in a template: `{{NOMBRE}}`, `{{EMPRESA}}`, `{{CARGO}}`, `{{CIUDAD}}`, `{{N_POSICIONES}}`, `{{CANAL}}`, `{{TU_NOMBRE}}`, `{{DESCUENTO}}`.

> **Two different editors live on this page.** The outreach templates above are prospect-facing sales copy. The page also surfaces your company's **Email Templates**, which are the candidate-facing transactional emails. Editing the wrong one changes what candidates receive.

### Outreach Campaigns (`/admin/outreach-campaigns`)

Run cold-outreach campaigns against imported lead lists. Each campaign is a tab; the tab label shows the campaign's lead count.

**What you can do:**

- **New Campaign** — name and optional description
- Copy the **Campaign UID** (n8n and other automations address the campaign by this UID)
- **Import CSV** — upload a lead list. Apollo.io exports are mapped automatically: First Name + Last Name → contact name, Company Name → company, Email → email, Person Linkedin Url → LinkedIn, and Title / Industry / # Employees / Country are stored in Notes.
- Read the campaign analytics strip: Total Leads, With Email, Unique Opens, Total Opens, Unique Clicks, Total Clicks
- Filter leads by status, by channel and by the date they were added
- Edit a lead's notes
- **Preview** the rendered outreach email for a lead, copy the subject, body or whole email, and step through leads with **Add to CRM & Next**
- Copy the generated **LinkedIn Message** variant for a lead
- **Add to CRM** — converts the lead into a Prospect CRM record behind a confirmation dialog, and lets you assign tags at the same time
- **Delete Campaign** — behind a confirmation dialog. It deletes the campaign _and all of its leads_, and cannot be undone.

**What the UI does not do today:** the per-lead **Send** button is permanently disabled and shows the tooltip "Email sending temporarily disabled". No outbound prospect email can be sent from this page. The send endpoints do exist on the API (`POST /api/outreach-campaigns/:uid/leads/:leadUid/send-email` and `POST /api/outreach-campaigns/:uid/send-test-email`) and are used by the n8n automation, so a lead can still receive mail — just not from a click in this page.

> **API note:** most of this controller requires ADMIN, but the send, preview and test-email endpoints are open to HR and above. They are not reachable through any HR screen, but they are reachable with an HR bearer token.

---

## Management

### Companies (`/admin/companies`)

SUPER_ADMIN only. Lists every company on the platform with search and pagination.

- **Add Company** to create one manually (the dialog is titled _Create New Company_ and takes a name and description)
- Click a row to open the company detail page
- **Delete** a company behind a confirmation dialog

> **Delete is a hard delete, and it usually fails.** Users and job positions are linked to a company with a restricting foreign key, so the database refuses to delete a company that still has either. In practice you can only delete an empty company. Nothing is soft-deleted and nothing appears in Deleted Records.

### Company detail (`/admin/companies/:uid`)

Opens from a row on Companies. Shows the company card (name, description, user count, job-position count) and a **Company Members** table listing every user with name, email, roles, status and join date, paginated.

Two high-blast-radius actions sit above the Company Members table:

| Action                 | What it does                                                                                | Notes                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transfer Ownership** | Moves the `COMPANY_OWNER` role from the current owner to another member of the same company | Disabled unless the company has at least two members. The new owner must already belong to the company. The previous owner keeps their other roles but loses ownership. |
| **Force Join User**    | Adds any user, by User UID, to this company with a Role you pick                            | Bypasses the normal invitation flow entirely — the user is not asked and receives no invitation.                                                                        |

Both are immediate and neither has an undo. Transfer Ownership in particular cannot be reversed by the person who lost it.

### Users (`/admin/users`)

SUPER_ADMIN only; an ADMIN who navigates here sees an Access Denied panel.

- One free-text **Search by name or email** box over the user list, with pagination
- **Create User** opens a dialog to add a user manually
- Each row offers **Edit** and **Delete**

The table columns are name, email, roles, company and created date.

> **Delete is the only destructive control here, and it is a hard delete.** The user row is removed from the database; it is not deactivated and it does not appear in Deleted Records.

The API also exposes deactivate (`PUT /api/users/:uid/deactivate`), reactivate (`PUT /api/users/:uid/reactivate`) and an activity log (`GET /api/users/:uid/activity`), but none of them is wired to a control on this page. There is no way to suspend a user from the UI, and no activity-log view.

### Subscriptions (`/admin/subscriptions`)

Every company subscription in one grid: company, owner, email, plan, status, MRR, period end and created date. Above it are five summary cards — Total, Active, Trial, Past Due and Total MRR.

The page notes it itself: _MRR is estimated from each plan's list price, not from amounts charged by the payment provider._

**Change Plan.** Open the dialog from a row, pick the new plan, and optionally type a note explaining the change.

> **A plan change here is entitlement-only.** It writes the new plan onto the subscription record and appends an audit-log entry. It does **not** talk to Stripe or Dodo. The customer's actual billing is unchanged, so after any change here you must reconcile the payment provider by hand or the two will stay out of step.

**Audit Log.** Each row opens a drawer showing that company's subscription history — Plan Change, Status Change and Trial Extended entries, each with the previous and new value, the note, the admin who made it and the timestamp.

Two more operations exist on the API but have no control in the UI: `PATCH /api/admin/subscriptions/:companyUid/status` and `POST /api/admin/subscriptions/:companyUid/extend-trial`. Their audit-log entries will still show up in the drawer if something else calls them.

### Deleted Records (`/admin/deleted-records`)

Soft-deleted records, in four tabs: **Candidates**, **Job Positions**, **Applications** and **Interviews**. Users are not covered — user deletion is permanent and never lands here.

Each row offers two actions through a shared confirmation dialog:

| Action                 | Effect                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Restore**            | Clears the deletion mark and makes the record active again. Safe and reversible. |
| **Permanently Delete** | A hard delete. This is the GDPR erasure path and it cannot be undone.            |

### Contact Messages (`/admin/contact-messages`)

Submissions from the public `/contact` form, with an unread counter and pagination. Columns are name, company, message, date and read/unread status.

- Click a row to open the message detail dialog
- Mark a message as read
- Use the `mailto:` link in the dialog to reply from your own mail client

There is no reply box and no response tracking. Once you answer by email, nothing about that reply is stored in Borderless.

### Email Logs (`/admin/email-logs`)

SUPER_ADMIN only. The full history of every email the platform has sent: recipient, subject, type, status and sent-at, with server-side pagination.

- Search by email address or subject
- Filter by status (Sent / Failed)
- Filter by email type — welcome, email verification, password reset, team invitation, application received, application accepted, status change, stage advancement, hired notification, HR notification, hiring-process access code, async stage invitation, interview scheduled / rescheduled / cancelled / reminder, template email, system test, outreach, and more

This is the page to open when a customer says a candidate never received an email. **If there is no row, the send never happened** — look at the trigger, not at deliverability.

---

## Business Intelligence

All five pages in this group are read-only. There are no actions on them except **Add to CRM** on the Trial Tracker.

### Revenue Dashboard (`/admin/revenue`)

Estimated MRR with its month-over-month change, active paying companies, companies in trial, cancellations this month, plan distribution, subscription-status breakdown, and new companies per month over the last six months.

MRR is computed in the backend from the count of active subscriptions multiplied by a fixed per-plan list price (Free $0, Professional $49, Enterprise $149). It is not read from the payment provider. Because a **Change Plan** on the Subscriptions page rewrites the plan without touching billing, any manual plan change moves this number away from the money actually collected.

### Quota Inspector (`/admin/quota-inspector`)

Real-time consumption against plan limits for every company: company, plan, job positions, users and AI credits, plus an overall **Health** status. Filter by plan and by status. Limits of `-1` display as **Unlimited**.

| Health       | Meaning                                          |
| ------------ | ------------------------------------------------ |
| **OK**       | Every limited resource is below 70% of its limit |
| **Warning**  | Some limited resource has reached 70%            |
| **Critical** | Some limited resource has reached 90%            |
| **Exceeded** | Some limited resource is at or over 100%         |

Rows sort Exceeded first. A company at **Exceeded** is already being refused by the quota guard when it tries to add more of that resource, so treat those rows as live incidents or upgrade conversations, not as forecasts.

Note that AI credits use the company's own AI Quota record when one exists, and fall back to the plan's credit allowance otherwise.

### Company Health (`/admin/health`)

Churn risk per customer: health score, risk tier, last login, active jobs, applications this month and hiring activity this month. Filter by risk tier.

The score is built from four engagement signals (recency of login, active job positions, application volume, hiring activity) and lands in one of four tiers:

| Score        | Risk tier |
| ------------ | --------- |
| 80 and above | Healthy   |
| 50–79        | At Risk   |
| 20–49        | Churning  |
| Below 20     | Critical  |

### Trial Tracker (`/admin/trials`)

Free-tier and trialing companies, ranked by how deeply they have activated. Columns cover plan, days on platform, jobs, candidates, applications, team size, activation score and conversion readiness. Filter by readiness and by plan.

The activation score adds 20 points for each of: at least 1 job position created, at least 5 candidates added, at least 3 applications received, at least 1 hiring process started, at least 2 team members invited. Readiness follows from the score — **HOT** at 70 or more, **WARM** at 40–69, **COLD** below 40. The grid sorts hottest first.

The **Add to CRM** button in the last column is a shortcut: it navigates you to the Prospect CRM. It does not create the prospect for you — add it there yourself. Once a matching prospect exists, the cell shows an **In CRM** chip instead.

### Pipeline Analytics (`/admin/pipeline-analytics`)

Cross-company recruiting metrics for business reviews and investor conversations: total applications, applications this month, open job positions (against total and closed), average time to hire, conversion rate, active companies, total interviews and interviews this month, plus monthly applications over six months and a breakdown of application sources.

Every figure is aggregated across all tenants — the page states the company count it covers under the title. Do not read any single number as belonging to one customer.

---

## Operations

### Job Moderation (`/admin/job-moderation`)

SUPER_ADMIN only. The anti-spam queue for job postings.

**How postings get here:** a posting created by a company **without an active paid subscription** is saved as `PENDING_APPROVAL` and stays off the public careers board until you decide. Postings from companies on a paid plan are approved automatically and never appear in this queue.

**On the page you can:**

- Read the four stat cards: Pending, Approved, Rejected and Total postings
- Search by job title or company name
- Change the **Moderation status** filter to Approved or Rejected to review past decisions (it defaults to Pending)
- **Approve** straight from the row's tick button
- Open **Review posting** to read the full description, the company's plan and paid/unpaid state, who created it and when, and any previous moderation note — then approve or reject from there

**Rejecting requires a reason** of at least three characters, and that reason is sent to the company verbatim and shown on their posting. Rejection keeps the posting off the public board. Approval publishes it platform-wide immediately. Either decision notifies the user who created the posting.

### Demo Bookings (`/admin/demos`)

Closes the loop on the public book-a-demo flow. The grid shows prospect, company, scheduled time, created date, current outcome, notes and whether the booking is linked to a CRM prospect. Filter by outcome.

**Set Outcome** opens a dialog with a notes field and these five outcomes: **Pending**, **Completed**, **No-Show**, **Rescheduled**, **Canceled**.

The CRM column is read-only — it shows **In CRM** or **No CRM**. The endpoint that attaches a booking to a prospect (`PATCH /api/admin/demos/:uid/link-prospect`) exists but has no control on this page yet.

### Email Health (`/admin/email-deliverability`)

Aggregate deliverability across every email the platform has sent: Total Sent, Delivery Rate, Open Rate, Bounce Rate and Spam / Complaints, a **Breakdown by Email Type** grid (delivered, opened, bounced per type), and a **Recent Bounces** list with the bounce type.

A banner warns you when the bounce rate goes above 5%. As a rule of thumb, a bounce rate over 5% or a complaint rate over 0.1% starts damaging sender reputation — clean the offending addresses quickly.

> **Where the data comes from.** Sending marks a log row `SENT` or `FAILED`. The `DELIVERED`, `OPENED`, `BOUNCED` and `SPAM` states only arrive from Resend's delivery webhook at `POST /api/email/webhooks/resend`. If that webhook is not configured, everything sits at Sent and the rates on this page stay at zero — that is a missing webhook, not a delivery problem.

### Changelog (`/admin/changelog`)

Authors the release notes customers see in the "What's New" modal when they log in.

- **New Release Note** — title, version, content, target tier and a Publish switch
- **Target Tier** — All Users, Professional+, or Enterprise Only
- Edit an existing note
- Toggle **Published** from the grid or from the dialog
- Delete a note behind a confirmation dialog
- The grid shows each note's status and a **Seen by** count

> **Publishing is customer-facing and immediate.** The moment a note is published it becomes available to matching customers through the unread-notes feed. Deleting a published note removes it from everyone who has not opened it yet. Leave a note as a draft until the copy is final.

### Task Tracker (`/admin/tasks`)

An internal kanban board for the Borderless team. Nothing here is visible to customers.

- Four columns: **To Do**, **In Progress**, **In Review**, **Done**
- **Add Task** — title, description, status, priority (Low, Medium, High, Urgent), due date, labels, assignee and an optional linked company
- Arrow buttons on a card move it back or forward a column
- Tasks past their due date and not yet Done are highlighted as **Overdue**
- Search by title, and filter by priority and by assignee
- Delete a task behind a confirmation dialog

Two known rough edges: the **Assignee** picker requests `GET /api/users`, a route the backend does not define (the users API exposes `/api/users/list`), and the **Linked Company** picker requests `GET /api/company`, which is SUPER_ADMIN-only. Expect both pickers to come back empty — the assignee one for everybody, the company one for an ADMIN.

---

## Configuration

### Plan Limits (`/admin/plan-limits`)

SUPER_ADMIN only. One card per seeded tier — **Free Trial**, **Professional**, **Agency** and **Enterprise** — each with five inline numeric fields and three switches. Every edit saves on its own as soon as you leave the field or flip the switch.

| Field                       | Type                                      |
| --------------------------- | ----------------------------------------- |
| Max Job Positions           | number (`-1` = unlimited)                 |
| Max Candidates per Position | number (`-1` = unlimited)                 |
| Max Users                   | number (`-1` = unlimited)                 |
| Max Storage (MB)            | number (`-1` = unlimited)                 |
| AI Credits / Month          | number (`-1` = unlimited, `0` = disabled) |
| AI Scoring Enabled          | switch                                    |
| Email Templates Enabled     | switch                                    |
| Analytics Enabled           | switch                                    |

> **Editing this page does not change what customers can do.** Runtime quota enforcement and the public pricing cards both read a hard-coded configuration file in the backend (`src/modules/quota/config/plan-limits.config.ts`), not this table. The database table behind this screen exists only to back this screen. If the two disagree, the file wins. A real tier change has to be made in that file and mirrored here.

### Feature Flags (`/admin/feature-flags`)

SUPER_ADMIN only. A matrix: six features down the side, four plan tiers across the top, and a switch in every cell. That is 24 seeded flag records in total. Toggling a switch saves immediately.

| Feature            | Free Trial | STARTER | Professional | Enterprise |
| ------------------ | ---------- | ------- | ------------ | ---------- |
| AI Screening       | off        | off     | off          | on         |
| Bulk Import        | off        | on      | on           | on         |
| Advanced Analytics | off        | off     | on           | on         |
| Custom Branding    | off        | off     | on           | on         |
| API Access         | off        | off     | off          | on         |
| Priority Support   | off        | off     | off          | on         |

The table above is the seeded default. Hovering a switch shows when that flag was last changed.

There is no per-company targeting and no A/B bucketing — a flag belongs to a plan tier, not to a customer.

**The tier columns here do not match Plan Limits.** This page uses Free / Starter / Professional / Enterprise; Plan Limits and the subscription plans use Free / Professional / Agency / Enterprise. There is no translated name for Starter, so the column header shows the raw string `STARTER`, and there is no Agency column at all.

> **Nothing reads these flags yet.** No backend guard and no frontend component consults the feature-flag records, so toggling a switch changes the stored value and nothing else. Treat this page as a plan-matrix editor that is not yet connected, not as a kill switch.

### General Settings (`/admin/general-settings`)

SUPER_ADMIN only. **This page is a placeholder.** Every card carries a "Coming Soon" chip and the note "Full editing support for this section will be available in a future release."

- The **Company Settings** card shows three rows — Company Name, Default Timezone, Default Locale — whose values are fixed placeholder strings, not live data.
- The **Notification Settings** card lists four future preferences (new application received, candidate stage changed, candidate marked as hired, system alerts & errors), each greyed out with a Coming Soon chip.

Nothing on this page reads from or writes to the backend. For the configuration that is actually live, use **Settings** (`/admin/settings`).

### Webhooks & API Keys (`/admin/webhooks`)

SUPER_ADMIN only. **This page is a placeholder too.** Both cards carry a "Coming Soon" chip and every button on the page is disabled.

- The **API Keys** card renders an empty table (Name, Key Prefix, Created, Last Used, Actions) and a disabled **Generate API Key** button.
- The **Webhooks** card renders an empty table (Name, Endpoint URL, Events, Status, Actions) and a disabled **Add Webhook** button.

No webhook can be configured anywhere in Borderless today.

**API keys, however, do work — just not here.** Company-scoped API keys are managed at **`/settings/api-keys`**, backed by a real API (`POST`, `GET`, `PATCH`, `DELETE /api/api-keys`) available to Company Owners, Company Admins, ADMIN and SUPER_ADMIN. That page creates keys, shows the raw key exactly once, renames, disables and revokes them. Send customers there.

### Custom Plans (`/admin/custom-plans`)

SUPER_ADMIN only. Build bespoke plan configurations for individual companies.

**Creating or editing a plan.** The dialog has three sections:

- Plan name, and an optional **Assign to Company** (it can be left unassigned and attached later)
- **Quota Configuration** — Max Users, Max Job Positions, Max Candidates per Position, Max Storage (MB), AI Credits / Month (`-1` = unlimited), plus Email Templates Enabled and Analytics Enabled switches
- **Pricing** — monthly price, annual price (both **in cents**, so `19900` is $199.00) and currency

**From the list you can:**

| Action                | What happens                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Assign**            | Attaches the plan record to a company you pick                                                                                                                     |
| **Sync to Stripe**    | Creates the Stripe product if it does not exist and always creates fresh prices (Stripe prices are immutable), then stores the product, price and payment-link IDs |
| **Edit** / **Delete** | Delete is behind a confirmation dialog and cannot be undone                                                                                                        |

Filter the list by **All Plans**, **Test Mode** or **Live Mode**. The mode badge and the Stripe Dashboard link come from the Stripe configuration; if `STRIPE_SECRET_KEY` is not set on the server, **Sync to Stripe** fails with a clear error instead of doing anything.

> **Sync to Stripe creates real billing objects** in whichever Stripe account the server is configured against. Check the TEST / LIVE badge before you click it.

> **Assigning a plan does not currently change the company's entitlements.** Assignment writes the company onto the custom-plan record; nothing in the quota or plan-limit path reads custom plans back. The quotas you configure here are stored, not enforced. Use the plan on the company's subscription, plus AI Quota, for anything that has to bite today.

### AI Quota (`/admin/ai-quota`)

SUPER_ADMIN only. Quotas are per company **and per quota type**, not a single monthly number.

1. Pick a company from the searchable dropdown (the list is built from the subscriptions grid)
2. The table lists that company's quotas — one row per quota type, with Used / Limit, Remaining and Reset Date
3. Click the edit action on a row to set a **New Limit**

The three quota types are **Resume parsing**, **Candidate scoring** and **Batch scoring**. Enter `-1` for unlimited; the field's own helper text says so and its minimum is `-1`.

The candidate-scoring limit you set here is what the Quota Inspector reports as that company's AI credit allowance.

### Settings (`/admin/settings`)

SUPER_ADMIN only. A read-only readout of the server's real configuration, in six cards.

| Card                      | What it shows                                        | Source                                                                                                                  |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Email Configuration**   | SMTP status, host, port, sender address              | `SMTP_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `EMAIL_FROM`                                                                  |
| **AI Settings**           | model and tier                                       | `GEMINI_MODEL`, `GEMINI_TIER`                                                                                           |
| **Storage Configuration** | storage type and bucket                              | `STORAGE_TYPE`, `S3_BUCKET_NAME`                                                                                        |
| **Rate Limiting**         | requests per window for general, auth and AI traffic | `THROTTLE_TTL` / `THROTTLE_LIMIT`, `THROTTLE_AUTH_TTL` / `THROTTLE_AUTH_LIMIT`, `THROTTLE_AI_TTL` / `THROTTLE_AI_LIMIT` |
| **Backup Configuration**  | enabled, schedule, retention days, last backup       | `BACKUP_ENABLED`, `BACKUP_SCHEDULE`, `BACKUP_RETENTION_DAYS`                                                            |
| **Application Info**      | environment and version                              | `NODE_ENV`                                                                                                              |

A seventh card, **Email Statistics**, summarizes the last month of sending: total, sent, failed and a breakdown by email type.

Only two things on this page are interactive:

- The **Application emails enabled** switch, which persists an override of the `ENABLE_APPLICATION_EMAILS` default
- **Test Connection** on the Email Configuration card, which sends a live test message. It is disabled when SMTP is off.

Everything else is set by environment variables on the server and cannot be changed from the UI. Backup settings in particular need a server restart.

### Documentation (`/admin/docs`)

SUPER_ADMIN only. The guide you are reading now. It renders sixteen sections — Overview, Roles & Permissions, Candidates, Job Positions, Hiring Processes, Applications, Interviews, Calendar, AI Scoring, Email Templates, Analytics, Team Management, Subscription & Billing, Admin Panel, Integrations and Why Borderless? — from markdown files bundled into the frontend.

**For maintainers:**

- Each section is a pair of files in `recruiting-tool-frontend/src/docs/`: `<section>.md` for English and `<section>.es.md` for Spanish. The page picks the Spanish file whenever the interface language starts with `es`.
- The files are imported at build time. There is no CMS — editing a doc means editing the markdown file and rebuilding the frontend.
- **Always update both files.** If you change only the English one, Spanish readers silently keep reading the old text with no warning anywhere.
- The `hr-*.md` files in the same folder are a separate surface — they feed the HR guide at `/hr/guide` and are not listed here.

---

## Destructive actions at a glance

| Page                   | Action                  | Reversible?                                                                       |
| ---------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| Companies              | Delete company          | No — hard delete (and blocked while users or job positions exist)                 |
| Company detail         | Transfer Ownership      | No — not by the previous owner                                                    |
| Company detail         | Force Join User         | Only by editing the user's roles afterwards                                       |
| Users                  | Delete user             | No — hard delete                                                                  |
| Subscriptions          | Change Plan             | The value, yes; the billing mismatch it creates, only by hand                     |
| Deleted Records        | Permanently Delete      | No — GDPR erasure                                                                 |
| Job Moderation         | Reject posting          | The status, yes; the reason is already shown to the company                       |
| Changelog              | Publish / Delete a note | Publishing is instantly customer-visible; deleting removes it from unseen readers |
| Outreach Campaigns     | Delete Campaign         | No — takes all of its leads with it                                               |
| Prospect CRM           | Delete Prospect         | No — takes contacts and activity history with it                                  |
| Custom Plans           | Sync to Stripe          | Creates real objects in Stripe                                                    |
| Custom Plans           | Delete plan             | No                                                                                |
| AI Quota / Plan Limits | Limit edits             | Yes — re-edit the value                                                           |

---

## Related

- [Roles & Permissions](./roles-permissions.md) — the full role ladder and permission matrix
- [Subscription & Billing](./subscription.md) — what customers see for plans and quotas
- [Integrations](./integrations.md) — API keys, calendar and outbound email
- [Overview](./overview.md) — how the product fits together
