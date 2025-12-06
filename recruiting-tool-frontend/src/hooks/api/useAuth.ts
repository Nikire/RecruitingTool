import {useEffect} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getCurrentUser, login, register, updateProfile} from '../../api/auth';
import {User} from '../../types/user.types';
import {useUserAtom} from './state/useUserAtom';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const AUTH_KEY = 'auth';

export function useAuthMe() {
	const {setUser} = useUserAtom();
	const token = localStorage.getItem('authToken');

	const {
		data: user,
		isLoading,
		isError,
	} = useQuery<User>({
		queryKey: ['auth', 'me'],
		queryFn: getCurrentUser,
		retry: 0,
		enabled: !!token, // Only fetch if token exists
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
	});

	// Update user atom when data changes
	useEffect(() => {
		if (user) {
			setUser(user);
		} else if (!token) {
			setUser(null);
		}
	}, [user, token, setUser]);

	return {
		user,
		isLoading,
		isError,
		isAuthenticated: !!user && !!token,
	};
}

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			// Validate tokens before storing
			if (!data.token || typeof data.token !== 'string' || data.token === 'null' || data.token === 'undefined') {
				console.error('[AUTH] Invalid access token received:', data.token);
				showErrorToast(new Error('Invalid authentication token received'), 'Authentication failed');
				return;
			}

			if (!data.refreshToken || typeof data.refreshToken !== 'string' || data.refreshToken === 'null' || data.refreshToken === 'undefined') {
				console.error('[AUTH] Invalid refresh token received:', data.refreshToken);
				showErrorToast(new Error('Invalid refresh token received'), 'Authentication failed');
				return;
			}

			// Store both tokens
			localStorage.setItem('authToken', data.token);
			localStorage.setItem('refreshToken', data.refreshToken);

			// Invalidate to fetch user data
			queryClient.invalidateQueries({queryKey: [AUTH_KEY, 'me']});
			showSuccessToast('Login successful! Welcome back.');
		},
		onError: (error) => {
			showErrorToast(error, 'Login failed. Please check your credentials.');
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: register,
		onSuccess: (data) => {
			// Validate tokens before storing
			if (!data.token || typeof data.token !== 'string' || data.token === 'null' || data.token === 'undefined') {
				console.error('[AUTH] Invalid access token received during registration:', data.token);
				showErrorToast(new Error('Invalid authentication token received'), 'Registration failed');
				return;
			}

			if (!data.refreshToken || typeof data.refreshToken !== 'string' || data.refreshToken === 'null' || data.refreshToken === 'undefined') {
				console.error('[AUTH] Invalid refresh token received during registration:', data.refreshToken);
				showErrorToast(new Error('Invalid refresh token received'), 'Registration failed');
				return;
			}

			// Store both tokens
			localStorage.setItem('authToken', data.token);
			localStorage.setItem('refreshToken', data.refreshToken);

			// Invalidate to fetch user data
			queryClient.invalidateQueries({queryKey: [AUTH_KEY, 'me']});
			showSuccessToast('Account created successfully! Welcome aboard.');
		},
		onError: (error) => {
			showErrorToast(error, 'Registration failed. Please try again.');
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	const {setUser} = useUserAtom();

	return () => {
		// Clear both tokens
		localStorage.removeItem('authToken');
		localStorage.removeItem('refreshToken');
		setUser(null);
		queryClient.removeQueries({queryKey: [AUTH_KEY, 'me']});
	};
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	const {setUser} = useUserAtom();

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: (updatedUser) => {
			// Update user in cache and atom
			queryClient.setQueryData([AUTH_KEY, 'me'], updatedUser);
			setUser(updatedUser);
			showSuccessToast('Profile updated successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to update profile. Please try again.');
		},
	});
}
