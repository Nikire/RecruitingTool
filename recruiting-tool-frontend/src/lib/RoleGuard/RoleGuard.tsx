import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthMe } from "../../hooks/api/useAuth";
import { UserRoles } from "../../types/user.types";
import { hasAnyRole, getDefaultDashboard } from "../../utils/permissions";
import UnauthorizedAccess from "../../pages/errors/UnauthorizedAccess";
import CenteredLoadingSpinner from "../../components/common/CenteredLoadingSpinner";

interface RoleGuardProps {
  allowedRoles: UserRoles[];
  redirectTo?: string;
  showUnauthorized?: boolean; // If true, show unauthorized page instead of redirecting
}

/**
 * RoleGuard component for route-level role-based authorization.
 * Checks if the authenticated user has one of the allowed roles.
 * If not, either shows an unauthorized access page or redirects.
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param redirectTo - Optional custom redirect path (defaults to user's default dashboard)
 * @param showUnauthorized - If true, shows unauthorized page instead of redirecting (default: false)
 */
export function RoleGuard({
  allowedRoles,
  redirectTo,
  showUnauthorized = false,
}: RoleGuardProps) {
  const { user, isLoading } = useAuthMe();
  const location = useLocation();

  // Show a spinner while the auth query resolves (blank screen otherwise)
  if (isLoading) return <CenteredLoadingSpinner />;

  // Check if user has any of the allowed roles
  const hasAccess = hasAnyRole(user, allowedRoles);

  // If no access, either show unauthorized page or redirect
  if (!hasAccess) {
    if (showUnauthorized) {
      return <UnauthorizedAccess requiredRoles={allowedRoles} />;
    }

    const fallbackRedirect = user ? getDefaultDashboard(user) : "/login";
    return (
      <Navigate
        to={redirectTo || fallbackRedirect}
        replace
        state={{ from: location }}
      />
    );
  }

  // User has access, render child routes
  return <Outlet />;
}
