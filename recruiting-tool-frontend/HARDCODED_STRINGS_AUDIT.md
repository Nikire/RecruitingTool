# Hardcoded Strings Audit - Issue #42

## Summary
Comprehensive audit of all hardcoded user-facing strings in the React frontend.

## Files with Hardcoded Strings

### Components

#### components/candidate/CandidateNotes.tsx
- "Please save the candidate first before adding notes." (line 40)
- "Add New Note" (line 107)
- "Enter your note here..." (placeholder, line 113)
- "Adding..." (line 123)
- "Add Note" (line 123)
- "Notes ({count})" (line 130)
- "Saving..." (line 155)
- "Save" (line 155)
- "Cancel" (line 162)
- "Are you sure you want to delete this note?" (confirm, line 89)
- "By {author} • {date}" (line 194)
- "No notes yet. Add one above!" (line 205)

#### components/forms/CustomQuestionBuilder.tsx
- "Custom Screening Questions" (line 129)
- "Add Question" (line 131)
- "Question text is required" (alert, line 71)
- "Please add at least 2 options..." (alert, line 76)
- "Edit Question" / "Add Question" (line 183)
- "Question Text" (label, line 187)
- "e.g., Years of experience with React?" (placeholder, line 192)
- "Question Type" (label, line 196)
- "Short Text" (menu item, line 212)
- "Long Text" (menu item, line 213)
- "Multiple Choice" (menu item, line 214)
- "Checkboxes" (menu item, line 215)
- "Required" (label, line 226)
- "Options" (line 232)
- "Add an option and press Enter" (placeholder, line 249)
- "Cancel" (line 261)
- "Update" / "Add" (line 263)
- "Type: {type}" (line 151)
- "Required" (chip, line 148)

#### components/forms/CustomQuestionRenderer.tsx
- "Enter your answer..." (placeholder, lines 48, 70)
- "Screening Questions" (line 166)
- "No answer provided" (line 13)

#### components/interview/InterviewCard.tsx
- "Not scheduled" (line 101)
- "Invalid date" (line 105)
- "Not set" (line 110, 205)
- "hour(s)" / "minute(s)" (lines 116-118)
- "Interview" (heading, line 139)
- "Mark as Completed" (tooltip, line 151)
- "Edit Interview" (tooltip, line 164)
- "Cancel Interview" (tooltip, line 169)
- "Delete Interview" (tooltip, line 181)
- "Date:" / "Time:" / "Duration:" (labels, lines 198, 205, 212)
- "Join Meeting" (button, line 229)
- "Notes:" (label, line 240)
- "Scheduled by: {name}" (line 253)
- "Delete Interview" (title, line 264)
- "Are you sure you want to delete this interview? This action cannot be undone." (line 265)
- "Cancel Interview" (title, line 272)
- "Are you sure you want to cancel this interview? An email notification will be sent to the candidate." (line 273)

#### components/files/FileList.tsx
- "Failed to load files. Please try again later." (line 94)
- "No files uploaded yet" (line 104)
- "Download" (tooltip, line 149)
- "Delete" (tooltip, line 158)
- "Delete File" (title, line 178)
- "Are you sure you want to delete \"{filename}\"? This action cannot be undone." (line 179)

#### components/job-positions/StageItem.tsx
- "Edit stage" (aria-label, line 94)
- "Delete stage" (aria-label, line 104)
- "Estimated: {time} minutes" (line 143)

#### components/job-positions/JobPositionsManagementList.tsx
- Table headers: "Job Title", "Company", "Status", "Stages", "Hiring Processes", "Created By", "Actions" (lines 76-82)
- "Edit job position" (tooltip, line 94)
- "Delete job position" (tooltip, line 103)
- "Delete Job Position" (title, line 129)

### Pages

#### pages/profile/ProfilePage.tsx
- "No user data available" (line 100)
- "My Profile" (line 116)
- "Reset" (button, line 124)
- "Saving..." (line 132)
- "Update Profile" (line 132)
- "Basic Information" (section heading, line 244)
- "Full Name" (label, line 250)
- "Email Address" (label, line 262)
- "Phone Number" (label, line 281)
- "+1-555-0123" (placeholder, line 282)
- "Professional Information" (section heading, line 298)
- "Position" (label, line 305)
- "e.g., Senior HR Manager" (placeholder, line 306)
- "Department" (label, line 316)
- "e.g., Human Resources" (placeholder, line 318)
- "Additional Information" (section heading, line 332)
- "Timezone" (label, line 340)
- "e.g., America/New_York" (placeholder, line 341)
- "LinkedIn Profile" (label, line 351)
- "https://linkedin.com/in/username" (placeholder, line 352)
- "About You" (section heading, line 368)
- "Bio" (label, line 373)
- "Tell us about yourself, your experience, and what you're passionate about..." (placeholder, line 374)
- "Name is required" / "Email is required" / "Invalid email address" (validation, lines 251, 265, 268)

#### pages/admin/applications/ApplicationsPage.tsx
- "Job Applications" (heading, line 49)
- "Filter by Status" (label, line 55)

#### pages/admin/email-templates/EmailTemplatesPage.tsx
- "Email Templates" (heading, line 75)
- "Search templates by name, subject, or content..." (placeholder)
- Table headers: "Name", "Subject", "Default", "Created By", "Created At", "Actions" (lines 112-117)
- "Edit template" (tooltip)
- "Delete template" (tooltip)

#### pages/auth/Login.tsx
- "Login" (heading, line 30)

#### pages/auth/Logout.tsx
- "Logging out..." (line 33)

#### pages/auth/Signup.tsx
- "Sign Up" (heading, line 31)

