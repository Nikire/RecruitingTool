# Role-Based Permissions Guide

## Overview

This document provides a comprehensive guide to the role-based access control (RBAC) system implemented in the Recruiting Tool application. The system uses hierarchical roles with different permission levels to control access to features and API endpoints.

---

## Role Hierarchy

The application implements a **hierarchical permission model** where higher-level roles inherit permissions from lower-level roles. The hierarchy is enforced through a numeric level system:

```
Level 1 (Highest):  SUPER_ADMIN
Level 2:            ADMIN
Level 3:            HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, RECRUITER
Level 4 (Lowest):   USER
```

### Hierarchy Rules

- **Higher roles can access everything lower roles can access**
- If an endpoint requires `@Auth([RolesType.HR])`, users with `ADMIN` or `SUPER_ADMIN` roles can also access it
- If an endpoint requires `@Auth([RolesType.USER])`, **all authenticated users** can access it
- When multiple roles are specified (e.g., `@Auth([RolesType.HR, RolesType.COMPANY_OWNER])`), the user needs to have **any one** of those roles (OR logic)

### Implementation

The role hierarchy is implemented in `src/modules/shared/modules/auth/guards/roles.guard.ts`:

```typescript
const permissionRoles = {
  1: RolesType.SUPER_ADMIN,
  2: RolesType.ADMIN,
  3: RolesType.HR,
  4: RolesType.USER,
} satisfies Record<number, RolesType>;
```

**Note:** Some roles (HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, RECRUITER) are not explicitly in the permission hierarchy but are treated at Level 3 (equivalent to HR).

---

## Role Definitions

### USER
**Description:** Basic authenticated user with limited permissions

**Typical Use Cases:**
- Internal employees who participate in hiring processes
- Interviewers who evaluate candidates
- Team members who provide feedback on candidates

**What USER can do:**
- View their own profile and update personal information
- Access assigned interviews and provide candidate feedback
- View hiring processes they're involved in
- Upload files (resumes, documents)
- Receive notifications via SSE
- View scorecards for candidates they're evaluating
- View job positions they're assigned to review
- Manage their onboarding status

**What USER cannot do:**
- Create or manage job positions
- Access candidate management features
- View audit logs or analytics
- Access admin panel features
- Manage company settings
- Create or modify hiring processes
- Access AI-powered features
- Manage subscriptions or billing

**File Paths:**
- User profile management: `src/modules/profile/profile.controller.ts`
- User CRUD: `src/modules/users/users.controller.ts`
- File uploads: `src/modules/storage/files.controller.ts`
- Scorecards: `src/modules/scorecard/scorecard.controller.ts`

---

### HR (Human Resources)

**Description:** HR professionals who manage the complete recruiting lifecycle

**Typical Use Cases:**
- HR Managers who oversee all recruitment activities
- Recruiters who manage candidates and job positions
- Talent Acquisition specialists

**What HR can do:**
**Everything USER can do, plus:**
- **Job Position Management:**
  - Create, read, update, delete job positions
  - Manage job position visibility and status

- **Candidate Management:**
  - View all candidates
  - Create and update candidate profiles
  - Manage candidate documents and resumes

- **Hiring Process Management:**
  - Create and manage hiring processes
  - Move candidates through hiring stages
  - Assign interviewers to candidates

- **Application Management:**
  - Review and process job applications
  - Update application statuses
  - Manage application workflow

- **AI-Powered Features:**
  - Screen and rank candidates using AI
  - Generate interview questions
  - Analyze resumes with AI
  - AI candidate matching
  - Check AI quota usage

- **Interview Scheduling:**
  - Schedule interviews
  - Manage interview time slots
  - Integrate with Google Calendar
  - Send interview invitations

- **Email Management:**
  - Create and manage email templates
  - Send automated emails to candidates

- **Data Export:**
  - Export candidate data
  - Export hiring analytics

- **Calendar Integration:**
  - Connect Google Calendar
  - Manage calendar events
  - View availability

- **Analytics (Limited):**
  - View basic recruitment metrics
  - Access hiring funnel data

