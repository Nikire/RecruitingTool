import { useQuery } from '@tanstack/react-query';
import { getCandidateActivities } from '../../api/candidates';
import { CandidateActivity } from '../../types/candidate-activity.types';

export const useCandidateActivities = (candidateUid: string) => {
  return useQuery<CandidateActivity[], Error>({
    queryKey: ['candidateActivities', candidateUid],
    queryFn: () => getCandidateActivities(candidateUid),
    enabled: !!candidateUid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
