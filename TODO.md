# TODO List - Recruiting Tool

## Instructions for AI Assistant

**IMPORTANT:** Once you complete and test a task from this list, create a git commit immediately with a clear, descriptive commit message. Do NOT push to remote - only commit locally.

---

## BUSINESS STRATEGY & PRICING ROADMAP

**Target Market:** Small companies (10-50 employees), IT-focused, US/English-speaking
**Positioning:** AI-First Recruiting Platform (competitive differentiation)
**Developer:** Solo developer using Claude for development
**Deployment:** Self-hosted option (Docker) + potential cloud SaaS later

### Recommended Pricing Strategy

**MODEL: Freemium with Usage-Based AI Credits**

#### Tier 1: Starter (FREE)
- **Price:** $0/month
- **Target:** Solo founders, very small teams (1-5 employees)
- **Features:**
  - 1 active job position
  - 25 applications/month
  - Basic applicant tracking
  - Email template library
  - Mobile-responsive careers page
  - Self-hosted Docker deployment
- **AI Credits:** 10 AI resume scores/month (to showcase AI value)
- **Limitations:** No interview scheduling, no analytics, no custom scorecards
- **Goal:** Viral growth through self-hosted deployments, demonstrate core value

#### Tier 2: Professional ($79/month)
- **Price:** $79/month (or $750/year - save $200)
- **Target:** Small HR teams (5-20 employees), startups with hiring needs
- **Features:**
  - Unlimited job positions
  - Unlimited applications
  - Automated interview scheduling + Google Calendar integration
  - Custom job application forms
  - Email automation (status notifications)
  - Collaborative hiring scorecards
  - Basic analytics dashboard
- **AI Credits:** 200 AI resume scores/month
- **Additional AI Credits:** $0.50 per score (beyond quota)
- **Value Prop:** Saves 15+ hours/week on scheduling and coordination ($2,000+/mo value)

#### Tier 3: Enterprise ($299/month)
- **Price:** $299/month (or $2,870/year - save $700)
- **Target:** Mid-size companies (20-50 employees), high-volume recruiting
- **Features:**
  - Everything in Professional
  - Advanced analytics & reporting (time-to-hire, cost-per-hire, ROI)
  - Custom branding (white-label careers page)
  - Priority support (24h response time)
  - SSO/SAML integration (future)
  - API access for integrations
  - Multi-company management (for agencies)
- **AI Credits:** Unlimited AI resume scores
- **Value Prop:** Complete recruiting ROI visibility, scales with growth

#### Add-On: Integration Marketplace
- **HRIS Integration (BambooHR, Gusto):** $29/month per integration
- **Job Board Auto-Posting (LinkedIn, Indeed):** $49/month
- **Background Check Integration (Checkr):** $39/month + per-check fees
- **Revenue Share:** 20-30% from partner integrations

### API Cost Management Strategy

**Challenge:** Low budget initially, no clients yet

**Solutions:**

1. **Defer Heavy AI Features Until Revenue**
   - Focus on Quick Wins first (Email templates, mobile careers page, notifications)
   - Launch with Professional tier WITHOUT AI initially
   - Add AI features once you have 10+ paying customers ($790/mo revenue to cover API costs)

2. **Strict Quota Enforcement**
   - Hard limits on free tier (10 scores/month = $0.10 in API costs)
   - Cache AI scores aggressively (90-day TTL)
   - Use GPT-3.5-turbo ($0.001/1K tokens) instead of GPT-4 ($0.03/1K tokens)
   - Estimate: 200 scores/month = ~$20 in API costs (covered by $79 Professional tier)

3. **Usage-Based Pricing for Overages**
   - $0.50 per additional AI score (10x markup on $0.05 cost)
   - Customers pre-pay for credit packs (100 credits = $40)
   - Email warnings at 80% quota usage

4. **Monitor and Alert**
   - Track API costs per customer in real-time
   - Auto-disable AI features if customer exceeds quota without payment
   - Monthly cost reports for profitability analysis

### Go-To-Market Timeline

**Month 1-2 (QUICK WINS PHASE):**
- [ ] Build Quick Win features (email templates, mobile careers, notifications, custom forms)
- [ ] Polish existing features (fix bugs, improve UX)
- [ ] Create landing page with demo video
- [ ] Launch free self-hosted tier
- [ ] Goal: 50 free self-hosted deployments, gather feedback

**Month 3-4 (MONETIZATION PHASE):**
- [ ] Build Automated Interview Scheduling (highest ROI, no AI costs)
- [ ] Build Collaborative Scorecards (differentiation, no AI costs)
- [ ] Add billing system (Stripe integration)
- [ ] Launch Professional tier ($79/mo)
- [ ] Outreach to beta testers: "Upgrade for scheduling + scorecards"
- [ ] Goal: 5 paying customers ($395/mo recurring revenue)