**What HR cannot do:**
- Access platform administration features
- Manage multiple companies (unless COMPANY_OWNER)
- Access system-wide audit logs
- Manage subscriptions for other companies
- Delete companies
- Access backup/restore features
- Manage global AI quotas

**File Paths:**
- Job positions: `src/modules/job-position/job-position.controller.ts`
- Candidates: `src/modules/hiring-process/modules/candidate/candidate.controller.ts`
- Hiring processes: `src/modules/hiring-process/hiring-process.controller.ts`
- Applications: `src/modules/application/application.controller.ts`
- AI features: `src/modules/ai/ai.controller.ts`
- Interviews: `src/modules/interview/interview.controller.ts`
- Calendar: `src/modules/calendar/calendar.controller.ts`, `src/modules/google-calendar/google-calendar.controller.ts`
- Email templates: `src/modules/email-templates/email-templates.controller.ts`
- Exports: `src/modules/export/export.controller.ts`
- Scorecards: `src/modules/scorecard/scorecard.controller.ts`
- Time slots: `src/modules/time-slots/time-slots.controller.ts`

---

### HR_MANAGER

**Description:** Senior HR role with additional team management capabilities

**What HR_MANAGER can do:**
**Everything HR can do, plus:**
- **Company Role Management:**
  - View team members and their roles
  - Create new team member invitations
  - Update team member roles
  - Manage role assignments within the company
  - View team permissions

**File Paths:**
- Company roles: `src/modules/company-roles/company-roles.controller.ts`

---

### RECRUITER

**Description:** Specialized role focused on candidate sourcing and initial screening

**What RECRUITER can do:**
- Similar permissions to HR role
- Focused on candidate pipeline management
- Job position creation and management

**Note:** Currently implemented at the database level but has same practical permissions as HR in most endpoints.

---

### COMPANY_OWNER

**Description:** Owner of a company who manages their company's recruiting operations

**Typical Use Cases:**
- Small business owners managing their own hiring
- HR Directors with full company oversight
- Company founders handling recruitment

**What COMPANY_OWNER can do:**
**Everything HR can do, plus:**
- **Company Management:**
  - View own company details
  - Update company profile and settings

- **Subscription Management:**
  - View subscription details
  - Create checkout sessions for upgrades
  - Manage billing information
  - View subscription history

- **Team Management:**
  - Full company role management
  - Delete team members
  - Invite new team members
  - Assign roles to team members

**What COMPANY_OWNER cannot do:**
- Manage other companies
- Access platform-wide administration
- View audit logs for other companies
- Manage global system settings
- Access backup/restore features

**File Paths:**
- Company management: `src/modules/company/company.controller.ts`
- Subscription: `src/modules/stripe/stripe.controller.ts`
- Company roles: `src/modules/company-roles/company-roles.controller.ts`
- Company invitations: `src/modules/company-invitations/company-invitations.controller.ts`

---

### COMPANY_ADMIN

**Description:** Administrative role within a company, second-in-command to COMPANY_OWNER

**What COMPANY_ADMIN can do:**
**Everything HR_MANAGER can do, plus:**
- **Team Management:**
  - Delete team members (requires COMPANY_OWNER, ADMIN, or COMPANY_ADMIN)
  - Manage most company role operations

**Note:** Cannot delete other COMPANY_ADMIN or COMPANY_OWNER users.

**File Paths:**
- Company roles: `src/modules/company-roles/company-roles.controller.ts`

---

### ADMIN

**Description:** Platform administrator with broad access across multiple companies

**Typical Use Cases:**
- Platform support staff
- Customer success managers
- Internal operations team

**What ADMIN can do:**
**Everything HR and COMPANY_OWNER can do, plus:**
- **Platform Administration:**
  - Access admin panel features
  - View deleted records across all companies
  - Manage users across companies

- **User Management:**
  - Create users manually
  - Delete users
  - Update user profiles
  - View user activity logs

- **Audit & Compliance:**
  - View audit logs
  - Monitor system activity
  - Track changes across the platform

- **File Management:**
  - Delete any files in storage

- **Advanced Analytics:**
  - Access detailed analytics
  - View cross-company metrics

**What ADMIN cannot do:**
- Manage companies (create/delete)
- Access system backups
- Modify global AI quotas
- Perform destructive global operations

