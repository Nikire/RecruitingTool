import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
	getCandidates,
	getCandidate,
	createCandidate,
	updateCandidate,
	deleteCandidate,
} from '../../api/candidates';
import {Candidate} from '../../types/candidate';

const CANDIDATES_KEY = 'candidates';

export function useCandidates() {
	return useQuery({
		queryKey: [CANDIDATES_KEY],
		queryFn: getCandidates,
	});
}

export function useCandidate(uid: string) {
	return useQuery({
		queryKey: [CANDIDATES_KEY, uid],
		queryFn: () => getCandidate(uid),
		enabled: !!uid,
	});
}

export function useCreateCandidate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<Candidate>) => createCandidate(data),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [CANDIDATES_KEY]});
		},
	});
}

export function useUpdateCandidate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({uid, data}: {uid: string; data: Partial<Candidate>}) =>
			updateCandidate(data, uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [CANDIDATES_KEY]});
		},
	});
}

export function useDeleteCandidate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (uid: string) => deleteCandidate(uid),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: [CANDIDATES_KEY]});
		},
	});
}