**Month 5-6 (AI DIFFERENTIATION PHASE):**
- [ ] Build AI Resume Screening with quota management
- [ ] Build Analytics Dashboard
- [ ] Launch Enterprise tier ($299/mo)
- [ ] Create case studies from early customers
- [ ] Goal: 15 Professional + 3 Enterprise customers ($1,900/mo revenue)

**Month 7-8 (SCALE & INTEGRATIONS):**
- [ ] Build first 2 integrations (BambooHR + LinkedIn job posting)
- [ ] Add white-label branding for Enterprise
- [ ] Implement referral program (give 1 month free, get 1 month free)
- [ ] Goal: 30 Professional + 8 Enterprise customers ($4,770/mo revenue)

**Month 9-12 (PRODUCT-LED GROWTH):**
- [ ] Build integration marketplace (3-5 more integrations)
- [ ] Add advanced analytics features
- [ ] Optimize AI costs and expand free tier AI quota
- [ ] Launch affiliate program for HR consultants
- [ ] Goal: 100 customers, $15,000+ MRR

### Sales Approach

**PRIMARY: Self-Serve + Product-Led Growth**
- Self-hosted free tier creates viral distribution
- In-app upgrade prompts when users hit limits
- Automated email drip campaign after signup
- Free trial of Professional tier (14 days, no credit card)

**SECONDARY: Content Marketing**
- Blog posts on hiring best practices (SEO for "how to screen resumes with AI")
- Open-source parts of the codebase (get developer community awareness)
- Case studies showing time/cost savings

**AVOID (for now):**
- Sales team (too expensive for solo dev)
- Enterprise sales (defer until $50k+ MRR)
- Paid ads (expensive for low-traffic SaaS)

### Key Metrics to Track

- **Free to Paid Conversion:** Target 5-10% of free users upgrade
- **Monthly Churn:** Target <5% for Professional, <2% for Enterprise
- **Customer Acquisition Cost (CAC):** Keep under $200 via self-serve
- **Lifetime Value (LTV):** Target $2,000+ (25+ months retention)
- **AI Cost per Customer:** Keep under 20% of subscription price
- **Time to First Value:** <10 minutes from signup to first candidate added

---

## Current Tasks

### HIGH PRIORITY - QUICK WINS (Complete This Month)

**Goal:** Build traction with small, high-impact features that demonstrate value to early adopters.

- [ ] **Email Template Library** (1-2 days)
  - [ ] Create EmailTemplate entity (name, subject, body with Handlebars variables)
  - [ ] Add CRUD endpoints for email templates
  - [ ] Create template management UI (list, create, edit, delete)
  - [ ] Pre-seed common templates (rejection, interview invitation, offer, etc.)
  - [ ] Add template selector when sending emails
  - [ ] Support variables: {{candidateName}}, {{positionTitle}}, {{companyName}}, {{hrName}}
  - [ ] Value: Saves HR 30+ min/day on email composition

- [ ] **Mobile-Responsive Careers Page** (2-3 days)
  - [ ] Fix layout for mobile devices (viewport meta tag, responsive grid)
  - [ ] Optimize font sizes and spacing for small screens
  - [ ] Test on mobile devices (Chrome DevTools mobile emulation)
  - [ ] Add loading states for slow connections
  - [ ] Compress images and optimize assets
  - [ ] Value: Capture 30-40% more applications from mobile users

- [ ] **Application Status Email Notifications** (2-3 days)
  - [ ] Add automatic email trigger when application status changes
  - [ ] Create status change email templates (Under Review, Interview Scheduled, Rejected, Offer)
  - [ ] Add email preferences to candidate entity (optional opt-out)
  - [ ] Log all sent emails in database for audit trail
  - [ ] Value: Reduces candidate support emails by 70%, improves candidate experience

- [ ] **Custom Job Application Forms** (3-4 days)
  - [ ] Add customQuestions JSON field to JobPosition entity
  - [ ] Create UI for HR to add custom questions (text, multiple choice, file upload)
  - [ ] Update application form to render custom questions dynamically
  - [ ] Store custom question answers in Application entity (JSON field)
  - [ ] Display custom answers in application detail page
  - [ ] Value: Enables role-specific screening questions

### HIGH PRIORITY - CORE FEATURES