**File Paths:**
- Admin panel: `src/modules/admin/admin.controller.ts`
- Deleted records: `src/modules/admin/deleted/deleted.controller.ts`
- Audit logs: `src/modules/audit-log/audit-log.controller.ts`
- User management: `src/modules/users/users.controller.ts`
- Profile management: `src/modules/profile/profile.controller.ts`
- File storage: `src/modules/storage/files.controller.ts`

---

### SUPER_ADMIN

**Description:** Highest privilege role with full system access

**Typical Use Cases:**
- Platform owners
- Technical operations team
- System administrators

**What SUPER_ADMIN can do:**
**Everything ADMIN can do, plus:**
- **Company Management:**
  - Create new companies
  - Update any company
  - Delete companies
  - Restore deleted companies
  - View all companies

- **System Operations:**
  - Trigger database backups
  - Restore from backups
  - Access system health metrics

- **Global AI Quota Management:**
  - Set global AI quota limits
  - Reset AI quota usage
  - Configure AI quota rules
  - Monitor AI usage across all companies

- **Candidate Data Management:**
  - Permanently delete candidates
  - Access soft-deleted candidate data

**Unrestricted Access:** SUPER_ADMIN can access any endpoint in the system.

**File Paths:**
- Company CRUD: `src/modules/company/company.controller.ts`
- Backup operations: `src/modules/backup/backup.controller.ts`
- AI quota management: `src/modules/ai-quota/ai-quota.controller.ts`
- Candidate deletion: `src/modules/hiring-process/modules/candidate/candidate.controller.ts`

---

## Permission Matrix

### Feature Access Overview

| Feature | USER | HR | HR_MANAGER | RECRUITER | COMPANY_OWNER | COMPANY_ADMIN | ADMIN | SUPER_ADMIN |
|---------|------|----|----|-----------|---------------|---------------|-------|-------------|
| **Profile Management** |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View other profiles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Update other profiles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Job Positions** |
| View public job positions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View internal job positions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create job positions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update job positions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete job positions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Candidates** |
| View candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Permanently delete candidates | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Hiring Processes** |
| View assigned processes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all processes | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create processes | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update processes | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete processes | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage stages | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Applications** |
| View applications | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update application status | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete applications | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AI Features** |
| Screen candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rank candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generate interview questions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Resume analysis | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Candidate matching | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View AI quota | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage global AI quotas | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Interviews** |
| View assigned interviews | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all interviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update interviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cancel interviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Scorecards** |
| Submit scorecard (assigned) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View scorecards (assigned) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all scorecards | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete scorecards | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Calendar Integration** |
| Connect Google Calendar | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage calendar events | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View availability | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Email Templates** |
| View templates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create templates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update templates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete templates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Data Export** |
| Export candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Company Management** |
| View own company | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update own company | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View all companies | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create companies | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete companies | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Company Roles & Team** |
| View team members | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Invite team members | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Update member roles | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete team members | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Subscriptions & Billing** |
| View subscription | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Manage subscription | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Create checkout session | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Audit Logs** |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Admin Panel** |
| Access admin panel | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View deleted records | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System Operations** |
| Database backup | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Database restore | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **File Storage** |
| Upload files | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own files | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete own files | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete any files | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Notifications** |
| Receive notifications (SSE) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quota System** |
| View own quota | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## API Endpoint Permissions

### Public Endpoints (No Authentication Required)

**Auth & Registration:**
- `POST /auth/register` - Register new user
- `POST /auth/sign-in` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/auth0/callback` - Auth0 OAuth callback

**Job Positions (Public):**
- `GET /job-position/public/all` - List all open job positions with filters
- `GET /job-position/public/:uid` - Get single job position details

**Applications (Public):**
- `POST /application/public/apply` - Submit job application

**Health & Metrics:**
- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /metrics` - Prometheus metrics

**Webhooks:**
- `POST /webhooks/stripe` - Stripe webhook handler
- `POST /webhooks/n8n/:uid` - N8N webhook handler

---

### Protected Endpoints by Role

#### USER Role Required

