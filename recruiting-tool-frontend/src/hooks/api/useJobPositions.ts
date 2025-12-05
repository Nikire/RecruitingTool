import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	createJobPosition,
	deleteJobPosition,
	getJobPositions,
	getPublicJobPositions,
	getPublicJobPosition,
	listJobPositions,
	updateJobPosition,
	PublicJobPositionFilters,
} from '../../api/jobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import {PaginationParams} from '../../types/pagination.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const JOB_POSITIONS_KEY = 'jobPositions';

export function usePublicJobPositions(filters?: PublicJobPositionFilters, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: [JOB_POSITIONS_KEY, 'public', filters],
		queryFn: () => getPublicJobPositions(filters),
		enabled: options?.enabled !== false,
	});
}

export function usePublicJobPosition(uid: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: [JOB_POSITIONS_KEY, 'public', uid],
		queryFn: () => getPublicJobPosition(uid),
		enabled: options?.enabled !== false && !!uid,
	});
}

export function useJobPositions(uid?: string) {
	return useQuery({
		queryKey: uid ? [JOB_POSITIONS_KEY, uid] : [JOB_POSITIONS_KEY],
		queryFn: () => getJobPositions(uid),
	});
}

export function useListJobPositions(params: PaginationParams, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: [JOB_POSITIONS_KEY, 'list', params],
		queryFn: () => listJobPositions(params),
		enabled: options?.enabled !== false,
	});
}

export function useCreateJobPosition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<JobPosition>) => createJobPosition(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast('Job position created successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to create job position');
		},
	});
}

export function useUpdateJobPosition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: Partial<JobPosition>}) =>
			updateJobPosition(data, uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast('Job position updated successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to update job position');
		},
	});
}

export function useDeleteJobPosition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteJobPosition(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast('Job position deleted successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to delete job position');
		},
	});
}
