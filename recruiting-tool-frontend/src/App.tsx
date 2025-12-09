import {Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import RegistrationWizard from './pages/auth/RegistrationWizard';
import Logout from './pages/auth/Logout';
import Home from './pages/home/Home';
import LandingPage from './pages/landing/LandingPage';
import HiringProcessPage from './pages/hiring-process/HiringProcessPage';
import {ProtectedRoute} from './lib/ProtectedRoute/ProtectedRoute';
import {RoleGuard} from './lib/RoleGuard';
import {UserRoles} from './types/user.types';
import DocumentContainer from './layouts/DocumentContainer';
import MainLayout from './layouts/MainLayout';
import LandingPageLayout from './layouts/LandingPageLayout';
import AdminLayout from './layouts/AdminLayout';
import HRLayout from './layouts/HRLayout';
import JobPositionsPage from './pages/job-positions/JobPositionsPage';
import JobPositionDetailPage from './pages/job-position-detail/JobPositionDetailPage';
import CareersPage from './pages/careers/CareersPage';
import CandidatesPage from './pages/candidates/CandidatesPage';
import { CompaniesPage } from './pages/companies/CompaniesPage';
import UserManagementPage from './pages/users/UserManagementPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import ApplicationsPage from './pages/admin/applications/ApplicationsPage';
import EmailTemplatesPage from './pages/email-templates/EmailTemplatesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import DeletedRecordsPage from './pages/admin/DeletedRecordsPage';
import BookInterviewPage from './pages/booking/BookInterviewPage';
import BookingConfirmedPage from './pages/booking/BookingConfirmedPage';
import ErrorBoundaryTest from './pages/test/ErrorBoundaryTest';
import HRJobPositionDetailPage from './pages/hr/job-position-detail/HRJobPositionDetailPage';
import SubscriptionPage from './pages/profile/SubscriptionPage';
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import HROnboardingWizard from './pages/onboarding/HROnboardingWizard';
import ApplicantOnboarding from './pages/applicant/ApplicantOnboarding';
import CalendarSettingsPage from './pages/settings/CalendarSettingsPage';
import TeamManagementPage from './pages/TeamManagementPage';
import AcceptInvitationPage from './pages/invitations/AcceptInvitationPage';
import CheckStatusPage from './pages/status/CheckStatusPage';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			<Toaster />
			<Routes>
				{/* Landing Page - Marketing Page */}
				<Route element={<LandingPageLayout />}>
					<Route path="/landing" element={<LandingPage />} />
				</Route>

				{/* Home Page - Original landing page for logged-in users */}
				<Route element={<LandingPageLayout />}>
					<Route index element={<Home />} />
				</Route>

				{/* Test Routes - Development Only */}
				{import.meta.env.DEV && (
					<Route element={<MainLayout />}>
						<Route path="/test/error-boundary" element={<ErrorBoundaryTest />} />
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
					<Route path="/book-interview/:token" element={<BookInterviewPage />} />
					<Route path="/booking-confirmed/:token" element={<BookingConfirmedPage />} />

					<Route element={<DocumentContainer />}>
						<Route path="/hiring-process/:uid" element={<HiringProcessPage />} />
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route path="/onboarding" element={<OnboardingWizard />} />
						<Route path="/onboarding/hr" element={<HROnboardingWizard />} />
						<Route path="/applicant/onboarding" element={<ApplicantOnboarding />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/profile/subscription" element={<SubscriptionPage />} />
						<Route path="/invitations/accept/:token" element={<AcceptInvitationPage />} />
					</Route>
				</Route>

				{/* HR Panel Routes - accessible to HR, COMPANY_OWNER, ADMIN, and SUPER_ADMIN */}
				<Route element={<ProtectedRoute />}>
					<Route
						element={
							<RoleGuard
								allowedRoles={[UserRoles.HR, UserRoles.COMPANY_OWNER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN]}
							/>
						}
					>
						<Route element={<HRLayout />}>
							<Route path="/hr/dashboard" element={<HRDashboard />} />
							<Route path="/hr/applications" element={<ApplicationsPage />} />
							<Route path="/hr/candidates" element={<CandidatesPage />} />
							<Route path="/hr/job-positions" element={<JobPositionsPage />} />
							<Route path="/hr/job-positions/:uid" element={<HRJobPositionDetailPage />} />
							<Route path="/hr/analytics" element={<AnalyticsPage />} />
							<Route path="/hr/email-templates" element={<EmailTemplatesPage />} />
							<Route path="/settings/calendar" element={<CalendarSettingsPage />} />
							<Route path="/settings/team" element={<TeamManagementPage />} />
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
							<Route path="/admin/deleted-records" element={<DeletedRecordsPage />} />
							<Route path="/admin/settings" element={<SystemSettingsPage />} />
						</Route>
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
