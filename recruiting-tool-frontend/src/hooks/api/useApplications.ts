import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	createApplication,
	deleteApplication,
	getApplication,
	getApplications,
	getPublicJobPositions,
	updateApplication,
} from '../../api/applications';
import {
	ApplicationFilterDto,
	CreateApplicationDto,
	UpdateApplicationDto,
} from '../../types/application.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const APPLICATIONS_KEY = 'applications';
const PUBLIC_JOBS_KEY = 'publicJobs';

export function usePublicJobPositions() {
	return useQuery({
		queryKey: [PUBLIC_JOBS_KEY],
		queryFn: () => getPublicJobPositions(),
	});
}

export function useApplications(filters?: ApplicationFilterDto) {
	return useQuery({
		queryKey: [APPLICATIONS_KEY, filters],
		queryFn: () => getApplications(filters),
	});
}

export function useApplication(uid: string) {
	return useQuery({
		queryKey: [APPLICATIONS_KEY, uid],
		queryFn: () => getApplication(uid),
		enabled: !!uid,
	});
}

export function useCreateApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateApplicationDto) => createApplication(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [APPLICATIONS_KEY]});
			showSuccessToast('Application submitted successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to submit application');
		},
	});
}

export function useUpdateApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: UpdateApplicationDto}) =>
			updateApplication(uid, data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [APPLICATIONS_KEY]});
			showSuccessToast('Application updated successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to update application');
		},
	});
}

export function useDeleteApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteApplication(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [APPLICATIONS_KEY]});
			showSuccessToast('Application deleted successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to delete application');
		},
	});
}
