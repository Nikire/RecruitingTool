import { ForbiddenException } from '@nestjs/common';
import { User, RolesType } from '@prisma/client';

/**
 * Helper functions for company-based access control
 */

/**
 * Check if user is ADMIN or SUPER_ADMIN (can access all companies)
 */
export function isAdminRole(user: User): boolean {
  return user.roles.includes(RolesType.ADMIN) || user.roles.includes(RolesType.SUPER_ADMIN);
}

/**
 * Check if user is HR or regular USER (company-restricted)
 */
export function isCompanyRestrictedRole(user: User): boolean {
  return user.roles.includes(RolesType.HR) || user.roles.includes(RolesType.USER);
}

/**
 * Get user's companyId with validation
 * Throws ForbiddenException if HR/USER doesn't have a company
 */
export function getUserCompanyId(user: User): number | null {
  // ADMIN and SUPER_ADMIN can access all companies
  if (isAdminRole(user)) {
    return null;
  }

  // HR and USER must have a company
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
 */
export function verifyCompanyAccess(user: User, resourceCompanyId: number | null): void {
  // ADMIN and SUPER_ADMIN can access any resource
  if (isAdminRole(user)) {
    return;
  }

  // HR and USER can only access their own company's resources
  if (isCompanyRestrictedRole(user)) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }

    if (resourceCompanyId !== user.companyId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }
}