**Profile:**
- `GET /profile` - Get own profile
- `PUT /profile` - Update own profile
- `POST /profile/avatar` - Upload profile avatar
- `DELETE /profile/avatar` - Delete profile avatar

**User Management:**
- `GET /users/me/activity-log` - Get own activity log
- `GET /users/me/onboarding-status` - Get onboarding status
- `POST /users/me/complete-onboarding` - Complete onboarding

**File Storage:**
- `POST /files/upload` - Upload file
- `GET /files/:uid` - Get file details
- `GET /files/:uid/download` - Download file
- `DELETE /files/:uid` - Delete file
- `GET /files/user/:userUid` - List user's files

**Notifications:**
- `GET /sse` - Subscribe to Server-Sent Events

**Quota:**
- `GET /quota/my-usage` - View own quota usage

**Scorecards (Assigned Interviews):**
- `GET /scorecard/:uid` - Get scorecard details
- `POST /scorecard/:interviewUid/submit` - Submit scorecard

**Hiring Processes (Assigned):**
- `GET /hiring-process/:uid` - View assigned hiring process
- `GET /hiring-process/:uid/stages` - View stages of assigned process
- `GET /hiring-process/:uid/candidates` - View candidates in assigned process

**Job Positions (Internal View):**
- `GET /job-position/:uid` - View internal job position details
- `GET /job-position/:uid/hiring-process` - View hiring process for job position
- `GET /job-position/:uid/applications` - View applications for job position

---

#### HR Role Required

**Job Positions:**
- `POST /job-position` - Create job position
- `PUT /job-position/:uid` - Update job position
- `DELETE /job-position/:uid` - Delete job position
- `GET /job-position` - List all job positions

**Candidates:**
- `GET /candidates` - List all candidates
- `POST /candidates` - Create candidate
- `PUT /candidates/:uid` - Update candidate
- `DELETE /candidates/:uid` - Soft delete candidate

**Hiring Processes:**
- `POST /hiring-process` - Create hiring process
- `PUT /hiring-process/:uid` - Update hiring process
- `DELETE /hiring-process/:uid` - Delete hiring process
- `POST /hiring-process/:uid/move-candidate` - Move candidate to stage
- `POST /hiring-process/:uid/assign-interviewer` - Assign interviewer

**Stages:**
- `POST /stages` - Create stage
- `PUT /stages/:uid` - Update stage
- `DELETE /stages/:uid` - Delete stage
- `POST /stages/:uid/reorder` - Reorder stages

**Applications:**
- `GET /application` - List all applications
- `GET /application/:uid` - Get application details
- `PUT /application/:uid/status` - Update application status
- `DELETE /application/:uid` - Delete application

**AI Features:**
- `POST /ai/screen-candidates` - Screen candidates with AI
- `POST /ai/rank-candidates` - Rank candidates with AI
- `POST /ai/generate-questions` - Generate interview questions
- `POST /ai/analyze-resume` - Analyze resume with AI
- `POST /ai/candidate-matching` - Match candidates to job position
- `POST /ai/sentiment-analysis` - Analyze interview sentiment
- `POST /ai/skill-gap-analysis` - Analyze skill gaps
- `GET /ai-quota/usage` - View AI quota usage
- `GET /ai-quota/history` - View AI usage history
- `GET /ai-quota/limits` - View AI quota limits
- `POST /ai-quota/reset-usage` - Reset AI quota usage

**Interviews:**
- `GET /interview` - List all interviews
- `GET /interview/:uid` - Get interview details
- `POST /interview` - Schedule interview
- `PUT /interview/:uid` - Update interview
- `DELETE /interview/:uid` - Cancel interview
- `POST /interview/:uid/reschedule` - Reschedule interview
- `POST /interview/:uid/send-reminder` - Send interview reminder
- `GET /interview/:uid/feedback` - Get interview feedback
- `POST /interview/:uid/feedback` - Submit interview feedback
- `GET /interview/candidate/:candidateUid` - List candidate interviews

**Calendar:**
- `GET /calendar/events` - List calendar events
- `POST /calendar/event` - Create calendar event
- `PUT /calendar/event/:uid` - Update calendar event
- `DELETE /calendar/event/:uid` - Delete calendar event

