import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import RegistrationWizard from "./pages/auth/RegistrationWizard";
import Logout from "./pages/auth/Logout";
// Home component is now unused - LandingPage is the root page
import LandingPage from "./pages/landing/LandingPage";
import HiringProcessPage from "./pages/hiring-process/HiringProcessPage";
import { ProtectedRoute } from "./lib/ProtectedRoute/ProtectedRoute";
import { RoleGuard } from "./lib/RoleGuard";
import { UserRoles } from "./types/user.types";
import DocumentContainer from "./layouts/DocumentContainer";
import MainLayout from "./layouts/MainLayout";
import LandingPageLayout from "./layouts/LandingPageLayout";
import AdminLayout from "./layouts/AdminLayout";
import HRLayout from "./layouts/HRLayout";
import JobPositionsPage from "./pages/job-positions/JobPositionsPage";
import JobPositionDetailPage from "./pages/job-position-detail/JobPositionDetailPage";
import CareersPage from "./pages/careers/CareersPage";
import CandidatesPage from "./pages/candidates/CandidatesPage";
import HiringProcessesPage from "./pages/hiring-processes/HiringProcessesPage";
import { CompaniesPage } from "./pages/companies/CompaniesPage";
import UserManagementPage from "./pages/users/UserManagementPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import ApplicationsPage from "./pages/admin/applications/ApplicationsPage";
import EmailTemplatesPage from "./pages/email-templates/EmailTemplatesPage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import DeletedRecordsPage from "./pages/admin/DeletedRecordsPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import BookInterviewPage from "./pages/booking/BookInterviewPage";
import BookingConfirmedPage from "./pages/booking/BookingConfirmedPage";
import ErrorBoundaryTest from "./pages/test/ErrorBoundaryTest";
import HRJobPositionDetailPage from "./pages/hr/job-position-detail/HRJobPositionDetailPage";
import SubscriptionPage from "./pages/profile/SubscriptionPage";
import OnboardingWizard from "./pages/onboarding/OnboardingWizard";
import HROnboardingWizard from "./pages/onboarding/HROnboardingWizard";
import ApplicantOnboarding from "./pages/applicant/ApplicantOnboarding";
import CalendarSettingsPage from "./pages/settings/CalendarSettingsPage";
import NotificationPreferencesPage from "./pages/settings/NotificationPreferencesPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import AcceptInvitationPage from "./pages/invitations/AcceptInvitationPage";
import CheckStatusPage from "./pages/status/CheckStatusPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import BillingPage from "./pages/billing/BillingPage";
import TermsOfServicePage from "./pages/legal/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import SecurityPolicyPage from "./pages/legal/SecurityPolicyPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Landing Page - Marketing Page (root) */}
        <Route element={<LandingPageLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Test Routes - Development Only */}
        {import.meta.env.DEV && (
          <Route element={<MainLayout />}>
            <Route
              path="/test/error-boundary"
              element={<ErrorBoundaryTest />}
            />
          </Route>
        )}

        {/* Main Layout - for other public pages */}
        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationWizard />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/:uid" element={<JobPositionDetailPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route
            path="/book-interview/:token"
            element={<BookInterviewPage />}
          />
          <Route
            path="/booking-confirmed/:token"
            element={<BookingConfirmedPage />}
          />

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/security" element={<SecurityPolicyPage />} />

          <Route element={<DocumentContainer />}>
            <Route
              path="/hiring-process/:uid"
              element={<HiringProcessPage />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/onboarding/hr" element={<HROnboardingWizard />} />
            <Route
              path="/applicant/onboarding"
              element={<ApplicantOnboarding />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/profile/subscription"
              element={<SubscriptionPage />}
            />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/settings/notifications"
              element={<NotificationPreferencesPage />}
            />
            <Route
              path="/invitations/accept/:token"
              element={<AcceptInvitationPage />}
            />
          </Route>
        </Route>

        {/* HR Panel Routes - accessible to HR, HR_MANAGER, RECRUITER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, and SUPER_ADMIN */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  UserRoles.HR,
                  UserRoles.HR_MANAGER,
                  UserRoles.RECRUITER,
                  UserRoles.COMPANY_OWNER,
                  UserRoles.COMPANY_ADMIN,
                  UserRoles.ADMIN,
                  UserRoles.SUPER_ADMIN,
                ]}
                showUnauthorized={true}
              />
            }
          >
            <Route element={<HRLayout />}>
              <Route path="/hr/dashboard" element={<HRDashboard />} />
              <Route path="/hr/applications" element={<ApplicationsPage />} />
              <Route path="/hr/candidates" element={<CandidatesPage />} />
              <Route path="/hr/job-positions" element={<JobPositionsPage />} />
              <Route
                path="/hr/job-positions/:uid"
                element={<HRJobPositionDetailPage />}
              />
              <Route
                path="/hr/hiring-processes"
                element={<HiringProcessesPage />}
              />
              <Route path="/hr/analytics" element={<AnalyticsPage />} />
              <Route
                path="/hr/email-templates"
                element={<EmailTemplatesPage />}
              />
              <Route
                path="/settings/calendar"
                element={<CalendarSettingsPage />}
              />
            </Route>
          </Route>

          {/* Team Management - Only for HR_MANAGER and above */}
          <Route
            element={
              <RoleGuard
                allowedRoles={[
                  UserRoles.HR_MANAGER,
                  UserRoles.COMPANY_OWNER,
                  UserRoles.COMPANY_ADMIN,
                  UserRoles.ADMIN,
                  UserRoles.SUPER_ADMIN,
                ]}
                showUnauthorized={true}
              />
            }
          >
            <Route element={<HRLayout />}>
              <Route path="/settings/team" element={<TeamManagementPage />} />
            </Route>
          </Route>
        </Route>

        {/* Billing Route - accessible to COMPANY_OWNER only */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<RoleGuard allowedRoles={[UserRoles.COMPANY_OWNER]} />}
          >
            <Route element={<HRLayout />}>
              <Route path="/hr/billing" element={<BillingPage />} />
            </Route>
          </Route>
        </Route>

        {/* Admin Panel Routes - accessible to ADMIN and SUPER_ADMIN only */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <RoleGuard
                allowedRoles={[UserRoles.ADMIN, UserRoles.SUPER_ADMIN]}
              />
            }
          >
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/companies" element={<CompaniesPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route
                path="/admin/subscriptions"
                element={<AdminSubscriptionsPage />}
              />
              <Route
                path="/admin/deleted-records"
                element={<DeletedRecordsPage />}
              />
              <Route path="/admin/settings" element={<SystemSettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