- [x] **Remove ID relations and use UID relations throughout the entire system** ✅ **COMPLETED**
  - [x] Keep Prisma internal relations using IDs ✅
  - [x] Add UID-based relations on the backend (services and controllers) ✅
  - [x] Update all DTOs to use UIDs instead of IDs ✅
  - [x] Update frontend to only work with UIDs ✅
  - [x] Migrate existing endpoints to use UIDs for all relations ✅
  - [x] Test all CRUD operations with UID-based relations ✅
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

## HIGH-REVENUE AI FEATURES (Implement After Quick Wins)

**Goal:** Build AI-first competitive advantage that justifies premium pricing.

### AI-Powered Resume Screening & Ranking (3-4 weeks)

**Business Value:** Premium tier feature ($99-$149/mo) - saves customers $2,400/mo in manual screening time

**Backend Tasks:**
- [ ] Install OpenAI SDK (@openai/api)
- [ ] Create AIService module with OpenAI client configuration
- [ ] Add OPENAI_API_KEY environment variable
- [ ] Create resume parsing endpoint
  - [ ] POST /ai/parse-resume - Accepts resume file, returns structured data
  - [ ] Extract: name, email, phone, skills, experience, education, summary
  - [ ] Store parsed data in Candidate entity (new JSON field: aiParsedData)
- [ ] Create candidate scoring endpoint
  - [ ] POST /ai/score-candidate - Accepts candidateUid + jobPositionUid
  - [ ] AI analyzes resume against job description
  - [ ] Returns score (1-100), strengths, weaknesses, match reasons
  - [ ] Store in new CandidateScore entity (candidateId, jobPositionId, score, analysis JSON, scoredAt)
- [ ] Create batch scoring endpoint
  - [ ] POST /ai/batch-score - Score all candidates for a job position
  - [ ] Implements queue system to avoid API rate limits
  - [ ] Returns job ID to check progress
- [ ] Add AI scoring triggers
  - [ ] Automatic scoring when candidate applies to job
  - [ ] Re-score when job description changes (optional, costs API credits)
- [ ] Create ranking endpoint
  - [ ] GET /job-positions/:uid/ranked-candidates - Returns candidates sorted by AI score
  - [ ] Filter by minimum score threshold
  - [ ] Flag top 10% as "Highly Recommended"
- [ ] Add usage tracking for API cost management
  - [ ] Track OpenAI API calls per company/user
  - [ ] Add monthly quota limits based on pricing tier
  - [ ] Warning emails when approaching quota

**Frontend Tasks:**
- [ ] Add "AI Score" column to candidate lists
  - [ ] Display score badge (1-100) with color coding (green >80, yellow 60-79, red <60)
  - [ ] Show "Highly Recommended" badge for top 10%
- [ ] Create AI Analysis Dialog
  - [ ] Click on score to see detailed analysis
  - [ ] Display strengths, weaknesses, match reasons
  - [ ] Show parsed resume data
- [ ] Add "Rank Candidates" button to job position detail page
  - [ ] Trigger batch AI scoring
  - [ ] Show progress indicator
  - [ ] Display ranked list when complete
- [ ] Add AI insights to hiring process page
  - [ ] Show AI score next to candidate name
  - [ ] Quick view of top match reasons
- [ ] Create AI usage dashboard (Admin only)
  - [ ] Monthly API call count
  - [ ] Cost estimates
  - [ ] Quota usage progress bar