**Google Calendar:**
- `POST /google-calendar/authorize` - Start OAuth flow
- `POST /google-calendar/callback` - OAuth callback
- `GET /google-calendar/status` - Get connection status
- `POST /google-calendar/disconnect` - Disconnect Google Calendar
- `GET /google-calendar/events` - List Google Calendar events
- `POST /google-calendar/create-event` - Create event in Google Calendar
- `DELETE /google-calendar/event/:eventId` - Delete Google Calendar event

**Time Slots:**
- `GET /time-slots` - List available time slots
- `POST /time-slots` - Create time slot
- `PUT /time-slots/:uid` - Update time slot
- `DELETE /time-slots/:uid` - Delete time slot
- `GET /time-slots/hr/:hrUid` - Get HR's time slots

**Email Templates:**
- `GET /email-templates` - List email templates
- `POST /email-templates` - Create email template
- `PUT /email-templates/:uid` - Update email template
- `DELETE /email-templates/:uid` - Delete email template

**Scorecards:**
- `GET /scorecard` - List all scorecards
- `GET /scorecard/interview/:interviewUid` - Get interview scorecards
- `PUT /scorecard/:uid` - Update scorecard
- `DELETE /scorecard/:uid` - Delete scorecard
- `GET /scorecard/candidate/:candidateUid` - Get candidate scorecards

**Data Export:**
- `POST /export/candidates` - Export candidates to CSV
- `POST /export/analytics` - Export analytics data

---

#### HR_MANAGER Role Required

**Company Roles:**
- `GET /company-roles` - List company team members
- `GET /company-roles/:uid` - Get team member details
- `PUT /company-roles/:uid` - Update team member role
- `POST /company-roles/:uid/assign-role` - Assign role to team member

**Company Invitations:**
- `POST /company-invitations` - Create invitation
- `GET /company-invitations` - List pending invitations
- `DELETE /company-invitations/:uid` - Cancel invitation

---

#### COMPANY_OWNER Role Required

**Company Management:**
- `GET /company/my` - Get own company details
- `PUT /company/my` - Update own company

**Company Roles (Full Access):**
- `DELETE /company-roles/:uid` - Remove team member

**Subscriptions:**
- `GET /stripe/subscription` - Get subscription details
- `POST /stripe/create-checkout-session` - Create Stripe checkout
- `POST /stripe/manage-subscription` - Manage subscription
- `POST /stripe/cancel-subscription` - Cancel subscription

---

#### ADMIN Role Required

**Admin Panel:**
- `GET /admin/overview` - Get admin dashboard overview
- `GET /admin/deleted/users` - List soft-deleted users
- `GET /admin/deleted/candidates` - List soft-deleted candidates
- `GET /admin/deleted/job-positions` - List soft-deleted job positions

**User Management:**
- `POST /users` - Create user manually
- `GET /users` - List all users
- `PUT /users/:uid` - Update any user
- `DELETE /users/:uid` - Delete user

**Profile Management:**
- `GET /profile/:uid` - Get any user's profile
- `PUT /profile/:uid` - Update any user's profile

**Audit Logs:**
- `GET /audit-log` - List audit logs
- `GET /audit-log/:uid` - Get audit log details

**File Storage:**
- `DELETE /files/admin/:uid` - Delete any file

---

#### SUPER_ADMIN Role Required

**Company CRUD:**
- `GET /company` - List all companies
- `POST /company` - Create company
- `PUT /company/:uid` - Update any company
- `DELETE /company/:uid` - Delete company
- `POST /company/:uid/restore` - Restore deleted company
- `GET /company/:uid` - Get company details

**Backup & Restore:**
- `POST /backup/create` - Create database backup
- `POST /backup/restore` - Restore database from backup
- `GET /backup/list` - List available backups
- `DELETE /backup/:filename` - Delete backup file

**Global AI Quota Management:**
- `GET /ai-quota/global` - Get global AI quota settings
- `PUT /ai-quota/global` - Update global AI quota limits
- `POST /ai-quota/company/:companyUid/set-limit` - Set company AI quota
- `POST /ai-quota/company/:companyUid/reset` - Reset company AI usage

**Candidate Management:**
- `DELETE /candidates/:uid/permanent` - Permanently delete candidate

