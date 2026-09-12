# Roles and Permissions

Reference for the eight Borderless roles, the routes each one can reach, and the narrower set of roles that can actually create, edit and delete.

## Overview

Borderless has eight roles. Access is decided in three independent places, and they do not always agree:

1. **Route guards** decide which pages you can open. They are declared per route group in `recruiting-tool-frontend/src/App.tsx` and are literal role lists — you must hold one of the roles named.
2. **Button gates** decide which controls render. Most create/edit/delete buttons are driven by the `canManageResources` helper in `recruiting-tool-frontend/src/utils/permissions.ts`, and a few pages add their own check.
3. **The API role ladder** decides which requests succeed. This one is *not* a membership check — see below.

Because of this, some roles can open a page but cannot act on it, and a few roles the API would allow never get shown the button.

## The API Role Ladder

`RolesGuard` in `recruiting-tool-backend/src/modules/shared/modules/auth/guards/roles.guard.ts` ranks every role. A lower number means more privilege.

| Level | Role |
|:-----:|------|
| 1 | `SUPER_ADMIN` |
| 2 | `ADMIN` |
| 3 | `COMPANY_ADMIN` |
| 4 | `COMPANY_OWNER` |
| 5 | `HR_MANAGER` |
| 6 | `HR` |
| 7 | `RECRUITER` |
| 8 | `USER` |

An endpoint's `@Auth([...])` list is read as **"at least the least-privileged role named"**. The threshold is the *lowest-ranked* role in the list, and everything above it is admitted automatically.

So `@Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])` means **HR and every role above HR** — HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN. The `ADMIN` and `SUPER_ADMIN` entries are documentation; the gate is `HR`.

Two consequences worth remembering:

- A front-end role list is usually **narrower** than the API allows. Seeing no button does not mean the API would refuse you.
- Widening an endpoint means adding the *lower* role to its list, not the higher ones.

A handful of endpoints layer an extra explicit membership check on top of the ladder — team invitations are the notable one — and those are called out where they apply.

## The Roles

The role enum lives in `recruiting-tool-backend/prisma/schema.prisma` (`RolesType`) and is mirrored in `recruiting-tool-frontend/src/types/user.types.ts` (`UserRoles`).

| Role | Label in the UI | Typical use |
|------|-----------------|-------------|
| `USER` | User | Applicants and anyone without HR access. Lands on `/careers`. |
| `HR` | HR | Recruiters and coordinators. The default role for invited team members. |
| `HR_MANAGER` | HR Manager | Team leads who need the Team screen. |
| `RECRUITER` | Recruiter | Sourcing-focused member of an HR team. |
| `COMPANY_OWNER` | Company Owner | The account holder. The only role that sees Billing and Company Profile in the sidebar. |
| `COMPANY_ADMIN` | Company Admin | Delegated administrator for the company. |
| `ADMIN` | Admin | Platform staff. Lands on `/admin`. |
| `SUPER_ADMIN` | Super Admin | Platform staff with full configuration access. Lands on `/admin`. |

A user can hold more than one role; the checks below are "has any of".

### Where each role lands after login

| Role held | Default route |
|-----------|---------------|
| `SUPER_ADMIN` | `/admin` |
| `ADMIN` | `/admin` |
| `HR` or `COMPANY_OWNER` | `/hr/dashboard` |
| Anything else | `/careers` |

Note that `HR_MANAGER`, `RECRUITER` and `COMPANY_ADMIN` are not in that list, so a user holding only one of those roles lands on `/careers` even though the HR panel is open to them.

## Route Access

### HR panel

These routes share one guard admitting **HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN**:

`/hr/dashboard`, `/hr/applications`, `/hr/candidates`, `/hr/candidates/:uid`, `/hr/job-positions`, `/hr/job-positions/:uid`, `/hr/hiring-processes`, `/hr/analytics`, `/hr/email-templates`, `/hr/calendar`, `/hr/interviews`, `/hr/files`, `/hr/guide`, `/settings/calendar`, `/settings/api-keys`

### Narrower guards

| Route | Roles admitted by the guard |
|-------|-----------------------------|
| `/settings/team` | HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN |
| `/hr/billing` | COMPANY_OWNER only |
| `/hr/settings/company` | HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN |
| `/admin/**` | ADMIN, SUPER_ADMIN |

### Signed-in routes with no role guard

`/profile`, `/profile/subscription`, `/notifications`, `/settings/notifications` and `/invitations/accept/:token` are available to any authenticated user, including `USER`.

## Sidebar Visibility

The HR sidebar hides two items from everyone who is not a `COMPANY_OWNER`:

| Sidebar item | Route | Shown to |
|--------------|-------|----------|
| Billing | `/hr/billing` | COMPANY_OWNER only |
| Company Profile | `/hr/settings/company` | COMPANY_OWNER only |

Company Profile is only *hidden* — the route itself still admits the wider HR set, so anyone in that set who navigates to `/hr/settings/company` directly will see the page.

## Acting vs. Opening

