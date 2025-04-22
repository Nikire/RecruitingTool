import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	createJobPosition,
	deleteJobPosition,
	getJobPositions,
	updateJobPosition,
} from '../../api/jobPositions';
import {JobPosition} from '../../types/jobPosition.types';
//import {MessageResponse} from '../../types/responses'; // TODO: implement toasts

const JOB_POSITIONS_KEY = 'jobPositions';

export function useJobPositions(uid?: string) {
	return useQuery({
		queryKey: uid ? [JOB_POSITIONS_KEY, uid] : [JOB_POSITIONS_KEY],
		queryFn: () => getJobPositions(uid),
	});
}

export function useCreateJobPosition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<JobPosition>) => createJobPosition(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
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
		},
	});
}

export function useDeleteJobPosition() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteJobPosition(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [JOB_POSITIONS_KEY]});
		},
	});
}