---

## Common Use Cases

### Case 1: HR Manager Onboarding New Team Member

**Scenario:** An HR Manager wants to invite a new recruiter to their company.

**Required Role:** HR_MANAGER or COMPANY_OWNER

**Steps:**
1. Create invitation: `POST /company-invitations`
   ```json
   {
     "email": "new.recruiter@company.com",
     "role": "RECRUITER",
     "firstName": "Jane",
     "lastName": "Doe"
   }
   ```

2. New user receives invitation email with acceptance link

3. New user accepts invitation: `POST /company-invitations/:uid/accept`

4. New user is assigned RECRUITER role and can access HR features

**Permissions Granted:**
- New recruiter can now create/manage job positions
- Screen and rank candidates
- Schedule interviews
- Manage hiring processes

---

### Case 2: Interviewer Providing Feedback

**Scenario:** An employee (USER role) is assigned to interview a candidate and needs to submit feedback.

**Required Role:** USER

**Steps:**
1. User receives interview assignment (email notification)

2. View assigned interview: `GET /interview/:uid` (requires USER role or higher)

3. View candidate details: `GET /hiring-process/:uid/candidates` (if assigned to process)

4. Submit scorecard: `POST /scorecard/:interviewUid/submit`
   ```json
   {
     "technicalSkills": 4,
     "communication": 5,
     "cultureFit": 4,
     "overallRating": 4,
     "recommendation": "STRONG_YES",
     "comments": "Great technical skills and cultural fit."
   }
   ```

**Permissions:**
- USER can only view interviews they're assigned to
- USER can only submit scorecards for their assigned interviews
- USER cannot view other interviewers' scorecards (requires HR role)

---

### Case 3: Company Owner Managing Subscription

**Scenario:** A company owner wants to upgrade their subscription to access more AI features.

**Required Role:** COMPANY_OWNER

**Steps:**
1. View current subscription: `GET /stripe/subscription`

2. View available plans and limits

3. Create checkout session: `POST /stripe/create-checkout-session`
   ```json
   {
     "priceId": "price_premium_monthly",
     "successUrl": "https://app.example.com/subscription/success",
     "cancelUrl": "https://app.example.com/subscription/cancel"
   }
   ```

4. Complete payment in Stripe

5. Webhook updates subscription status automatically

6. Company gains access to increased AI quota and features

**Permissions:**
- COMPANY_OWNER can manage their company's subscription
- ADMIN and SUPER_ADMIN can also manage subscriptions
- HR and other roles cannot access billing features

---

### Case 4: Admin Investigating User Activity

**Scenario:** An admin needs to investigate suspicious activity from a user account.

**Required Role:** ADMIN

**Steps:**
1. Search for user: `GET /users?search=suspicious.user@example.com`

2. View user activity log: `GET /users/:uid/activity-log`

3. Check audit logs: `GET /audit-log?userId=:uid`

4. Review recent actions, login times, IP addresses

5. If needed, disable user account: `PUT /users/:uid`
   ```json
   {
     "isActive": false
   }
   ```

**Permissions:**
- ADMIN can view all users and their activity
- ADMIN can view system-wide audit logs
- SUPER_ADMIN has same access plus company management

---

### Case 5: HR Using AI to Screen Candidates

**Scenario:** HR wants to use AI to screen and rank candidates for a job position.

**Required Role:** HR

**Steps:**
1. Check AI quota availability: `GET /ai-quota/limits`

2. Screen candidates for job position: `POST /ai/screen-candidates`
   ```json
   {
     "jobPositionUid": "job-123-uid",
     "candidateUids": ["candidate-1-uid", "candidate-2-uid"]
   }
   ```

3. AI returns screening results with scores and match percentages

4. Rank candidates: `POST /ai/rank-candidates`
   ```json
   {
     "jobPositionUid": "job-123-uid"
   }
   ```

5. AI quota is automatically decremented

6. View updated AI usage: `GET /ai-quota/usage`

**Permissions:**
- HR can use all AI features
- USER cannot access AI features
- SUPER_ADMIN can manage global AI quotas

---

## Security Best Practices