#### pages/companies/CompaniesPage.tsx
- "Company Management" (heading, line 66)
- "Create New Company" (dialog title, line 92)
- "Cancel" (button, line 113)

#### pages/hiring-process/HiringProcessPage.tsx
- "No data found" (line 36)

#### pages/job-position-detail/JobPositionDetailPage.tsx
- Table headers: "Title", "Status", "Candidate", "Actions" (lines 199-202)

## Translation Keys Needed

### New Translation Structure
Will add these new namespaces and keys to en.json and es.json:

```json
{
  "notes": {
    "save_candidate_first": "Please save the candidate first before adding notes.",
    "add_new_note": "Add New Note",
    "enter_note_placeholder": "Enter your note here...",
    "adding": "Adding...",
    "add_note": "Add Note",
    "notes_count": "Notes ({{count}})",
    "by_author_date": "By {{author}} • {{date}}",
    "no_notes_yet": "No notes yet. Add one above!",
    "delete_confirmation": "Are you sure you want to delete this note?"
  },
  "custom_questions": {
    "title": "Custom Screening Questions",
    "question_text_label": "Question Text",
    "question_text_placeholder": "e.g., Years of experience with React?",
    "question_type_label": "Question Type",
    "short_text": "Short Text",
    "long_text": "Long Text",
    "multiple_choice": "Multiple Choice",
    "checkboxes": "Checkboxes",
    "required_label": "Required",
    "options_label": "Options",
    "add_option_placeholder": "Add an option and press Enter",
    "edit_question": "Edit Question",
    "add_question": "Add Question",
    "update": "Update",
    "add": "Add",
    "type_label": "Type: {{type}}",
    "required_chip": "Required",
    "text_required_alert": "Question text is required",
    "options_required_alert": "Please add at least 2 options for multiple choice or checkbox questions",
    "screening_questions": "Screening Questions",
    "answer_placeholder": "Enter your answer...",
    "no_answer": "No answer provided"
  },
  "interview": {
    "title": "Interview",
    "not_scheduled": "Not scheduled",
    "invalid_date": "Invalid date",
    "not_set": "Not set",
    "hour": "hour",
    "hours": "hours",
    "minute": "minute",
    "minutes": "minutes",
    "mark_completed_tooltip": "Mark as Completed",
    "edit_tooltip": "Edit Interview",
    "cancel_tooltip": "Cancel Interview",
    "delete_tooltip": "Delete Interview",
    "date_label": "Date:",
    "time_label": "Time:",
    "duration_label": "Duration:",
    "join_meeting": "Join Meeting",
    "notes_label": "Notes:",
    "scheduled_by": "Scheduled by: {{name}}",
    "delete_title": "Delete Interview",
    "delete_confirmation": "Are you sure you want to delete this interview? This action cannot be undone.",
    "cancel_title": "Cancel Interview",
    "cancel_confirmation": "Are you sure you want to cancel this interview? An email notification will be sent to the candidate."
  },
  "files": {
    "error_loading": "Failed to load files. Please try again later.",
    "no_files_yet": "No files uploaded yet",
    "download_tooltip": "Download",
    "delete_tooltip": "Delete",
    "delete_title": "Delete File",
    "delete_confirmation": "Are you sure you want to delete \"{{filename}}\"? This action cannot be undone."
  },
  "stage_item": {
    "edit_aria": "Edit stage",
    "delete_aria": "Delete stage",
    "estimated_time": "Estimated: {{time}} minutes"
  },
  "job_positions_table": {
    "header_job_title": "Job Title",
    "header_company": "Company",
    "header_status": "Status",
    "header_stages": "Stages",
    "header_hiring_processes": "Hiring Processes",
    "header_created_by": "Created By",
    "header_actions": "Actions",
    "edit_tooltip": "Edit job position",
    "delete_tooltip": "Delete job position",
    "delete_title": "Delete Job Position"
  },
  "profile_page": {
    "no_user_data": "No user data available",
    "my_profile": "My Profile",
    "reset": "Reset",
    "basic_info": "Basic Information",
    "full_name": "Full Name",
    "email_address": "Email Address",
    "phone_number": "Phone Number",
    "professional_info": "Professional Information",
    "position": "Position",
    "department": "Department",
    "additional_info": "Additional Information",
    "timezone": "Timezone",
    "linkedin_profile": "LinkedIn Profile",
    "about_you": "About You",
    "bio": "Bio"
  },
  "applications_page": {
    "title": "Job Applications",
    "filter_by_status": "Filter by Status"
  },
  "email_templates_page": {
    "title": "Email Templates",
    "search_placeholder": "Search templates by name, subject, or content...",
    "table_name": "Name",
    "table_subject": "Subject",
    "table_default": "Default",
    "table_created_by": "Created By",
    "table_created_at": "Created At",
    "table_actions": "Actions",
    "edit_tooltip": "Edit template",
    "delete_tooltip": "Delete template"
  },
  "auth": {
    "login_title": "Login",
    "signup_title": "Sign Up",
    "logging_out": "Logging out..."
  },
  "companies_page": {
    "title": "Company Management",
    "create_dialog_title": "Create New Company"
  },
  "hiring_process_page": {
    "no_data_found": "No data found"
  },
  "job_position_detail": {
    "table_title": "Title",
    "table_status": "Status",
    "table_candidate": "Candidate",
    "table_actions": "Actions"
  }
}
```

## Files to Update
- Total files with hardcoded strings: ~25+
- Total hardcoded strings found: ~150+

## Next Steps
1. Update en.json with all new translation keys
2. Update es.json with Spanish translations
3. Update each component file to use t() function
4. Ensure all components import useTranslation
5. Test all changes
6. Rebuild Docker containers
