# TODO List - Recruiting Tool

## Instructions for AI Assistant

**IMPORTANT:** Once you complete and test a task from this list, create a git commit immediately with a clear, descriptive commit message. Do NOT push to remote - only commit locally.

---

## Current Tasks

### High Priority

- [ ] **Remove ID relations and use UID relations throughout the entire system** 🔴 **TOP PRIORITY**
  - [ ] Keep Prisma internal relations using IDs
  - [ ] Add UID-based relations on the backend (services and controllers)
  - [ ] Update all DTOs to use UIDs instead of IDs
  - [ ] Update frontend to only work with UIDs
  - [ ] Migrate existing endpoints to use UIDs for all relations
  - [ ] Test all CRUD operations with UID-based relations
- [x] Change the existing searchbars to the same format of JobPositionsPage (searchbar outside, send parameters to a list component and inside the list component make the API call.) ✅
- [x] Fill the input values with the values that are on Jotai search. ✅
- [x] **Add toast notifications for success/error/warning messages across the app** ✅
- [x] Add update/delete functionality for Candidates ✅
- [x] Add update/delete functionality for Companies ✅
- [x] Add update/delete functionality for Hiring Processes ✅
- [x] **Admin Panel Layout & Design** ✅
  - [x] Separate admin routes from MainLayout ✅
  - [x] Fix sidebar and AppBar positioning ✅
  - [x] Remove navigation duplicates (Candidates/Companies) ✅
  - [x] Center admin dashboard content (vertical & horizontal) ✅
  - [x] Create 2x2 card grid with consistent sizing (280px × 160px min) ✅
- [x] **User Profile Management** ✅
  - [x] Add profile picture field to User entity ✅
  - [x] Add user profile update functionality ✅
  - [x] Create profile page UI with inline editing ✅
  - [x] Implement change detection for update button ✅
- [ ] Create a proper Home page with landing page content
- [ ] Implement applicant system for job applications
  - [ ] Public job positions list with card-based view
  - [ ] Job application form for candidates
  - [ ] Application submission and tracking
  - [ ] Email notifications for applications
  - [ ] Application status management

### Medium Priority

- [ ] Add stage progression workflow (move candidates between stages)
- [ ] Add advanced search/filtering for candidates and hiring processes
- [ ] Add form validation improvements (better error messages)
- [ ] Add loading states for all data fetching operations
- [ ] Add pagination on array responses (GET /users, etc.) - Backend
- [ ] Add response interceptor for standardized API responses - Backend
- [ ] Add Profile model and relation to User - Backend
- [ ] Add user Profile update endpoints - Backend
- [ ] Add try-catch error handling with formatted error responses - Backend

### Low Priority

- [ ] Add analytics/reporting dashboard
- [ ] Add export functionality (CSV/PDF reports)

---

## Feature Development - Planned

### Admin Panel System

**Goal:** Create a dedicated admin panel with routes accessible only to ADMIN and SUPER_ADMIN roles, centralizing administrative features and improving navigation.

**Frontend Tasks:**

**1. Admin Layout & Routing:**
- [ ] Create AdminLayout component with dedicated navigation
  - [ ] Sidebar with admin-specific links
  - [ ] Breadcrumb navigation
  - [ ] Admin dashboard header
- [ ] Create protected admin routes structure
  - [ ] /admin - Admin dashboard (overview)
  - [ ] /admin/users - User management page
  - [ ] /admin/companies - Company management page (SUPER_ADMIN only)
  - [ ] /admin/system - System settings (SUPER_ADMIN only)
- [ ] Add route guards for admin-only pages
  - [ ] Check for ADMIN or SUPER_ADMIN role
  - [ ] Redirect unauthorized users to dashboard or access denied page
- [ ] Update main navigation to include "Admin Panel" link
  - [ ] Only visible to users with ADMIN or SUPER_ADMIN role
  - [ ] Highlight when on admin routes

**2. Admin Dashboard Page (/admin):**
- [ ] Create AdminDashboard component
  - [ ] Overview cards: Total Users, Total Companies, Total Job Positions, Active Hiring Processes
  - [ ] Recent activity feed
  - [ ] Quick actions (Create User, Create Company, etc.)
  - [ ] System health indicators
