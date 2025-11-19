import Dashboard from './pages/dashboard/Dashboard';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Logout from './pages/auth/Logout';
import Home from './pages/home/Home';
import HiringProcessPage from './pages/hiring-process/HiringProcessPage';
import {ProtectedRoute} from './lib/ProtectedRoute/ProtectedRoute';
import DocumentContainer from './layouts/DocumentContainer';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import JobPositionsPage from './pages/job-positions/JobPositionsPage';
import JobPositionDetailPage from './pages/job-position-detail/JobPositionDetailPage';
import CandidatesPage from './pages/candidates/CandidatesPage';
import { CompaniesPage } from './pages/companies/CompaniesPage';
import UserManagementPage from './pages/users/UserManagementPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import ApplicationsPage from './pages/admin/applications/ApplicationsPage';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			<Toaster />
			<Routes>
				<Route element={<MainLayout />}>
					<Route index element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/logout" element={<Logout />} />
					<Route path="/careers" element={<JobPositionsPage />} />
					<Route path="/careers/:uid" element={<JobPositionDetailPage />} />

					<Route element={<DocumentContainer />}>
						<Route path="/hiring-process/:uid" element={<HiringProcessPage />} />
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/profile" element={<ProfilePage />} />
					</Route>
				</Route>

				{/* Admin Panel Routes - separate from MainLayout */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route path="/admin" element={<AdminDashboard />} />
						<Route path="/admin/candidates" element={<CandidatesPage />} />
						<Route path="/admin/companies" element={<CompaniesPage />} />
						<Route path="/admin/users" element={<UserManagementPage />} />
						<Route path="/admin/applications" element={<ApplicationsPage />} />
					</Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