### 1. Principle of Least Privilege
- Always assign the **minimum role** necessary for a user to perform their job
- Regularly review and audit user roles
- Don't grant ADMIN or SUPER_ADMIN unless absolutely necessary

### 2. Role Assignment
- New users default to USER role upon registration
- Role upgrades must be done by authorized personnel (HR_MANAGER, COMPANY_OWNER, ADMIN)
- Document role changes in audit logs

### 3. Multi-Factor Authentication
- Encourage all users to enable MFA (especially ADMIN and SUPER_ADMIN)
- Enforce MFA for sensitive operations (company deletion, backup restore)

### 4. Session Management
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Force logout on role changes

### 5. Audit Logging
- All sensitive operations are logged in audit logs
- ADMIN and SUPER_ADMIN actions are always tracked
- Logs include: user, action, timestamp, IP address, request details

### 6. API Rate Limiting
- All endpoints are rate-limited to prevent abuse
- Stricter limits on public endpoints (registration, login)
- See `docs/RATE_LIMITING.md` for details

---

## Implementation Details

### Role Guard

The `RolesGuard` (`src/modules/shared/modules/auth/guards/roles.guard.ts`) implements the hierarchical permission system:

```typescript
const permissionRoles = {
  1: RolesType.SUPER_ADMIN,
  2: RolesType.ADMIN,
  3: RolesType.HR,
  4: RolesType.USER,
} satisfies Record<number, RolesType>;
```

**How it works:**
1. Extract required roles from `@Auth([roles])` decorator
2. Get user's current roles from JWT token
3. Calculate highest permission level (lowest number = highest permission)
4. Check if user's highest role level is **less than or equal to** required role level
5. Allow access if check passes, otherwise throw `ForbiddenException`

### Auth Decorator

The `@Auth([roles])` decorator (`src/modules/shared/modules/auth/decorators/auth.decorator.ts`) combines authentication and authorization:

```typescript
export function Auth(roles?: RolesType[]) {
  return applyDecorators(
    SetMetadata('roles', roles || [RolesType.USER]),
    UseGuards(AuthGuard),
    UseGuards(RolesGuard)
  );
}
```

**Usage:**
```typescript
@Auth([RolesType.HR, RolesType.ADMIN])
@Get('candidates')
async listCandidates() {
  // Only HR, ADMIN, and SUPER_ADMIN can access
}
```

### Default Role

If no roles are specified, the decorator defaults to `[RolesType.USER]`, meaning all authenticated users can access the endpoint:

```typescript
@Auth() // Defaults to [RolesType.USER]
@Get('profile')
async getProfile() {
  // All authenticated users can access
}
```

---

## Troubleshooting

### "Access Denied: Insufficient Permissions"

**Cause:** User's role doesn't meet the required permission level for the endpoint.

**Solution:**
1. Check user's current roles: `GET /auth/me`
2. Verify endpoint's required roles in controller
3. Request role upgrade from HR_MANAGER, COMPANY_OWNER, or ADMIN
4. Check if user is in the correct company (multi-tenancy)

### User Can't Access Features After Role Upgrade

**Cause:** JWT token still contains old role information.

**Solution:**
1. Logout and login again to get new JWT with updated roles
2. Or force token refresh: `POST /auth/refresh`

### ADMIN Can't Delete Company

**Cause:** Only SUPER_ADMIN can delete companies.

**Solution:**
1. Request SUPER_ADMIN role from platform owner
2. Or ask SUPER_ADMIN to perform the operation

---

## Related Documentation

- **API Routes:** `.claude/docs/API_ROUTES.md`
- **Authentication:** `recruiting-tool-backend/docs/ERROR_HANDLING_SECURITY.md`
- **Rate Limiting:** `recruiting-tool-backend/docs/RATE_LIMITING.md`
- **Database Schema:** `.claude/docs/DATABASE.md`
- **Business Constraints:** `recruiting-tool-backend/docs/BUSINESS_CONSTRAINTS.md`

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-09 | 1.0.0 | Initial comprehensive role permissions documentation |

---

**Document Status:** Complete and accurate as of commit `99eacdc` (development branch)

**Maintained by:** Development Team
**Last Reviewed:** 2025-12-09
