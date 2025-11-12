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
				<Route path="/job-positions" element={<JobPositionsPage />} />
				<Route path="/job-positions/:uid" element={<JobPositionDetailPage />} />

				<Route element={<DocumentContainer />}>
					<Route path="/hiring-process/:uid" element={<HiringProcessPage />} />
				</Route>

				<Route element={<ProtectedRoute />}>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/candidates" element={<CandidatesPage />} />
				</Route>

				{/* Admin Panel Routes */}
				<Route element={<ProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route path="/admin" element={<AdminDashboard />} />
						<Route path="/admin/companies" element={<CompaniesPage />} />
						<Route path="/admin/users" element={<UserManagementPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
		</>
	);
}

export default App;
