# Team Management

Guide to managing users, roles, and permissions in BorderLess.

## Overview

Team management allows you to:
- Create and manage user accounts
- Assign roles with different permission levels
- Deactivate/reactivate users
- Track user activity

## User Roles

### USER
**Basic Access**
- View candidates, job positions, hiring processes
- View assigned interviews
- Submit interview scorecards
- Add notes to candidates

**Cannot:**
- Create or edit candidates
- Create job positions
- Manage hiring processes
- Access admin panel

**Use Case:** Panel interviewers, department heads who participate in hiring but don't manage the process.

### HR
**Hiring Management**
- All USER permissions, plus:
- Create and edit candidates
- Create and manage job positions
- Create and manage hiring processes
- Schedule interviews
- Review applications
- Access admin panel (candidates, applications)

**Cannot:**
- Manage users
- Manage companies
- Delete users
- Access super admin features

**Use Case:** Recruiters, HR coordinators, hiring managers.

### ADMIN
**Full Administrative Access**
- All HR permissions, plus:
- Create and manage users (except delete)
- Create and manage companies
- Access full admin panel
- View all analytics and reports
- Manage email templates
- Deactivate users

**Cannot:**
- Delete users permanently
- Purge candidate data (GDPR)

**Use Case:** HR directors, operations managers.

### SUPER_ADMIN
**System Administrator**
- All ADMIN permissions, plus:
- Delete users permanently
- Purge candidate data (GDPR compliance)
- Access all system features
- Manage critical system settings

**Use Case:** System administrators, founders, compliance officers.

## Creating Users

### Admin Access Required

Only ADMIN and SUPER_ADMIN can create users.

**Steps:**
1. Navigate to **Admin Panel** → **Users**
2. Click **Create User** button
3. Fill in user form:
   - **Name** (required): Full name
   - **Email** (required): Must be unique within company
   - **Password** (required): Temporary password
   - **Roles** (required): Select one or more roles
   - **Company** (required): Assign to company
   - **Position**: Job title (optional)
   - **Department**: Department name (optional)

4. Click **Create**

**Email Notification:**
- User receives email with login credentials
- Prompted to change password on first login

### Role Assignment

**Single Role:**
- Most users have one role (USER, HR, or ADMIN)

**Multiple Roles:**
- Users can have multiple roles if needed
- Highest permission level applies
- Example: `["HR", "ADMIN"]` gives full admin access

## Managing Users

### Viewing Users

**User List:**
1. Navigate to **Admin Panel** → **Users**
2. View all users in your company
3. See: Name, email, roles, status (active/inactive)

**User Detail:**
1. Click on user name
2. View complete profile:
   - Personal information
   - Assigned roles
   - Activity log (if available)
   - Created/updated timestamps

### Editing Users

1. From user detail page
2. Click **Edit** button
3. Update any field:
   - Name
   - Email
   - Roles
   - Position
   - Department
4. Click **Save**

**Note:** Cannot change user's company after creation.

### Changing User Passwords

**As Admin:**
1. Edit user
2. Enter new temporary password
3. Save
4. User must change password on next login

**As User (Self):**
1. Navigate to **Profile** page
2. Click **Change Password**
3. Enter current password
4. Enter new password
5. Confirm new password
6. Save

### Deactivating Users

**Purpose:** Temporarily disable user access without deleting account.

**Steps:**
1. Navigate to user detail
2. Click **Deactivate** button
3. Confirm deactivation

**Effect:**
- User cannot login
- All data preserved
- Can be reactivated anytime

**Use Cases:**
- Employee on leave
- Contractor engagement ended
- Temporary suspension

### Reactivating Users

1. Find deactivated user in user list
2. Click on user name
3. Click **Reactivate** button
4. User can login again

### Deleting Users (SUPER_ADMIN only)

**Permanent Deletion:**
1. Navigate to user detail
2. Click **Delete** button
3. Confirm deletion
4. User account permanently removed

**Cascade Effects:**
- Hiring processes where user was creator: creator set to NULL
- Candidate notes: preserved with author information
- Interview schedules: preserved with scheduler information
- All user data permanently removed

**Warning:** This action is irreversible!

## User Profile Management

### Viewing Profile

**Own Profile:**
1. Click profile icon in navbar
2. Select **Profile**
3. View your information:
   - Name, email
   - Company
   - Roles
   - Position, department
   - Profile picture

### Editing Profile

1. From profile page
2. Click **Edit** button
3. Update editable fields:
   - Name
   - Phone number
   - Position
   - Department
   - Bio
   - LinkedIn URL
   - Timezone
   - Profile picture