- [ ] Add analytics charts (optional)
  - [ ] User growth over time
  - [ ] Hiring processes by status
  - [ ] Job positions by company

**3. User Management Page (/admin/users):**
- [ ] Create UserManagementPage component
  - [ ] User list table with search and filters
  - [ ] Columns: Name, Email, Roles, Company, Created Date, Actions
  - [ ] Filter by role (USER, HR, ADMIN, SUPER_ADMIN)
  - [ ] Filter by company
- [ ] Create CreateUserDialog component
  - [ ] Fields: Name, Email, Password, Roles (multi-select), Company
  - [ ] Role selection with descriptions
  - [ ] Password strength indicator
- [ ] Create UpdateUserDialog component
  - [ ] Update name, email, roles, company
  - [ ] Option to reset password
- [ ] Add user deactivation/reactivation functionality
  - [ ] Soft delete (mark as inactive) instead of hard delete
  - [ ] Show inactive users with visual indicator
- [ ] Add bulk operations
  - [ ] Bulk role assignment
  - [ ] Bulk company assignment
  - [ ] Export users to CSV

**4. Company Management Page (/admin/companies):**
- [ ] Move existing CompaniesPage to /admin/companies route
- [ ] Enhance with admin-specific features
  - [ ] Show all users in each company
  - [ ] Show all job positions per company
  - [ ] Company activation/deactivation toggle
- [ ] Add company statistics card
  - [ ] Total job positions
  - [ ] Total users
  - [ ] Active hiring processes

**5. System Settings Page (/admin/system):**
- [ ] Create SystemSettingsPage component (SUPER_ADMIN only)
  - [ ] Application settings (name, logo, etc.)
  - [ ] Email configuration settings display
  - [ ] Database backup/restore info
  - [ ] System logs viewer
- [ ] Add environment variables viewer (read-only, masked secrets)
- [ ] Add system health checks
  - [ ] Database connection status
  - [ ] Email service status
  - [ ] Storage service status

**6. UI/UX Improvements:**
- [ ] Create consistent admin theme
  - [ ] Darker/distinct color scheme for admin area
  - [ ] Admin-specific icons
- [ ] Add confirmation modals for destructive actions
  - [ ] Delete user confirmation
  - [ ] Role change confirmation (especially granting ADMIN)
- [ ] Add activity logging display
  - [ ] Who created/updated/deleted what and when
  - [ ] Filter by user, action type, date range
- [ ] Add tooltips and help text for admin features

**Backend Tasks:**

**1. User Management Enhancements:**
- [ ] Add user deactivation/reactivation endpoints
  - [ ] PUT /users/:uid/deactivate - Soft delete user
  - [ ] PUT /users/:uid/activate - Reactivate user
  - [ ] Add isActive field to User model
- [ ] Enhance user list endpoint with filters
  - [ ] Filter by role
  - [ ] Filter by company
  - [ ] Filter by active/inactive status
  - [ ] Include company and role information in response
- [ ] Add bulk user operations endpoints
  - [ ] POST /users/bulk-update-roles - Update roles for multiple users
  - [ ] POST /users/bulk-assign-company - Assign company to multiple users

**2. Admin Activity Logging:**
- [ ] Create ActivityLog entity in Prisma
  - [ ] Fields: id, uid, userId, action, entity, entityId, details (JSON), timestamp
  - [ ] Relations: user (User who performed action)
  - [ ] Action types: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, ROLE_CHANGE
- [ ] Add activity logging middleware
  - [ ] Automatically log admin actions (user creation, role changes, etc.)
  - [ ] Log authentication events
- [ ] Add activity log endpoints
  - [ ] GET /activity-logs - List activity logs with filters
  - [ ] Filter by user, action type, entity type, date range
  - [ ] Pagination support

**3. System Health & Statistics:**
- [ ] Create SystemStats service
  - [ ] Get total counts (users, companies, job positions, hiring processes)
  - [ ] Get active counts (active users, open job positions, in-progress hiring)
  - [ ] Get growth metrics (new users this month, etc.)
- [ ] Add system health check endpoints
  - [ ] GET /admin/health/database - Check database connection
  - [ ] GET /admin/health/email - Check email service (if configured)
  - [ ] GET /admin/health/storage - Check storage service (if configured)
