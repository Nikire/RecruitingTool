import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

import {HiringProcess} from '../../types/hiringProcess.types';
import {
	createHiringProcess,
	deleteHiringProcess,
	getHiringProcesses,
	updateHiringProcess,
} from '../../api/hiringProcess';
//import {MessageResponse} from '../../types/responses'; // TODO: implement toasts

const HIRING_PROCESS_KEY = 'hiringProcess';

export function useHiringProcesses(uid?: string) {
	return useQuery({
		queryKey: uid ? [HIRING_PROCESS_KEY, uid] : [HIRING_PROCESS_KEY],
		queryFn: () => getHiringProcesses(uid),
	});
}

export function useCreateHiringProcess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<HiringProcess>) => createHiringProcess(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
		},
	});
}

export function useUpdateHiringProcess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: Partial<HiringProcess>}) =>
			updateHiringProcess(data, uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
		},
	});
}

export function useDeleteHiringProcess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteHiringProcess(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
		},
	});
}