4. Click **Save**

**Note:** Cannot change email, company, or roles yourself. Contact admin.

### Profile Picture

**Upload Picture:**
1. Edit profile
2. Click **Upload Photo** button
3. Select image file (JPG, PNG)
4. Crop if needed
5. Save

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- Max size: 5MB

## User Activity Tracking

### Activity Log

Track user actions (future feature):
- Login/logout events
- Candidate created/edited
- Hiring process actions
- Interview schedules
- Note additions

**View Activity:**
1. Navigate to **Admin Panel** → **Users**
2. Click on user name
3. View **Activity Log** tab

## Company Management

### Creating Companies (SUPER_ADMIN only)

1. Navigate to **Admin Panel** → **Companies**
2. Click **Create Company** button
3. Fill in company details:
   - **Name** (required)
   - **Description**
4. Click **Create**

### Editing Companies

1. From companies list
2. Click on company name
3. Click **Edit** button
4. Update fields
5. Save

### Multi-Tenant Isolation

**Data Isolation:**
- Each company's data is completely isolated
- Users can only see data from their own company
- Job positions, candidates, hiring processes are company-specific

**SUPER_ADMIN Exception:**
- Can view and manage all companies
- Can switch between companies in UI
- Required for platform administration

## Permissions Matrix

| Feature | USER | HR | ADMIN | SUPER_ADMIN |
|---------|------|-----|-------|-------------|
| **Users** |
| View users | ✅ | ✅ | ✅ | ✅ |
| Create users | ❌ | ❌ | ✅ | ✅ |
| Edit users | ❌ | ❌ | ✅ | ✅ |
| Deactivate users | ❌ | ❌ | ✅ | ✅ |
| Delete users | ❌ | ❌ | ❌ | ✅ |
| **Companies** |
| View companies | ❌ | ❌ | ✅ | ✅ |
| Create companies | ❌ | ❌ | ❌ | ✅ |
| Edit companies | ❌ | ❌ | ✅ | ✅ |
| Delete companies | ❌ | ❌ | ❌ | ✅ |
| **Candidates** |
| View candidates | ✅ | ✅ | ✅ | ✅ |
| Create candidates | ❌ | ✅ | ✅ | ✅ |
| Edit candidates | ❌ | ✅ | ✅ | ✅ |
| Delete candidates | ❌ | ✅ | ✅ | ✅ |
| Purge candidates (GDPR) | ❌ | ❌ | ❌ | ✅ |
| **Job Positions** |
| View job positions | ✅ | ✅ | ✅ | ✅ |
| Create job positions | ❌ | ✅ | ✅ | ✅ |
| Edit job positions | ❌ | ✅ | ✅ | ✅ |
| Delete job positions | ❌ | ✅ | ✅ | ✅ |
| **Hiring Process** |
| View hiring processes | ✅ | ✅ | ✅ | ✅ |
| Create hiring processes | ❌ | ✅ | ✅ | ✅ |
| Edit hiring processes | ❌ | ✅ | ✅ | ✅ |
| Delete hiring processes | ❌ | ✅ | ✅ | ✅ |
| **Interviews** |
| View interviews | ✅ | ✅ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ✅ | ✅ |
| Submit scorecards | ✅ | ✅ | ✅ | ✅ |
| View all scorecards | ❌ | ✅ | ✅ | ✅ |

## Best Practices

### Role Assignment

- Start users with USER role
- Promote to HR role for recruiters
- Limit ADMIN role to senior staff
- Reserve SUPER_ADMIN for technical admins only

### Security

- Use strong passwords
- Change default admin password immediately
- Deactivate users when they leave company
- Review user list periodically

### Onboarding New Team Members

1. Create user account
2. Send credentials securely
3. Have them change password on first login
4. Provide training on their role
5. Assign to relevant hiring processes

## Troubleshooting

### Can't Create User

**Issue**: "A user with this email address already exists in this company"

**Solution**: Email must be unique within company. User may already exist. Search for user by email.

### User Can't Login

**Issue**: "Invalid credentials"

**Solutions:**
- Check email is correct
- Verify password
- Ensure user is not deactivated
- Check account status with admin

### Missing Permissions

**Issue**: User reports they can't access a feature

**Solution**:
- Check user's assigned roles
- Verify role has required permission
- Update roles if necessary
- Role changes take effect on next login

## Next Steps

- [Candidates](./candidates.md) - Managing candidate profiles
- [Job Positions](./job-positions.md) - Creating job openings
- [Hiring Process](./hiring-process.md) - Multi-stage workflows
