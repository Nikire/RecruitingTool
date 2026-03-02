import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isError, user } = useAuthMe();
  const { user: atomUser } = useUserAtom();
  const location = useLocation();

  // Define onboarding paths that should be excluded from redirect
  const onboardingPaths = [
    "/onboarding",
    "/onboarding/hr",
    "/applicant/onboarding",
  ];
  const isOnboardingPath = onboardingPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // Wait for the auth query AND for the Jotai atom to be populated.
  // Without this, children render in the same commit as the query resolving
  // and see a null atom (useEffect hasn't fired yet), causing a spurious
  // redirect to /login → which AuthLayout then bounces to /.
  if (isLoading || (user && !atomUser)) {
    return null;
  }

  if (isError || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs to complete onboarding (only for USER role / applicants)
  // Don't redirect if already on an onboarding path
  if (user && !user.onboardingCompleted && !isOnboardingPath) {
    const userRoles = user.roles || [];

    // USER role (applicants) should go to applicant onboarding
    if (userRoles.includes(UserRoles.USER) && userRoles.length === 1) {
      return <Navigate to="/applicant/onboarding" replace />;
    }
  }

  return <Outlet />;
}