- [ ] Add admin statistics endpoint
  - [ ] GET /admin/stats - Get overview statistics for admin dashboard

**4. Enhanced Role & Permission Management:**
- [ ] Add granular permission checks
  - [ ] SUPER_ADMIN can do everything
  - [ ] ADMIN can manage users (except other ADMINs/SUPER_ADMINs)
  - [ ] ADMIN cannot access system settings
- [ ] Add role change validation
  - [ ] Prevent users from promoting themselves
  - [ ] Prevent ADMIN from creating SUPER_ADMIN users
  - [ ] Require SUPER_ADMIN to change ADMIN roles

**Testing:**
- [ ] Test admin route guards work correctly
- [ ] Test role-based permissions in admin panel
- [ ] Test user management CRUD operations
- [ ] Test activity logging captures all admin actions
- [ ] Test system stats calculations are accurate
- [ ] Test admin panel is responsive and accessible
- [ ] Verify SUPER_ADMIN restrictions are enforced
- [ ] Test bulk operations don't cause performance issues

**Security Considerations:**
- [ ] All admin routes protected with role guards
- [ ] Activity logs are immutable (no delete endpoint)
- [ ] Sensitive data (passwords, tokens) never exposed in admin panel
- [ ] Rate limiting on admin API endpoints
- [ ] Audit trail for all admin actions

---

### File Storage System (S3/Local)

**Goal:** Implement file storage for candidate resumes and documents with local development support and production S3 option.

**Backend Tasks:**
- [x] Set up local file storage system using MinIO (S3-compatible local instance) ✅
  - [x] Add MinIO service to docker-compose.yml ✅
  - [x] Configure MinIO with access keys and bucket creation ✅
  - [x] Add MinIO web UI (port 9001) for local testing ✅
- [x] Install and configure AWS SDK for NestJS (@aws-sdk/client-s3) ✅
- [x] Create StorageModule with StorageService ✅
  - [x] Implement upload file method (accepts file buffer, filename, mimetype) ✅
  - [x] Implement download file method (returns file stream) ✅
  - [x] Implement delete file method ✅
  - [x] Implement get file URL method (signed URLs) ✅
- [x] Add environment variables for storage configuration ✅
  - [x] STORAGE_TYPE (local or s3) ✅
  - [x] S3_ENDPOINT (MinIO URL for local, AWS URL for production) ✅
  - [x] S3_BUCKET_NAME ✅
  - [x] S3_ACCESS_KEY_ID ✅
  - [x] S3_SECRET_ACCESS_KEY ✅
  - [x] S3_REGION (for production AWS) ✅
- [x] Create FileUpload entity in Prisma ✅
  - [x] Fields: id, uid, filename, originalName, mimetype, size, s3Key, uploadedById, uploadedAt ✅
  - [x] Relations: uploadedBy (User), candidate (optional) ✅
