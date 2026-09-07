# Roles & Permissions

Borderless uses role-based access control (RBAC). Every user has one or more roles that determine what they can see and do.

## Role Hierarchy

```
SUPER_ADMIN (Highest — global platform administrator)
    ↓
ADMIN (Platform administrator)
    ↓
COMPANY_OWNER / COMPANY_ADMIN
    ↓
HR_MANAGER
    ↓
HR / RECRUITER
    ↓
USER (Lowest — basic employee/interviewer)
```

## Role Descriptions

| Role | Who it is for | Main access |
|------|-------------|-----------|
| `SUPER_ADMIN` | Platform owner | Full access to everything — all companies, all settings, admin panel |
| `ADMIN` | Platform administrator | Admin panel, user and company management |
| `COMPANY_OWNER` | Company owner | All HR features + billing management |
| `COMPANY_ADMIN` | Company administrator | All HR features + company settings |
| `HR_MANAGER` | Senior HR | All HR features + team management + invitations |
| `HR` | HR generalist | Core HR features (candidates, hiring, interviews) |
| `RECRUITER` | Recruiter | Core HR features |
| `USER` | Regular employee | Take part in interviews only |

## Permission Matrix

| Feature | USER | HR | HR_MANAGER | COMPANY_OWNER | ADMIN | SUPER_ADMIN |
|---------|------|----|----|----|----|-----|
| View candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/edit candidates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage job positions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage hiring processes | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Take part in interviews | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI scoring | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Email templates | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invite team members | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage team roles | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit company profile | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage billing | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Access the admin panel | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage all companies | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Deactivate users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage AI quotas | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage plan limits | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Feature flags | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
