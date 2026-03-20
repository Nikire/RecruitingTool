# Team Management

**Route:** `/settings/team`
**Access:** HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN

Team Management lets you invite and manage the people who have access to your company's Borderless workspace.

## Inviting a Team Member

1. Go to **Settings → Team**
2. Click **"Invite Team Member"**
3. Enter their email address
4. Select their role (HR, HR_MANAGER, RECRUITER, COMPANY_ADMIN)
5. Send the invitation

The invitee receives an email with a link to accept. If they don't have an account, they'll be prompted to register first.

## Roles You Can Assign

| Role | Best For |
|------|---------|
| `HR` | Day-to-day recruiting — candidates, interviews, hiring processes |
| `HR_MANAGER` | Senior HR — team management + all HR features |
| `RECRUITER` | Sourcing specialists — same as HR |
| `COMPANY_ADMIN` | Company admins — billing + company settings + HR features |

## Managing Existing Members

- **View** all active team members and their roles
- **Update role** — change a member's role
- **Deactivate** — remove access (member is soft-deleted, not permanently removed)

## Invitation Status

| Status | Meaning |
|--------|---------|
| `PENDING` | Invitation sent, not yet accepted |
| `ACCEPTED` | Member has joined |
| `EXPIRED` | Invitation link expired (24 hours) |

## Access Control

- `HR_MANAGER` can invite/manage `HR`, `RECRUITER`
- `COMPANY_OWNER` / `COMPANY_ADMIN` can manage all roles including `HR_MANAGER`
- Only `ADMIN` / `SUPER_ADMIN` can deactivate users permanently