`canManageResources` returns true only for **HR, ADMIN, SUPER_ADMIN and COMPANY_OWNER**. It drives most create/edit/delete buttons and the Applications access check.

| Role | Can open the HR panel | `canManageResources` |
|------|:---------------------:|:--------------------:|
| USER | ❌ | ❌ |
| HR | ✅ | ✅ |
| HR_MANAGER | ✅ | ❌ |
| RECRUITER | ✅ | ❌ |
| COMPANY_OWNER | ✅ | ✅ |
| COMPANY_ADMIN | ✅ | ❌ |
| ADMIN | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ |

So **HR_MANAGER, RECRUITER and COMPANY_ADMIN can open HR pages they cannot act on**: the lists load, but the create, edit and delete controls are not rendered.

## Where the API Really Draws the Line

Applying the ladder to the `@Auth([...])` list on each endpoint gives the effective thresholds below.

| Area | Declared `@Auth` list | Effective threshold | Admitted |
|------|----------------------|---------------------|----------|
| AI scoring, parsing, ranking, weights | HR, ADMIN, SUPER_ADMIN | HR | HR and above |
| Email templates (all of `/api/email-templates`) | HR, ADMIN | HR | HR and above |
| Google Calendar connect / status / disconnect | HR, ADMIN, SUPER_ADMIN | HR | HR and above |
| Company calendar & booking settings | HR, ADMIN, SUPER_ADMIN, COMPANY_OWNER | HR | HR and above |
| Time slots and booking links | HR, ADMIN, SUPER_ADMIN | HR | HR and above |
| Async stage send / review / revoke | HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN | HR | HR and above |
| Team members: list, add, change role | COMPANY_OWNER, COMPANY_ADMIN, ADMIN, HR_MANAGER | HR_MANAGER | HR_MANAGER and above |
| Team members: remove | COMPANY_OWNER, COMPANY_ADMIN, ADMIN | COMPANY_OWNER | COMPANY_OWNER and above |
| Team invitations: create, list, cancel | COMPANY_OWNER, COMPANY_ADMIN, ADMIN | COMPANY_OWNER | COMPANY_OWNER and above, **but see below** |
| API keys | COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN | COMPANY_OWNER | COMPANY_OWNER and above |
| Quota (`GET /api/quota`) | USER, HR, ADMIN, SUPER_ADMIN | USER | Everyone signed in |

"HR and above" means HR, HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN — it excludes RECRUITER and USER.

**The invitation exception.** `CompanyInvitationsService.createInvitation` runs an explicit membership check after the guard, and refuses anyone who does not literally hold COMPANY_OWNER, COMPANY_ADMIN or ADMIN. A SUPER_ADMIN therefore passes the ladder and is then rejected with "Only Company Owners and Admins can invite team members".

## Where the UI Is Stricter Than the API

In each of these the request would succeed, but the control is never rendered.

| Area | API admits | UI shows the control to | Effect |
|------|-----------|-------------------------|--------|
| AI scoring sparkle icon | HR and above | HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN | HR and COMPANY_ADMIN can score via the API but see no icon |
| Team invite, change role, remove | HR_MANAGER and above (remove: COMPANY_OWNER and above) | COMPANY_OWNER, COMPANY_ADMIN, ADMIN | HR_MANAGER and SUPER_ADMIN see the Team page read-only |
| Company Profile fields and Save | HR and above | COMPANY_OWNER, COMPANY_ADMIN | HR, HR_MANAGER and RECRUITER get the read-only notice |
| Company Profile sidebar link | HR and above | COMPANY_OWNER | Reachable by URL for the rest of the HR group |

## Where the UI Is Looser Than the API

Here the page opens but the request behind it is refused.

| Area | Page opens for | API admits | Effect |
|------|----------------|-----------|--------|
| API Keys (`/settings/api-keys`) | The whole HR route group | COMPANY_OWNER and above | HR, HR_MANAGER and RECRUITER can open the page, but listing and every key action returns 403 |
| Everything in the HR panel, for RECRUITER | RECRUITER is in the route guard | Most write endpoints stop at HR | A RECRUITER can browse candidates, applications, positions and processes, but cannot create, edit or delete any of them, and cannot use AI, email templates, calendar or interviews |

## Assignable Roles in the Product

Two dialogs assign roles, and they offer different lists.

| Dialog | Where | Roles offered |
|--------|-------|---------------|
| Invite Team Member | `/settings/team` → **Invite Member** | HR only |
| Change Role | `/settings/team` → member card → **Edit Role** | HR, HR Manager, Recruiter, Company Admin |

`COMPANY_OWNER`, `ADMIN` and `SUPER_ADMIN` cannot be assigned from the product UI.

## Next Steps

- [Team Management](./team-management.md) - Invite members and change their roles
- [Billing](./billing.md) - The COMPANY_OWNER-only billing screen
- [Company Settings](./company-settings.md) - Who can edit the company profile
- [Admin Panel](./admin-panel.md) - The ADMIN and SUPER_ADMIN area
- [Subscription and Limits](./subscription-and-limits.md) - Plan-level feature gating
