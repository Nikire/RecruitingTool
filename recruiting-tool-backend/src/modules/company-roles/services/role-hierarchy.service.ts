import { Injectable } from '@nestjs/common';
import { RolesType } from '@prisma/client';

/**
 * Role Hierarchy Service
 * Manages the company role hierarchy and permission delegation logic.
 *
 * Hierarchy (highest to lowest):
 * 1. SUPER_ADMIN - System-level admin (can do anything)
 * 2. COMPANY_OWNER - Can delegate all roles within their company
 * 3. COMPANY_ADMIN - Can delegate roles below COMPANY_OWNER
 * 4. HR_MANAGER - Can delegate HR and RECRUITER roles
 * 5. HR - Can view and manage hiring processes
 * 6. RECRUITER - Can view candidates and assist in hiring
 * 7. USER - Basic user (no special permissions)
 * 8. ADMIN - Admin role (legacy, treated as COMPANY_ADMIN)
 */
@Injectable()
export class RoleHierarchyService {
  private readonly roleHierarchy: Record<RolesType, number> = {
    [RolesType.SUPER_ADMIN]: 1000,
    [RolesType.COMPANY_OWNER]: 900,
    [RolesType.COMPANY_ADMIN]: 800,
    [RolesType.ADMIN]: 800, // Legacy admin role, same level as COMPANY_ADMIN
    [RolesType.HR_MANAGER]: 700,
    [RolesType.HR]: 600,
    [RolesType.RECRUITER]: 500,
    [RolesType.USER]: 100,
  };

  /**
   * Get the numeric level for a role
   */
  getRoleLevel(role: RolesType): number {
    return this.roleHierarchy[role] || 0;
  }

  /**
   * Get the highest role from a user's roles array
   */
  getHighestRole(roles: RolesType[]): RolesType {
    if (!roles || roles.length === 0) {
      return RolesType.USER;
    }

    return roles.reduce((highest, current) => {
      return this.getRoleLevel(current) > this.getRoleLevel(highest) ? current : highest;
    }, roles[0]);
  }

  /**
   * Check if a user can delegate a specific role
   * Rules:
   * - SUPER_ADMIN can delegate any role
   * - COMPANY_OWNER can delegate any company role except SUPER_ADMIN
   * - COMPANY_ADMIN can delegate roles below COMPANY_OWNER
   * - HR_MANAGER can delegate HR and RECRUITER
   */
  canDelegateRole(delegatorRoles: RolesType[], targetRole: RolesType): boolean {
    const highestRole = this.getHighestRole(delegatorRoles);
    const delegatorLevel = this.getRoleLevel(highestRole);
    const targetLevel = this.getRoleLevel(targetRole);

    // SUPER_ADMIN can delegate any role
    if (delegatorRoles.includes(RolesType.SUPER_ADMIN)) {
      return true;
    }

    // COMPANY_OWNER can delegate any role except SUPER_ADMIN
    if (delegatorRoles.includes(RolesType.COMPANY_OWNER)) {
      return targetRole !== RolesType.SUPER_ADMIN;
    }

    // COMPANY_ADMIN can delegate roles below COMPANY_OWNER
    if (delegatorRoles.includes(RolesType.COMPANY_ADMIN) || delegatorRoles.includes(RolesType.ADMIN)) {
      return targetLevel < this.getRoleLevel(RolesType.COMPANY_OWNER);
    }

    // HR_MANAGER can delegate HR and RECRUITER only
    if (delegatorRoles.includes(RolesType.HR_MANAGER)) {
      return targetRole === RolesType.HR || targetRole === RolesType.RECRUITER || targetRole === RolesType.USER;
    }

    // Other roles cannot delegate
    return false;
  }

  /**
   * Check if a user can delegate all specified roles
   */
  canDelegateRoles(delegatorRoles: RolesType[], targetRoles: RolesType[]): boolean {
    return targetRoles.every((role) => this.canDelegateRole(delegatorRoles, role));
  }

  /**
   * Check if a user can manage (update/remove) another user based on roles
   * A user can manage another user if they can delegate all of the target user's roles
   */
  canManageUser(delegatorRoles: RolesType[], targetUserRoles: RolesType[]): boolean {
    return this.canDelegateRoles(delegatorRoles, targetUserRoles);
  }

  /**
   * Get all roles that a user can delegate
   */
  getDelegatableRoles(delegatorRoles: RolesType[]): RolesType[] {
    return Object.values(RolesType).filter((role) => this.canDelegateRole(delegatorRoles, role));
  }

  /**
   * Validate if a role assignment is valid
   * Returns an error message if invalid, null if valid
   */
  validateRoleAssignment(delegatorRoles: RolesType[], targetRoles: RolesType[]): string | null {
    // Check if delegator can assign all target roles
    const cannotDelegate = targetRoles.filter((role) => !this.canDelegateRole(delegatorRoles, role));

    if (cannotDelegate.length > 0) {
      return `You do not have permission to assign the following roles: ${cannotDelegate.join(', ')}`;
    }

    return null;
  }
}
