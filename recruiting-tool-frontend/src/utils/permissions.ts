import {User, UserRoles} from '../types/user.types';

/**
 * Management roles that have permissions to create, update, and delete resources
 */
const MANAGEMENT_ROLES = [UserRoles.HR, UserRoles.ADMIN, UserRoles.SUPER_ADMIN] as const;

/**
 * Checks if the user has management permissions (HR, ADMIN, or SUPER_ADMIN roles)
 * @param user - The user to check permissions for
 * @returns true if the user has any management role, false otherwise
 */
export const canManageResources = (user: User | null): boolean => {
	if (!user) return false;
	return MANAGEMENT_ROLES.some(role => user.roles.includes(role));
};

/**
 * Checks if the user has a specific role
 * @param user - The user to check
 * @param role - The role to check for
 * @returns true if the user has the specified role, false otherwise
 */
export const hasRole = (user: User | null, role: UserRoles): boolean => {
	if (!user) return false;
	return user.roles.includes(role);
};

/**
 * Checks if the user has any of the specified roles
 * @param user - The user to check
 * @param roles - Array of roles to check for
 * @returns true if the user has any of the specified roles, false otherwise
 */
export const hasAnyRole = (user: User | null, roles: UserRoles[]): boolean => {
	if (!user) return false;
	return roles.some(role => user.roles.includes(role));
};

/**
 * Checks if the user is an admin (ADMIN or SUPER_ADMIN)
 * @param user - The user to check
 * @returns true if the user is an admin, false otherwise
 */
export const isAdmin = (user: User | null): boolean => {
	if (!user) return false;
	return user.roles.includes(UserRoles.ADMIN) || user.roles.includes(UserRoles.SUPER_ADMIN);
};
