# Team Management

Guide to inviting colleagues into your company, changing their role, removing them, and reviewing requests to join.

## Overview

The Team screen is where you manage the people inside your own company: current members, invitations you have sent, and requests other users have made to join you. It does not manage platform users or other companies — that lives in the [Admin Panel](./admin-panel.md) and is restricted to ADMIN and SUPER_ADMIN.

**Navigate to Team:** Sidebar → **Settings** → **Team**, or go directly to `/settings/team`.

## Who Can Reach This Page

The route guard admits **HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN and SUPER_ADMIN**.

Acting on the page is narrower. The invite button, the role and remove controls on each member card, the cancel button on invitations, and the Connection Requests list all require **COMPANY_OWNER, COMPANY_ADMIN or ADMIN**. An HR_MANAGER or SUPER_ADMIN can open the page but sees it read-only, and the Connection Requests tab shows "Only the company owner or a company admin can review requests to join this company."

If your account does not belong to a company at all, the page shows "You must belong to a company to manage the team" instead of the tabs.

## Seat Quota Banner

A quota banner sits at the top of the page showing active users against your plan's seat limit. The bar is green below 70% of the limit, yellow between 70% and 90%, and red at 90% or above. On plans with unlimited seats, the bar stays at zero and no limit figure is shown.

The seat count used when you invite someone is **active users plus pending invitations**. See [Subscription and Limits](./subscription-and-limits.md).

## The Three Tabs

Each tab label carries a count chip.

| Tab | Shows |
|-----|-------|
| **Current Members** | Everyone currently in your company, as a grid of member cards |
| **Pending Invitations** | Invitations sent but not yet accepted |
| **Connection Requests** | Users asking to join your company |

## Current Members

Each member is shown as a card with their avatar, name, email and role chips. If you can manage the team, two actions appear on other people's cards:

- **Edit Role** — opens the Change Role dialog
- **Remove Member** — opens a confirmation dialog

Neither action appears on your own card. You cannot demote or remove yourself from the Team screen.

### Changing a Member's Role

1. On the member card, click **Edit Role**.
2. Pick a role from the dropdown. The dialog offers **HR**, **HR Manager**, **Recruiter** and **Company Admin**.
3. Click **Save**.

The member ends up with exactly the single role you picked — the dialog replaces their roles rather than adding to them. `COMPANY_OWNER`, `ADMIN` and `SUPER_ADMIN` cannot be assigned here.

### Removing a Member

1. On the member card, click **Remove Member**.
2. The dialog reads "Are you sure you want to remove *name* from the team? They will lose access to the company."
3. Click **Remove**.

The user account is not deleted; it is detached from your company.

## Inviting a Team Member

1. Click **Invite Member** in the page header.
2. Enter the person's **Email Address**.
3. Choose a **Role**. The dropdown currently offers **HR** only, even though eight roles exist. To give someone a different role, invite them as HR and then use **Edit Role** once they accept.
4. Click **Send Invitation**.

Borderless emails the invitee a link to `/invitations/accept/<token>`. The invitation **expires after 7 days**.

### Invitations that are rejected

| Situation | Result |
|-----------|--------|
| The email already belongs to a member of your company | 409 "User with this email is already a member of the company" |
| A pending invitation already exists for that email | 409 "A pending invitation already exists for this email" |
| Active users plus pending invitations would exceed your plan's seat limit | 402 "User limit reached for your plan" |
| The inviter is not COMPANY_OWNER, COMPANY_ADMIN or ADMIN | 403 "Only Company Owners and Admins can invite team members" |

If the invitation email fails to send, the invitation is still created — cancel and re-send, or share the link another way.

## Pending Invitations

Each pending invitation is a card showing:

- The invitee's email
- **Invited as** *role*
- **Invited by** *name* and the date it was created
- An **Expires** chip with the expiry date

The only action on an invitation is **Cancel**. There is no resend button; to reissue an invitation, cancel it and send a new one.

### Cancelling an Invitation

1. Click **Cancel** on the invitation card.
2. The dialog reads "Are you sure you want to cancel the invitation sent to *email*? The invitation link will stop working."
3. Click **Cancel Invitation**.

## Connection Requests

This tab lists users who have asked to join your company, each with the role they requested and an optional message.

- **Approve** — opens a dialog where you set the **Assigned Role** and can add a note, then confirms the user into your company.
- **Deny** — opens a dialog where you give a reason for the denial.

Only COMPANY_OWNER, COMPANY_ADMIN and ADMIN can approve or deny. Everyone else sees an information notice instead of the list.

## Accepting an Invitation (as the invitee)

1. Open the link from the invitation email. You must be signed in.
2. The **Join Team** screen shows the company, the assigned role, and which account you are signed in as.
3. Read the notice: accepting replaces your current company affiliation, if you have one.
4. Click **Accept Invitation**.

You are redirected to your dashboard a few seconds later.

## Permissions

| Action | HR | HR_MANAGER | RECRUITER | COMPANY_ADMIN | COMPANY_OWNER | ADMIN | SUPER_ADMIN |
|--------|:--:|:----------:|:---------:|:-------------:|:-------------:|:-----:|:-----------:|
| Open `/settings/team` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| View members and invitations | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Invite a member | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Change a member's role | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Remove a member | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Cancel an invitation | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Approve / deny connection requests | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

The table describes what the **page** lets you do. The API is looser in places: `GET`/`PATCH` on company roles admit HR_MANAGER and above, removal admits COMPANY_OWNER and above, and invitation cancel admits COMPANY_OWNER and above — all of which include SUPER_ADMIN. The page's own check is COMPANY_OWNER, COMPANY_ADMIN or ADMIN, so HR_MANAGER and SUPER_ADMIN simply never see the controls.

Creating an invitation is the one action where the API is *stricter* than the ladder: the service re-checks that you literally hold COMPANY_OWNER, COMPANY_ADMIN or ADMIN, so a SUPER_ADMIN is refused even by direct API call.

## Managing Your Own Profile

Your own name, phone number, position, department, bio, links, timezone and profile picture are edited on **Profile** (`/profile`), not here. You cannot change your own email, company or roles from the product.

## Troubleshooting

**"A pending invitation already exists for this email."** Open the Pending Invitations tab, cancel the existing invitation, then send a new one.

**"User limit reached for your plan."** Your plan's seat limit counts pending invitations as well as active members. Cancel an unused invitation, remove a member, or upgrade — see [Subscription and Limits](./subscription-and-limits.md).

**A member cannot see a page you expect them to see.** Check their role against [Roles and Permissions](./roles-and-permissions.md). Several roles can open HR pages but cannot act on them.

**You cannot see the Invite Member button.** You are on the page as HR_MANAGER or SUPER_ADMIN, which is read-only here. Ask a Company Owner or Company Admin.

## Next Steps

- [Roles and Permissions](./roles-and-permissions.md) - What each of the eight roles can do
- [Company Settings](./company-settings.md) - Company profile, logo and careers page
- [Subscription and Limits](./subscription-and-limits.md) - Seat quotas and upgrades
- [Admin Panel](./admin-panel.md) - Platform-level user and company management
