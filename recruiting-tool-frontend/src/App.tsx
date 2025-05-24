import Dashboard from './pages/dashboard/Dashboard';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/home/Home';
import HiringProcessPage from './pages/hiring-process/HiringProcessPage';
import {ProtectedRoute} from './lib/ProtectedRoute/ProtectedRoute';
import DocumentContainer from './layouts/DocumentContainer';
import MainLayout from './layouts/MainLayout';

function App() {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route index element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />

				<Route element={<DocumentContainer />}>
					<Route path="hiring-process/:uid" element={<HiringProcessPage />} />
				</Route>

				<Route element={<ProtectedRoute />}>
					<Route path="/dashboard" element={<Dashboard />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default App;
