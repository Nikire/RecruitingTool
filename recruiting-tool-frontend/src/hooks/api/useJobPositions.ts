import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
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
	const {t} = useTranslation();

	return useMutation({
		mutationFn: (data: Partial<JobPosition>) => createJobPosition(data),
		onSuccess: () => {
			// Invalidate all job position queries including public career page
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast(t('job_positions.created_success'));
		},
		onError: (error) => {
			showErrorToast(error, t('job_positions.create_error'));
		},
	});
}

export function useUpdateJobPosition() {
	const queryClient = useQueryClient();
	const {t} = useTranslation();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: Partial<JobPosition>}) =>
			updateJobPosition(data, uid),
		onSuccess: () => {
			// Invalidate all job position queries including public career page
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast(t('job_positions.updated_success'));
		},
		onError: (error) => {
			showErrorToast(error, t('job_positions.update_error'));
		},
	});
}

export function useDeleteJobPosition() {
	const queryClient = useQueryClient();
	const {t} = useTranslation();

	return useMutation({
		mutationFn: (uid: string) => deleteJobPosition(uid),
		onSuccess: () => {
			// Invalidate all job position queries including public career page
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
			showSuccessToast(t('job_positions.deleted_success'));
		},
		onError: (error) => {
			showErrorToast(error, t('job_positions.delete_error'));
		},
	});
}
