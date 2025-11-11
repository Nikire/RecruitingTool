import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getStage,
	createStage,
	bulkCreateStages,
	updateStage,
	deleteStage,
} from '../../api/stages';
import {Stage} from '../../types/stage.types';

const STAGES_KEY = 'stages';

export function useStage(uid: string) {
	return useQuery({
		queryKey: [STAGES_KEY, uid],
		queryFn: () => getStage(uid),
		enabled: !!uid,
	});
}

export function useCreateStage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<Stage>) => createStage(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['jobPositions']});
			queryClient.invalidateQueries({queryKey: [STAGES_KEY]});
		},
	});
}

export function useBulkCreateStages() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<Stage>[]) => bulkCreateStages(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['jobPositions']});
			queryClient.invalidateQueries({queryKey: [STAGES_KEY]});
		},
	});
}

export function useUpdateStage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: Partial<Stage>}) =>
			updateStage(data, uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['jobPositions']});
			queryClient.invalidateQueries({queryKey: ['hiringProcess']});
			queryClient.invalidateQueries({queryKey: [STAGES_KEY]});
		},
	});
}

export function useDeleteStage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteStage(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['jobPositions']});
			queryClient.invalidateQueries({queryKey: [STAGES_KEY]});
		},
	});
}
