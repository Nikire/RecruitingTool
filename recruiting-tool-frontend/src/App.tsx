import {Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Logout from './pages/auth/Logout';
import Home from './pages/home/Home';
import HiringProcessPage from './pages/hiring-process/HiringProcessPage';
import {ProtectedRoute} from './lib/ProtectedRoute/ProtectedRoute';
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
import BookInterviewPage from './pages/booking/BookInterviewPage';
import BookingConfirmedPage from './pages/booking/BookingConfirmedPage';
import ErrorBoundaryTest from './pages/test/ErrorBoundaryTest';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			<Toaster />
			<Routes>
				{/* Landing Page Layout - for Home page with custom styling */}
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
					<Route path="/signup" element={<Signup />} />
					<Route path="/logout" element={<Logout />} />
					<Route path="/careers" element={<CareersPage />} />
					<Route path="/careers/:uid" element={<JobPositionDetailPage />} />
					<Route path="/book-interview/:token" element={<BookInterviewPage />} />
					<Route path="/booking-confirmed/:token" element={<BookingConfirmedPage />} />

					<Route element={<DocumentContainer />}>
						<Route path="/hiring-process/:uid" element={<HiringProcessPage />} />
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route path="/profile" element={<ProfilePage />} />
					</Route>
				</Route>

				{/* HR Panel Routes - accessible to HR, ADMIN, and SUPER_ADMIN */}
				<Route element={<ProtectedRoute />}>
					<Route element={<HRLayout />}>
						<Route path="/hr/dashboard" element={<HRDashboard />} />
						<Route path="/hr/applications" element={<ApplicationsPage />} />
						<Route path="/hr/candidates" element={<CandidatesPage />} />
						<Route path="/hr/job-positions" element={<JobPositionsPage />} />
						<Route path="/hr/analytics" element={<AnalyticsPage />} />
						<Route path="/hr/email-templates" element={<EmailTemplatesPage />} />
					</Route>
				</Route>

				{/* Admin Panel Routes - accessible to ADMIN and SUPER_ADMIN only */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route path="/admin" element={<AdminDashboard />} />
						<Route path="/admin/companies" element={<CompaniesPage />} />
						<Route path="/admin/users" element={<UserManagementPage />} />
						<Route path="/admin/settings" element={<SystemSettingsPage />} />
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
