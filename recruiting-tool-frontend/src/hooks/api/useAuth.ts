import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getCurrentUser, login, register} from '../../api/auth';
import {User} from '../../types/user.types';

const AUTH_KEY = 'auth';

export function useAuthMe() {
	const {
		data: user,
		isLoading,
		isError,
	} = useQuery<User>({
		queryKey: ['auth', 'me'],
		queryFn: getCurrentUser,
		retry: 0,
	});

	return {
		user,
		isLoading,
		isError,
		isAuthenticated: !!user,
	};
}

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			localStorage.setItem('authToken', data.token);
			queryClient.invalidateQueries({queryKey: [AUTH_KEY, 'me']});
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: register,
		onSuccess: (data) => {
			localStorage.setItem('authToken', data.token);
			queryClient.invalidateQueries({queryKey: [AUTH_KEY, 'me']});
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();

	return () => {
		localStorage.removeItem('authToken');
		queryClient.removeQueries({queryKey: [AUTH_KEY, 'me']});
	};
}
