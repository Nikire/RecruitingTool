import {Navigate, Outlet} from 'react-router';
import {useAuthMe} from '../../hooks/api/useAuth';

export function ProtectedRoute() {
	const {isAuthenticated, isLoading, isError} = useAuthMe();

	return isLoading ? null : isError ? (
		<Navigate to="/login" replace />
	) : isAuthenticated ? (
		<Outlet />
	) : (
		<Navigate to="/login" replace />
	);
}
