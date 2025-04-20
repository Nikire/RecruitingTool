import {useEffect, useState} from 'react';

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		const token = localStorage.getItem('authToken');
		// TODO: Authenticate the token with the backend
		setIsAuthenticated(!!token);
	}, []);

	return {isAuthenticated};
}
