import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { UserRoles } from "../../types/user.types";

// Roles that require email verification before accessing the HR panel.
// ADMIN and SUPER_ADMIN are excluded — they are platform-level accounts
// that may be created without going through the normal registration flow.
const EMAIL_VERIFICATION_REQUIRED_ROLES = [
  UserRoles.HR,
  UserRoles.HR_MANAGER,
  UserRoles.RECRUITER,
  UserRoles.COMPANY_OWNER,
  UserRoles.COMPANY_ADMIN,
];

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isError, user } = useAuthMe();
  const { user: atomUser } = useUserAtom();
  const location = useLocation();

  // Define paths that should be excluded from the email-verification redirect
  // so the verification gate page itself doesn't create a redirect loop.
  const emailVerificationExcludedPaths = [
    "/pending-email-verification",
    "/logout",
  ];
  const isEmailVerificationPath = emailVerificationExcludedPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // Define paths that should be excluded from the onboarding redirect.
  // Onboarding paths are excluded so the wizard itself doesn't loop.
  // Profile, notifications, and settings paths are excluded so applicants
  // can always access their account even before completing onboarding.
  const onboardingExcludedPaths = [
    "/onboarding",
    "/onboarding/hr",
    "/applicant/onboarding",
    "/profile",
    "/notifications",
    "/settings/notifications",
    "/invitations/accept",
    "/logout",
  ];
  const isOnboardingPath = onboardingExcludedPaths.some((path) =>
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

  // Block HR-panel users who have not yet verified their email address.
  // ADMIN / SUPER_ADMIN accounts are excluded from this requirement.
  if (user && user.emailVerified === false && !isEmailVerificationPath) {
    const userRoles = user.roles || [];
    const requiresVerification = EMAIL_VERIFICATION_REQUIRED_ROLES.some(
      (role) => userRoles.includes(role),
    );
    if (requiresVerification) {
      return <Navigate to="/pending-email-verification" replace />;
    }
  }

  return <Outlet />;
}
