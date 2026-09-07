# Team Management

**Route:** `/settings/team`
**Access:** HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN

Team Management lets you invite and administer the people who have access to your company's Borderless workspace.

## Inviting a Team Member

1. Go to **Settings → Team**
2. Click **"Invite Team Member"**
3. Enter their email address
4. Pick their role (HR, HR_MANAGER, RECRUITER, COMPANY_ADMIN)
5. Send the invitation

The invitee receives an email with a link to accept. If they do not have an account yet, they are asked to sign up first.

## Roles You Can Assign

| Role | Best For |
|------|---------|
| `HR` | Day-to-day recruiting — candidates, interviews, hiring processes |
| `HR_MANAGER` | Senior HR — team management + all HR features |
| `RECRUITER` | Sourcing specialists — same as HR |
| `COMPANY_ADMIN` | Company administrators — billing + company settings + HR features |

## Managing Existing Members

- **View** every active team member and their role
- **Update role** — change a member's role
- **Deactivate** — revoke access (the member is soft deleted, not removed permanently)

## Invitation Status

| Status | Meaning |
|--------|---------|
| `PENDING` | Invitation sent, not accepted yet |
| `ACCEPTED` | The member has joined |
| `EXPIRED` | The invitation link has expired (24 hours) |

## Access Control

- `HR_MANAGER` can invite/manage `HR`, `RECRUITER`
- `COMPANY_OWNER` / `COMPANY_ADMIN` can manage every role including `HR_MANAGER`
- Only `ADMIN` / `SUPER_ADMIN` can deactivate users permanently
