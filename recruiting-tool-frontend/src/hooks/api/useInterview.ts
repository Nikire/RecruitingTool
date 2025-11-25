import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createInterview,
  getInterview,
  getInterviewsByStage,
  updateInterview,
  cancelInterview,
  deleteInterview,
} from '../../api/interview';
import { CreateInterviewDto, UpdateInterviewDto } from '../../types/interview.types';

export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewDto) => createInterview(data),
    onSuccess: (data) => {
      toast.success('Interview scheduled successfully');
      // Invalidate interviews for this stage
      queryClient.invalidateQueries({ queryKey: ['interviews', 'stage', data.stageUid] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule interview');
    },
  });
};

export const useInterview = (uid: string) => {
  return useQuery({
    queryKey: ['interview', uid],
    queryFn: () => getInterview(uid),
    enabled: !!uid,
  });
};

export const useInterviewsByStage = (stageUid: string) => {
  return useQuery({
    queryKey: ['interviews', 'stage', stageUid],
    queryFn: () => getInterviewsByStage(stageUid),
    enabled: !!stageUid,
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateInterviewDto }) =>
      updateInterview(uid, data),
    onSuccess: (data) => {
      toast.success('Interview updated successfully');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['interview', data.uid] });
      queryClient.invalidateQueries({ queryKey: ['interviews', 'stage', data.stageUid] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update interview');
    },
  });
};

export const useCancelInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => cancelInterview(uid),
    onSuccess: (data) => {
      toast.success('Interview cancelled successfully');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['interview', data.uid] });
      queryClient.invalidateQueries({ queryKey: ['interviews', 'stage', data.stageUid] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel interview');
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, stageUid }: { uid: string; stageUid: string }) => deleteInterview(uid),
    onSuccess: (_, variables) => {
      toast.success('Interview deleted successfully');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['interviews', 'stage', variables.stageUid] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete interview');
    },
  });
};
