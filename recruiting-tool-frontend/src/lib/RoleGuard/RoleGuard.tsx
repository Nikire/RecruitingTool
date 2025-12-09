import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuthMe} from '../../hooks/api/useAuth';
import {UserRoles} from '../../types/user.types';
import {hasAnyRole, getDefaultDashboard} from '../../utils/permissions';

interface RoleGuardProps {
	allowedRoles: UserRoles[];
	redirectTo?: string;
}

/**
 * RoleGuard component for route-level role-based authorization.
 * Checks if the authenticated user has one of the allowed roles.
 * If not, redirects to the appropriate dashboard or specified route.
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param redirectTo - Optional custom redirect path (defaults to user's default dashboard)
 */
export function RoleGuard({allowedRoles, redirectTo}: RoleGuardProps) {
	const {user, isLoading} = useAuthMe();
	const location = useLocation();

	// Show nothing while loading
	if (isLoading) return null;

	// Check if user has any of the allowed roles
	const hasAccess = hasAnyRole(user, allowedRoles);

	// If no access, redirect to appropriate dashboard or specified route
	if (!hasAccess) {
		const fallbackRedirect = user ? getDefaultDashboard(user) : '/login';
		return <Navigate to={redirectTo || fallbackRedirect} replace state={{from: location}} />;
	}

	// User has access, render child routes
	return <Outlet />;
}
