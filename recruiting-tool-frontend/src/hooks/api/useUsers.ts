import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {usersApi} from '../../api/users';
import {CreateUserDto, UpdateUserDto} from '../../types/user.types';
import {PaginationParams} from '../../types/pagination.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const USERS_KEY = 'users';

export const useListUsers = (params: PaginationParams) => {
	return useQuery({
		queryKey: [USERS_KEY, 'list', params],
		queryFn: () => usersApi.list(params),
	});
};

export const useUsers = () => {
	return useQuery({
		queryKey: [USERS_KEY],
		queryFn: () => usersApi.getAll(),
	});
};

export const useUser = (uid: string) => {
	return useQuery({
		queryKey: [USERS_KEY, uid],
		queryFn: () => usersApi.getOne(uid),
		enabled: !!uid,
	});
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUserDto) => usersApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [USERS_KEY]});
			showSuccessToast('User created successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to create user');
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: UpdateUserDto}) => usersApi.update(uid, data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [USERS_KEY]});
			// Also invalidate the auth/me query to refresh the current user data
			queryClient.invalidateQueries({queryKey: ['auth', 'me']});
			showSuccessToast('User updated successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to update user');
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => usersApi.delete(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [USERS_KEY]});
			showSuccessToast('User deleted successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to delete user');
		},
	});
};
