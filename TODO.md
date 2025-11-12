# TODO List - Recruiting Tool

## Instructions for AI Assistant

**IMPORTANT:** Once you complete and test a task from this list, create a git commit immediately with a clear, descriptive commit message. Do NOT push to remote - only commit locally.

---

## Current Tasks

### High Priority

- [x] Change the existing searchbars to the same format of JobPositionsPage (searchbar outside, send parameters to a list component and inside the list component make the API call.) ✅
- [x] Fill the input values with the values that are on Jotai search. ✅
- [x] **Add toast notifications for success/error/warning messages across the app** ✅
- [ ] Add update/delete functionality for Candidates
- [ ] Add update/delete functionality for Companies
- [ ] Add update/delete functionality for Hiring Processes

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

- [ ] Add file upload support for candidate resumes
- [ ] Add email notifications for stage changes
- [ ] Add analytics/reporting dashboard
- [ ] Add export functionality (CSV/PDF reports)

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