**Cost Management Strategy:**
- [ ] Implement tiered quotas (Starter: 50 scores/mo, Professional: 200/mo, Enterprise: unlimited)
- [ ] Cache AI scores (don't re-score unless resume/job description changes)
- [ ] Use GPT-3.5-turbo for cost efficiency (vs GPT-4)
- [ ] Batch requests to reduce API overhead

**Testing:**
- [ ] Test resume parsing with various formats (PDF, DOCX, TXT)
- [ ] Test scoring accuracy with sample resumes and job descriptions
- [ ] Test quota enforcement
- [ ] Test batch scoring performance (100+ candidates)

---

### Collaborative Hiring Scorecards (2 weeks)

**Business Value:** Professional tier feature ($79/mo) - improves hiring quality and compliance

**Backend Tasks:**
- [ ] Create ScorecardTemplate entity
  - [ ] Fields: id, uid, name, description, companyId, criteria (JSON array)
  - [ ] Criteria structure: [{name, description, weight, scoreType: "1-5" | "1-10" | "yes/no"}]
  - [ ] Relations: company
- [ ] Create InterviewScorecard entity
  - [ ] Fields: id, uid, interviewId, templateId, interviewerId, scores (JSON), overallScore, recommendation (STRONG_YES, YES, MAYBE, NO, STRONG_NO), comments, submittedAt
  - [ ] Relations: interview, template, interviewer (User)
- [ ] Add scorecard CRUD endpoints
  - [ ] POST /scorecard-templates - Create template
  - [ ] GET /scorecard-templates - List company templates
  - [ ] POST /interviews/:uid/scorecards - Submit scorecard for interview
  - [ ] GET /interviews/:uid/scorecards - Get all scorecards for interview
  - [ ] GET /interviews/:uid/consensus - Calculate aggregated scores
- [ ] Add consensus calculation logic
  - [ ] Average scores across all interviewers
  - [ ] Show distribution of recommendations
  - [ ] Flag disagreements (variance >2 points on any criterion)

**Frontend Tasks:**
- [ ] Create ScorecardTemplate management page
  - [ ] List templates with edit/delete
  - [ ] Create template dialog with criteria builder
  - [ ] Drag-to-reorder criteria
- [ ] Create InterviewScorecard form
  - [ ] Render criteria dynamically based on template
  - [ ] Sliders/radio buttons for scores
  - [ ] Comments text area
  - [ ] Overall recommendation selector
- [ ] Add scorecard section to interview detail page
  - [ ] List all submitted scorecards
  - [ ] Show consensus view (aggregated scores)
  - [ ] Highlight disagreements
  - [ ] Download as PDF for compliance
- [ ] Create consensus visualization
  - [ ] Bar chart showing score distribution per criterion
  - [ ] Pie chart of recommendations
  - [ ] Table of individual scorecard summaries

**Testing:**
- [ ] Test scorecard template creation with various criteria types
- [ ] Test scorecard submission by multiple interviewers
- [ ] Test consensus calculation accuracy
- [ ] Test access control (only assigned interviewers can submit)

---

### Analytics Dashboard & Reporting (2-3 weeks)

**Business Value:** Enables Enterprise pricing tier ($299/mo) - provides ROI visibility

**Backend Tasks:**
- [ ] Create AnalyticsService with metrics calculations
  - [ ] Time-to-hire (average days from job posted to offer accepted)
  - [ ] Cost-per-hire (total recruiting costs / number of hires)
  - [ ] Pipeline conversion rates (applicants -> interviews -> offers -> hires)
  - [ ] Source effectiveness (which job boards/sources yield best candidates)
  - [ ] Stage bottlenecks (which stages take longest)
- [ ] Add analytics endpoints
  - [ ] GET /analytics/time-to-hire - Filterable by date range, job position, department
  - [ ] GET /analytics/cost-per-hire - Include breakdown by cost type
  - [ ] GET /analytics/pipeline - Funnel data with conversion rates
  - [ ] GET /analytics/sources - Application sources with quality metrics
  - [ ] GET /analytics/stage-performance - Average time per stage
- [ ] Add application source tracking
  - [ ] Add source field to Application entity (LinkedIn, Indeed, Referral, Direct, etc.)
  - [ ] Track UTM parameters from job board links
  - [ ] Store in applicant submission
- [ ] Add cost tracking
  - [ ] Create RecruitingCost entity (costType, amount, jobPositionId, date, description)
  - [ ] Cost types: Job Board Fees, Agency Fees, Advertising, Events, Software, Other
  - [ ] CRUD endpoints for cost entry

**Frontend Tasks:**
- [ ] Create Analytics dashboard page (/analytics)
  - [ ] KPI cards: Avg Time-to-Hire, Avg Cost-per-Hire, Total Hires This Month, Open Positions
  - [ ] Date range selector (last 30 days, 90 days, year, custom)
  - [ ] Filter by department, job position, location
- [ ] Create Time-to-Hire chart
  - [ ] Line chart showing trend over time
  - [ ] Compare against industry benchmarks
  - [ ] Breakdown by job position type
- [ ] Create Pipeline Funnel visualization
  - [ ] Funnel chart: Applicants -> Screened -> Interviewed -> Offered -> Hired
  - [ ] Show drop-off rates at each stage
  - [ ] Click to drill down into specific stage
- [ ] Create Source Effectiveness table
  - [ ] Columns: Source, Applications, Interviews, Hires, Conversion Rate, Avg Quality Score
  - [ ] Sort by conversion rate or quality
  - [ ] Cost per hire by source
- [ ] Create Stage Performance heatmap
  - [ ] Show bottleneck stages in red
  - [ ] Average time vs estimated time comparison
  - [ ] Identify process improvements
- [ ] Add export functionality
  - [ ] Export to CSV
  - [ ] Export to PDF report with charts
  - [ ] Schedule automated weekly/monthly reports (future enhancement)

**Testing:**
- [ ] Test calculation accuracy with sample data
- [ ] Test filters and date range selection
- [ ] Test export to CSV/PDF
- [ ] Verify performance with large datasets (1000+ applications)

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