- [x] Add file upload endpoints (implemented as /files/* routes instead of /candidate/:uid/*) ✅
  - [x] POST /files/upload - Upload file (with optional candidateUid query param) ✅
  - [x] GET /files - List all files (optionally filter by candidateUid) ✅
  - [x] GET /files/:uid/download - Download file by UID ✅
  - [x] DELETE /files/:uid - Delete file ✅
- [x] Add file size and type validation ✅
  - [x] Max file size: 10MB ✅
  - [x] Allowed types: PDF, DOC, DOCX, TXT ✅
- [x] Run Prisma migration for FileUpload model ✅
- [x] Add automatic bucket creation on startup ✅
- [x] Fixed ES Module import issue with uuid (using crypto.randomUUID instead) ✅

**Frontend Tasks:**
- [x] Create FileUpload component with drag-and-drop support ✅
- [x] Add file upload to Candidate detail page (via UpdateCandidateDialog tabs) ✅
- [x] Add file list display with download/delete actions ✅
- [x] Add file upload progress indicator ✅
- [x] Add file type and size validation on frontend ✅
- [x] Create useUploadFile, useDownloadFile, useDeleteFile hooks ✅
- [x] Create useFiles hook for listing files ✅
- [x] Add toast notifications for upload success/error ✅
- [x] Install date-fns for file date formatting ✅
- [x] Create FileList component with icons and formatted dates ✅
- [x] Integrate file management into UpdateCandidateDialog with tabs ✅

**Testing:**
- [x] Test file upload with MinIO locally ✅
- [x] Test file download and signed URLs ✅
- [x] Test file deletion ✅
- [x] Test error handling for invalid file types/sizes ✅
- [x] Fixed uploadedById undefined error by using userUid lookup ✅
- [ ] Verify production S3 configuration works by switching env vars (requires production environment)

**Implementation Notes:**
- Frontend uses React Query for file operations with automatic cache invalidation
- FileUpload component supports drag-and-drop with visual feedback
- FileList component displays file metadata with icons based on file type (PDF, DOC, etc.)
- UpdateCandidateDialog enhanced with tabs to switch between candidate info and files
- All file operations include toast notifications for user feedback
- Files are associated with candidates via optional candidateUid parameter
- Backend uses userUid from JWT to lookup numeric user ID for database relations
- Package manager: ALWAYS use Yarn (documented in CLAUDE.md)

---

### Automatic Meeting Scheduling System

**Goal:** HR can provide their availability schedule, and candidates receive emails to select interview times. Also allow HR to manually schedule without candidate input.

**Backend Tasks:**

**1. HR Schedule Management:**
- [ ] Create HRSchedule entity in Prisma
  - [ ] Fields: id, uid, userId, dayOfWeek (enum: MON-SUN), startTime, endTime, isActive
  - [ ] Relations: user (HR User)
  - [ ] Index on userId for fast queries
- [ ] Add HRSchedule CRUD endpoints
  - [ ] POST /hr-schedule - Create availability slot
  - [ ] GET /hr-schedule/my-schedule - Get logged-in HR's schedule
  - [ ] GET /hr-schedule/user/:uid - Get specific HR's schedule
  - [ ] PUT /hr-schedule/:uid - Update availability slot
  - [ ] DELETE /hr-schedule/:uid - Delete availability slot
- [ ] Add bulk schedule creation endpoint
  - [ ] POST /hr-schedule/bulk - Create multiple slots at once

**2. Interview/Meeting Entity:**
- [ ] Create Interview entity in Prisma
  - [ ] Fields: id, uid, stageId, scheduledDate, scheduledTime, duration, status (enum: PENDING, SCHEDULED, COMPLETED, CANCELLED), meetingLink, notes, scheduledById, scheduledAt, createdAt
  - [ ] Relations: stage (Stage), scheduledBy (User - HR)
  - [ ] Status: PENDING (waiting for candidate), SCHEDULED (confirmed), COMPLETED, CANCELLED
- [ ] Add Interview CRUD endpoints
  - [ ] POST /interview - Create interview (manual scheduling by HR)
  - [ ] GET /interview/:uid - Get interview details
  - [ ] GET /interview/stage/:stageUid - Get all interviews for a stage
  - [ ] PUT /interview/:uid - Update interview
  - [ ] DELETE /interview/:uid - Delete/cancel interview

**3. Candidate Time Slot Selection:**
- [ ] Create InterviewTimeSlot entity in Prisma
  - [ ] Fields: id, uid, interviewId, date, startTime, endTime, isAvailable
  - [ ] Relations: interview (Interview)
- [ ] Add time slot generation logic
  - [ ] Service method to generate available slots based on HR schedule
  - [ ] Consider stage estimatedTime for slot duration
  - [ ] Generate slots for next 14 days by default
  - [ ] Exclude already booked time slots
- [ ] Add candidate selection endpoints
  - [ ] GET /interview/:uid/available-slots - Get available time slots for interview
  - [ ] POST /interview/:uid/select-slot - Candidate selects a time slot (public endpoint with token)
- [ ] Create interview invitation tokens
  - [ ] Generate secure token when sending invitation email
  - [ ] Token includes: interviewUid, candidateEmail, expiresAt
  - [ ] Validate token on slot selection

**4. Email System Integration:**
- [ ] Install email service dependencies
  - [ ] @nestjs-modules/mailer
  - [ ] nodemailer
  - [ ] handlebars (for email templates)
- [ ] Create EmailModule with EmailService
  - [ ] Configure SMTP settings from environment variables
  - [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
- [ ] Create email templates using Handlebars
  - [ ] interview-invitation.hbs - Invitation with link to select time
  - [ ] interview-scheduled.hbs - Confirmation after time selected
  - [ ] interview-manual-scheduled.hbs - Manual scheduling by HR
  - [ ] interview-reminder.hbs - Reminder 24h before interview
  - [ ] interview-cancelled.hbs - Cancellation notification
- [ ] Add email sending methods to EmailService
  - [ ] sendInterviewInvitation(candidate, interview, availableSlots, token)
  - [ ] sendInterviewConfirmation(candidate, hr, interview)
  - [ ] sendManualInterviewNotification(candidate, hr, interview)
  - [ ] sendInterviewReminder(candidate, hr, interview)
  - [ ] sendInterviewCancellation(candidate, hr, interview, reason)

**5. Google Calendar/Meet Integration:**
- [ ] Install Google APIs dependencies
  - [ ] googleapis
  - [ ] google-auth-library
- [ ] Create GoogleCalendarModule with GoogleCalendarService
- [ ] Set up Google OAuth2 credentials
  - [ ] Create Google Cloud Project
  - [ ] Enable Google Calendar API and Google Meet API
  - [ ] Create OAuth2 credentials (Client ID, Client Secret)
  - [ ] Add environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- [ ] Implement OAuth2 flow for HR users
  - [ ] Add googleCalendarToken field to User entity (encrypted)
  - [ ] POST /google/auth - Initiate OAuth flow
  - [ ] GET /google/callback - Handle OAuth callback
  - [ ] Store refresh token securely in database
- [ ] Implement Google Calendar integration methods
  - [ ] createCalendarEvent(hr, candidate, interview) - Creates event with Google Meet link
  - [ ] updateCalendarEvent(eventId, interview)
  - [ ] deleteCalendarEvent(eventId)
  - [ ] sendCalendarInvite(eventId, attendees[]) - Send invites to candidate email
- [ ] Automatically create Google Meet link when interview is scheduled
- [ ] Store Google Meet link in Interview entity (meetingLink field)

**6. Manual Scheduling by HR:**
- [ ] Add manual scheduling endpoint
  - [ ] POST /interview/manual - HR directly sets date/time without candidate selection
  - [ ] Creates interview, generates Google Meet link, sends notification email
- [ ] Add "Schedule Interview" button in Stage UI
  - [ ] Modal with date/time picker
  - [ ] Option: "Send invitation to candidate" or "Schedule directly"
  - [ ] If "send invitation": generates slots and sends email
  - [ ] If "schedule directly": creates interview and sends confirmation

**Frontend Tasks:**

**1. HR Schedule Management UI:**
- [ ] Create HRSchedule page (/hr-schedule)
  - [ ] Weekly calendar view showing availability
  - [ ] Add/Edit/Delete time slots
  - [ ] Bulk schedule creation (e.g., "Mon-Fri 9am-5pm")
- [ ] Create ScheduleDialog component
  - [ ] Day of week selector
  - [ ] Start time and end time pickers
  - [ ] Save/Cancel actions
- [ ] Add useHRSchedule hooks (useListSchedule, useCreateSchedule, useUpdateSchedule, useDeleteSchedule)
- [ ] Add "Manage Schedule" link in navbar for HR users

**2. Interview Scheduling UI:**
- [ ] Add "Schedule Interview" button to Stage cards in HiringProcessPage
- [ ] Create ScheduleInterviewDialog component
  - [ ] Toggle: "Send invitation to candidate" or "Schedule manually"
  - [ ] If manual: Date/time picker + duration
  - [ ] If invitation: Show preview of email
  - [ ] Display estimated time from stage
- [ ] Create useInterview hooks (useCreateInterview, useListInterviews, useUpdateInterview)
- [ ] Add interview list to Stage accordion
  - [ ] Show scheduled interviews with date/time
  - [ ] Status badges (Pending, Scheduled, Completed)
  - [ ] Google Meet link (if scheduled)
  - [ ] Cancel/Reschedule buttons

**3. Candidate Time Slot Selection (Public Page):**
- [ ] Create public route /interview/select/:token
  - [ ] Validate token
  - [ ] Display candidate name, stage name, HR name
  - [ ] Show calendar with available time slots
  - [ ] Highlight available slots in green
  - [ ] Click to select slot
  - [ ] Confirmation dialog before submitting
- [ ] Create InterviewSlotSelector component
  - [ ] Calendar view with available slots
  - [ ] Slot duration display
  - [ ] Selected slot highlight
  - [ ] Submit button
- [ ] Add success page after selection
  - [ ] Show confirmation message
  - [ ] Display selected date/time
  - [ ] Display Google Meet link (once HR confirms)

**4. Google Calendar OAuth Flow:**
- [ ] Add "Connect Google Calendar" button in user profile/settings
- [ ] Create GoogleAuthCallback page (/google/callback)
  - [ ] Handle OAuth callback
  - [ ] Display success/error message
  - [ ] Redirect back to settings
- [ ] Add "Connected" indicator in navbar/profile for HR users
- [ ] Add "Disconnect Google Calendar" option

**Testing:**
- [ ] Test HR schedule CRUD operations
- [ ] Test time slot generation based on HR schedule and stage duration
- [ ] Test email invitation sending (use Mailtrap or similar for dev)
- [ ] Test candidate slot selection flow (with token validation)
- [ ] Test Google Calendar integration (create/update/delete events)
- [ ] Test Google Meet link generation
- [ ] Test manual scheduling by HR
- [ ] Test interview reminders (24h before)
- [ ] Test interview cancellation flow
- [ ] Test conflicting time slot prevention

**Environment Variables to Add:**
```
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@recruitingtool.com

# Google Calendar/Meet
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/google/callback
```

---

### Stage Notes and Time Tracking

**Goal:** HR can add notes to each stage, and system automatically tracks time spent in each stage.

**Backend Tasks:**

**1. Stage Notes:**
- [ ] Create StageNote entity in Prisma
  - [ ] Fields: id, uid, stageId, content (text), createdById, createdAt, updatedAt
  - [ ] Relations: stage (Stage), createdBy (User - HR)
- [ ] Add StageNote endpoints
  - [ ] POST /stages/:uid/notes - Create note for stage
  - [ ] GET /stages/:uid/notes - List all notes for stage (ordered by date)
  - [ ] PUT /stage-notes/:uid - Update note
  - [ ] DELETE /stage-notes/:uid - Delete note
- [ ] Add notes to Stage response (include notes array when fetching stage)

**2. Stage Time Tracking:**
- [ ] Add time tracking fields to Stage entity
  - [ ] actualStartDate (DateTime, nullable) - When candidate entered this stage
  - [ ] actualEndDate (DateTime, nullable) - When candidate completed/exited this stage
  - [ ] actualDuration (Int, nullable) - Calculated duration in minutes
- [ ] Create StageHistory entity for tracking all stage transitions
  - [ ] Fields: id, uid, hiringProcessId, stageId, action (enum: ENTERED, COMPLETED, SKIPPED), timestamp, userId
  - [ ] Relations: hiringProcess, stage, user (who made the change)
- [ ] Add automatic time tracking logic
  - [ ] When stage status changes to CURRENT: set actualStartDate
  - [ ] When stage status changes to DONE: set actualEndDate, calculate actualDuration
  - [ ] Create StageHistory entry for each transition
- [ ] Add stage progression endpoint
  - [ ] POST /hiring-process/:uid/progress-stage - Move candidate to next stage
  - [ ] Marks current stage as DONE, sets next stage as CURRENT
  - [ ] Automatically updates time tracking fields
- [ ] Add time analytics endpoints
  - [ ] GET /stages/:uid/time-stats - Get time statistics for a stage
    - [ ] Average time spent across all hiring processes
    - [ ] Min/max time spent
    - [ ] Compare estimated vs actual time
  - [ ] GET /hiring-process/:uid/timeline - Get full timeline with stage durations

**3. Stage Status Management:**
- [ ] Update Stage status enum if needed (OPEN, CURRENT, DONE, SKIPPED, CANCELLED)
- [ ] Add stage skipping logic
  - [ ] POST /stages/:uid/skip - Skip a stage (mark as SKIPPED)
  - [ ] Records in StageHistory
  - [ ] Does not count toward time tracking

**Frontend Tasks:**

**1. Stage Notes UI:**
- [ ] Add "Notes" tab to StageAccordion component
- [ ] Create StageNotesList component
  - [ ] Display all notes with author and timestamp
  - [ ] Formatted text display (preserve line breaks)
  - [ ] Edit/Delete buttons (only for note author or admins)
- [ ] Create AddStageNoteDialog component
  - [ ] Multiline text input (TextField with multiline)
  - [ ] Character counter (optional, e.g., max 2000 chars)
  - [ ] Save/Cancel buttons
- [ ] Add "Add Note" button to stage cards
- [ ] Add useStageNotes hooks (useListNotes, useCreateNote, useUpdateNote, useDeleteNote)
- [ ] Show note count badge on stage cards (e.g., "3 notes")

**2. Stage Time Tracking UI:**
- [ ] Display time tracking information in stage cards
  - [ ] Show actualDuration if stage is completed
  - [ ] Show "In progress for X days/hours" if stage is current
  - [ ] Compare with estimatedTime (show variance: +2 days, -3 hours, etc.)
- [ ] Create StageTimeline component
  - [ ] Visual timeline showing all stages with durations
  - [ ] Color-coded: green (faster than estimated), red (slower than estimated)
  - [ ] Display start/end dates for each stage
- [ ] Add stage progression button
  - [ ] "Complete Stage & Progress" button on current stage
  - [ ] Confirmation dialog
  - [ ] Automatically marks current stage as DONE and moves to next
- [ ] Add skip stage option
  - [ ] "Skip Stage" button with reason input
  - [ ] Marks stage as SKIPPED
- [ ] Create StageAnalytics component (for job position detail page)
  - [ ] Average time per stage across all hiring processes
  - [ ] Chart showing estimated vs actual time
  - [ ] Bottleneck identification (stages taking longest)
- [ ] Add time tracking info to HiringProcess detail page
  - [ ] Total time in process
  - [ ] Time spent per stage
  - [ ] Expected completion date based on remaining estimated times

**3. Stage History/Audit Log:**
- [ ] Create StageHistoryLog component
  - [ ] Show all stage transitions with timestamps
  - [ ] "John Doe moved candidate to 'Technical Interview' stage"
  - [ ] Filterable by action type
- [ ] Add "History" tab to HiringProcess detail page

**Testing:**
- [ ] Test note creation/editing/deletion
- [ ] Test note permissions (only author can edit)
- [ ] Test time tracking when progressing stages
- [ ] Test time calculation accuracy
- [ ] Test stage skipping
- [ ] Test analytics calculations (average, min/max)
- [ ] Test timeline display with multiple stage transitions
- [ ] Verify StageHistory is created for all transitions

### Bug Fixes / Improvements

- [ ] Fix any TypeScript errors or warnings
- [ ] Improve mobile responsiveness
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)

---

## Completed Tasks

✅ Company management system with full CRUD operations
✅ Enhanced authentication flow with token-only storage
✅ Complete UI for candidates, companies, and hiring processes
✅ Job position detail page with stages and hiring processes
✅ Inline candidate creation in hiring process dialog
✅ Database migrations for Company system and optional jobPositionId in Stage
✅ Enhanced dummy data service with persistent seed data
✅ User avatar component and logout functionality
✅ Toast notification system with error/success/warning support
✅ Integrated toasts into all API hooks (auth, candidates, companies, hiring processes, job positions, stages)
✅ Automatic error messages with descriptive content from backend
✅ Success messages for all CRUD operations
✅ Company display on dashboard showing which company's data is being viewed
✅ Company name and HR user information in job position details
✅ Company name and HR manager information in hiring process details
✅ Enhanced hiring process entity to include company and job position creator details
✅ Fixed horizontal scroll issue on dashboard with proper table cell sizing
✅ Restricted candidates page access to ADMIN and SUPER_ADMIN roles only
✅ Hidden candidates navigation link for non-admin users
✅ Fixed dashboard table being cut off by using wider container layout (xl instead of md)
✅ Implemented dynamic container width based on page route
✅ Applied wider layout to dashboard, companies, and candidates pages
