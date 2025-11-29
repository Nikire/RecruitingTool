import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  generateTimeSlots,
  generateCustomTimeSlots,
  generateBookingToken,
  getTimeSlotsByInterview,
  cancelSlotSelection,
  getAvailableSlots,
  selectTimeSlot,
} from '../../api/timeSlots';
import {
  GenerateTimeSlotsRequest,
  GenerateCustomTimeSlotsRequest,
  SelectTimeSlotRequest,
  TimeSlotResponse,
  BookingTokenResponse,
} from '../../types/timeSlots.types';
import toast from 'react-hot-toast';

// ==================== PROTECTED HOOKS (HR/ADMIN) ====================

/**
 * Get all time slots for an interview (HR view)
 */
export const useTimeSlotsByInterview = (interviewUid: string | null) => {
  return useQuery<TimeSlotResponse[]>({
    queryKey: ['timeSlots', 'interview', interviewUid],
    queryFn: () => getTimeSlotsByInterview(interviewUid!),
    enabled: !!interviewUid,
  });
};

/**
 * Generate time slots from HR schedule
 */
export const useGenerateTimeSlots = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeSlotResponse[], Error, GenerateTimeSlotsRequest>({
    mutationFn: generateTimeSlots,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeSlots', 'interview', variables.interviewUid],
      });
      toast.success('Time slots generated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate time slots');
    },
  });
};

/**
 * Generate custom time slots
 */
export const useGenerateCustomTimeSlots = () => {
  const queryClient = useQueryClient();

  return useMutation<TimeSlotResponse[], Error, GenerateCustomTimeSlotsRequest>({
    mutationFn: generateCustomTimeSlots,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeSlots', 'interview', variables.interviewUid],
      });
      toast.success('Custom time slots generated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate custom time slots');
    },
  });
};

/**
 * Generate booking token for interview
 */
export const useGenerateBookingToken = () => {
  return useMutation<BookingTokenResponse, Error, string>({
    mutationFn: generateBookingToken,
    onSuccess: () => {
      toast.success('Booking token generated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate booking token');
    },
  });
};

/**
 * Cancel time slot selection
 */
export const useCancelSlotSelection = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: cancelSlotSelection,
    onSuccess: (_, interviewUid) => {
      queryClient.invalidateQueries({
        queryKey: ['timeSlots', 'interview', interviewUid],
      });
      queryClient.invalidateQueries({
        queryKey: ['interviews'],
      });
      toast.success('Time slot selection cancelled');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel slot selection');
    },
  });
};

// ==================== PUBLIC HOOKS (CANDIDATE) ====================

/**
 * Get available time slots using booking token (PUBLIC)
 */
export const useAvailableSlots = (token: string | null) => {
  return useQuery<TimeSlotResponse[]>({
    queryKey: ['timeSlots', 'available', token],
    queryFn: () => getAvailableSlots(token!),
    enabled: !!token,
    retry: false, // Don't retry on 404/403
  });
};

/**
 * Select a time slot (PUBLIC)
 */
export const useSelectTimeSlot = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TimeSlotResponse,
    Error,
    { token: string; data: SelectTimeSlotRequest }
  >({
    mutationFn: ({ token, data }) => selectTimeSlot(token, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['timeSlots', 'available', variables.token],
      });
      toast.success('Interview time slot selected successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to select time slot');
    },
  });
};
