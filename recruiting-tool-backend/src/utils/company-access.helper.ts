import { ForbiddenException } from '@nestjs/common';
import { User, RolesType } from '@prisma/client';

/**
 * Helper functions for company-based access control
 */

/**
 * Check if user is SUPER_ADMIN (can access all companies globally)
 */
export function isSuperAdminRole(user: User): boolean {
  return user.roles.includes(RolesType.SUPER_ADMIN);
}

/**
 * Check if user is company-restricted (ADMIN, HR, or USER)
 * These roles can only access data from their assigned company
 */
export function isCompanyRestrictedRole(user: User): boolean {
  return user.roles.includes(RolesType.ADMIN) || user.roles.includes(RolesType.HR) || user.roles.includes(RolesType.USER) || user.roles.includes(RolesType.COMPANY_OWNER);
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

  // ADMIN, HR, USER, COMPANY_OWNER must have a company
  if (isCompanyRestrictedRole(user)) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company to access this resource');
    }
    return user.companyId;
  }

  // Fallback (should not happen)
  return null;
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

  // ADMIN, HR, USER, COMPANY_OWNER can only access their own company's resources
  if (isCompanyRestrictedRole(user)) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }

    if (resourceCompanyId !== user.companyId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }
}
