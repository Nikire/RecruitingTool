import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

import {HiringProcess, CreateHiringProcessDto} from '../../types/hiringProcess.types';
import {
	createHiringProcess,
	deleteHiringProcess,
	getHiringProcesses,
	listHiringProcesses,
	updateHiringProcess,
	progressStage,
	moveToStage,
} from '../../api/hiringProcess';
import {PaginationParams} from '../../types/pagination.types';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const HIRING_PROCESS_KEY = 'hiringProcess';

export function useHiringProcesses(uid?: string) {
	return useQuery({
		queryKey: uid ? [HIRING_PROCESS_KEY, uid] : [HIRING_PROCESS_KEY],
		queryFn: () => getHiringProcesses(uid),
	});
}

export function useListHiringProcesses(params: PaginationParams) {
	return useQuery({
		queryKey: [HIRING_PROCESS_KEY, 'list', params],
		queryFn: () => listHiringProcesses(params),
	});
}

export function useCreateHiringProcess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateHiringProcessDto) => createHiringProcess(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
			showSuccessToast('Hiring process created successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to create hiring process');
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
			showSuccessToast('Hiring process updated successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to update hiring process');
		},
	});
}

export function useDeleteHiringProcess() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteHiringProcess(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
			showSuccessToast('Hiring process deleted successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to delete hiring process');
		},
	});
}

export function useProgressStage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => progressStage(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
			showSuccessToast('Stage progressed successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to progress stage');
		},
	});
}

export function useMoveToStage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, stageUid}: {uid: string; stageUid: string}) => moveToStage(uid, stageUid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [HIRING_PROCESS_KEY]});
			showSuccessToast('Candidate moved to stage successfully!');
		},
		onError: (error) => {
			showErrorToast(error, 'Failed to move candidate to stage');
		},
	});
}
