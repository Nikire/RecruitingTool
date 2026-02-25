import { User, UserRoles } from "../types/user.types";

/**
 * Management roles that have permissions to create, update, and delete resources
 */
const MANAGEMENT_ROLES = [
  UserRoles.HR,
  UserRoles.ADMIN,
  UserRoles.SUPER_ADMIN,
  UserRoles.COMPANY_OWNER,
] as const;

/**
 * Checks if the user has management permissions (HR, ADMIN, or SUPER_ADMIN roles)
 * @param user - The user to check permissions for
 * @returns true if the user has any management role, false otherwise
 */
export const canManageResources = (user: User | null | undefined): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return MANAGEMENT_ROLES.some((role) => user.roles.includes(role));
};

/**
 * Checks if the user has a specific role
 * @param user - The user to check
 * @param role - The role to check for
 * @returns true if the user has the specified role, false otherwise
 */
export const hasRole = (
  user: User | null | undefined,
  role: UserRoles,
): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.includes(role);
};

/**
 * Checks if the user has any of the specified roles
 * @param user - The user to check
 * @param roles - Array of roles to check for
 * @returns true if the user has any of the specified roles, false otherwise
 */
export const hasAnyRole = (
  user: User | null | undefined,
  roles: UserRoles[],
): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return roles.some((role) => user.roles.includes(role));
};

/**
 * Checks if the user is an admin (ADMIN or SUPER_ADMIN)
 * @param user - The user to check
 * @returns true if the user is an admin, false otherwise
 */
export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user || !Array.isArray(user.roles)) return false;
  return (
    user.roles.includes(UserRoles.ADMIN) ||
    user.roles.includes(UserRoles.SUPER_ADMIN)
  );
};

/**
 * Gets the default dashboard route for a user based on their roles
 * Priority: SUPER_ADMIN > ADMIN > HR/COMPANY_OWNER > regular users
 * @param user - The user to get the dashboard for
 * @returns The appropriate dashboard route
 */
export const getDefaultDashboard = (user: User | null | undefined): string => {
  if (!user || !Array.isArray(user.roles)) return "/careers";

  // Super admins go to admin panel
  if (user.roles.includes(UserRoles.SUPER_ADMIN)) {
    return "/admin";
  }

  // ONLY Admins go to admin panel (NOT Company Owners)
  if (user.roles.includes(UserRoles.ADMIN)) {
    return "/admin";
  }

  // HR and Company Owners go to HR dashboard
  if (
    user.roles.includes(UserRoles.HR) ||
    user.roles.includes(UserRoles.COMPANY_OWNER)
  ) {
    return "/hr/dashboard";
  }

  // Regular users go to careers page
  return "/careers";
};
