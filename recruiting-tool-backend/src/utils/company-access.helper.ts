import { ForbiddenException } from '@nestjs/common';
import { User, RolesType } from '@prisma/client';
import { EntityNotFoundException } from 'src/common/exceptions';

/**
 * Helper functions for company-based access control.
 *
 * TENANCY INVARIANT
 * -----------------
 * SUPER_ADMIN is the ONLY role with cross-company visibility. Every other role
 * — including ADMIN, COMPANY_ADMIN, COMPANY_OWNER, HR_MANAGER, HR, RECRUITER
 * and USER — is confined to the company on its own user record.
 *
 * This is expressed as a deny-by-default rule (`not SUPER_ADMIN` ⇒ restricted)
 * rather than an allow-list of role names on purpose. The previous allow-list
 * named only ADMIN / HR / USER / COMPANY_OWNER, so HR_MANAGER, RECRUITER and
 * COMPANY_ADMIN fell through to the "should not happen" fallback and were
 * handed `null` — the same value SUPER_ADMIN gets, which every caller reads as
 * "no company filter". A user invited as HR_MANAGER therefore listed *every*
 * tenant's candidates, applications, hiring processes, interviews, analytics
 * and users. Adding a role to `RolesType` must never be able to re-open that
 * hole, so the check can no longer be a list that someone forgets to extend.
 */

/**
 * Roles that may read across company boundaries. Deliberately a single entry:
 * widening this set widens it for all 24 `getUserCompanyId` call sites at once.
 */
const GLOBAL_ACCESS_ROLES: readonly RolesType[] = [RolesType.SUPER_ADMIN];

/**
 * Check if user is SUPER_ADMIN (can access all companies globally)
 */
export function isSuperAdminRole(user: User): boolean {
  return (user.roles ?? []).some((role) => GLOBAL_ACCESS_ROLES.includes(role));
}

/**
 * Check if the user is confined to a single company.
 *
 * True for every role that is not in GLOBAL_ACCESS_ROLES. A user carrying no
 * roles at all is also treated as restricted — failing closed is the correct
 * outcome for a malformed account.
 */
export function isCompanyRestrictedRole(user: User): boolean {
  return !isSuperAdminRole(user);
}

/**
 * Get user's companyId with validation
 * Returns null only for SUPER_ADMIN (global access)
 * All other roles must have a company and are restricted to it
 */
export function getUserCompanyId(user: User): number | null {
  // SUPER_ADMIN can access all companies
  if (isSuperAdminRole(user)) {
    return null;
  }

  // Everyone else must belong to a company, and is scoped to it.
  if (!user.companyId) {
    throw new ForbiddenException('User must belong to a company to access this resource');
  }

  return user.companyId;
}

/**
 * Verify that a resource belongs to the user's company
 * Throws ForbiddenException if access is denied
 * Only SUPER_ADMIN can access resources from any company
 */
export function verifyCompanyAccess(user: User, resourceCompanyId: number | null): void {
  // SUPER_ADMIN can access any resource
  if (isSuperAdminRole(user)) {
    return;
  }

  // Every other role can only access their own company's resources.
  if (!user.companyId) {
    throw new ForbiddenException('User must belong to a company');
  }

  if (resourceCompanyId !== user.companyId) {
    throw new ForbiddenException('You do not have permission to access this resource');
  }
}

/**
 * Minimal shape a candidate must expose for the tenancy gate below.
 */
export interface TenantScopedCandidate {
  companyId: number | null;
  hiringProcesses?: { companyId: number }[];
}

/**
 * Tenancy gate for a single Candidate reached by UID.
 *
 * A candidate belongs to a company either because it was created there
 * (`Candidate.companyId`) or because it has a hiring process there — the same
 * OR that `CandidateService.list()` applies when building its WHERE clause.
 * Anything reached by UID must apply the identical rule or the UID becomes a
 * bypass around the list filter.
 *
 * Throws 404 rather than 403 so the response never confirms the UID exists.
 */
export function assertCandidateTenancy(candidate: TenantScopedCandidate, uid: string, user?: User): void {
  if (!user) {
    return;
  }

  const userCompanyId = getUserCompanyId(user);
  if (userCompanyId === null) {
    // SUPER_ADMIN — the only role with cross-company visibility.
    return;
  }

  const ownedDirectly = candidate.companyId === userCompanyId;
  const ownedViaProcess = (candidate.hiringProcesses ?? []).some((hp) => hp.companyId === userCompanyId);

  if (!ownedDirectly && !ownedViaProcess) {
    throw new EntityNotFoundException('Candidate', uid);
  }
}
