import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateTimeSlots,
  generateCustomTimeSlots,
  generateBookingToken,
  getTimeSlotsByInterview,
  cancelSlotSelection,
  getAvailableSlots,
  selectTimeSlot,
  sendBookingLink,
  sendStageBookingLink,
  getCalendarSettingsByToken,
  type SendBookingLinkResponse,
  type CalendarSettingsPublic,
} from "../../api/timeSlots";
export type {
  SendBookingLinkResponse,
  CalendarSettingsPublic,
} from "../../api/timeSlots";
import {
  GenerateTimeSlotsRequest,
  GenerateCustomTimeSlotsRequest,
  SelectTimeSlotRequest,
  TimeSlotResponse,
  BookingTokenResponse,
} from "../../types/timeSlots.types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// ==================== PROTECTED HOOKS (HR/ADMIN) ====================

/**
 * Get all time slots for an interview (HR view)
 */
export const useTimeSlotsByInterview = (interviewUid: string | null) => {
  return useQuery<TimeSlotResponse[]>({
    queryKey: ["timeSlots", "interview", interviewUid],
    queryFn: () => getTimeSlotsByInterview(interviewUid!),
    enabled: !!interviewUid,
  });
};

/**
 * Generate time slots from HR schedule
 */
export const useGenerateTimeSlots = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<TimeSlotResponse[], Error, GenerateTimeSlotsRequest>({
    mutationFn: generateTimeSlots,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["timeSlots", "interview", variables.interviewUid],
      });
      toast.success(t("time_slots.generated"));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate time slots");
    },
  });
};

/**
 * Generate custom time slots
 */
export const useGenerateCustomTimeSlots = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<TimeSlotResponse[], Error, GenerateCustomTimeSlotsRequest>(
    {
      mutationFn: generateCustomTimeSlots,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["timeSlots", "interview", variables.interviewUid],
        });
        toast.success(t("time_slots.custom_generated"));
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate custom time slots");
      },
    },
  );
};

/**
 * Generate booking token for interview
 */
export const useGenerateBookingToken = () => {
  const { t } = useTranslation();
  return useMutation<BookingTokenResponse, Error, string>({
    mutationFn: generateBookingToken,
    onSuccess: () => {
      toast.success(t("time_slots.booking_token_generated"));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate booking token");
    },
  });
};

/**
 * Cancel time slot selection
 */
export const useCancelSlotSelection = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<void, Error, string>({
    mutationFn: cancelSlotSelection,
    onSuccess: (_, interviewUid) => {
      queryClient.invalidateQueries({
        queryKey: ["timeSlots", "interview", interviewUid],
      });
      queryClient.invalidateQueries({
        queryKey: ["interviews"],
      });
      toast.success(t("time_slots.selection_cancelled"));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel slot selection");
    },
  });
};

// ==================== PUBLIC HOOKS (CANDIDATE) ====================

/**
 * Get available time slots using booking token (PUBLIC)
 */
export const useAvailableSlots = (token: string | null) => {
  return useQuery<TimeSlotResponse[]>({
    queryKey: ["timeSlots", "available", token],
    queryFn: () => getAvailableSlots(token!),
    enabled: !!token,
    retry: false, // Don't retry on 404/403
  });
};

// ==================== NEW PROTECTED HOOKS ====================

/**
 * Send booking link to candidate for an interview
 */
export const useSendBookingLink = () => {
  const { t } = useTranslation();
  return useMutation<SendBookingLinkResponse, Error, string>({
    mutationFn: sendBookingLink,
    onError: (error) => {
      // Check for 403 (booking system not enabled)
      const axiosError = error as Error & {
        response?: { status: number };
      };
      if (axiosError?.response?.status === 403) {
        toast.error(t("booking_link.not_enabled"));
      } else {
        toast.error(error.message || t("booking_link.error"));
      }
    },
  });
};

/**
 * Create a draft interview + send booking link for a stage (candidate self-schedules)
 */
export const useSendStageBookingLink = () => {
  const { t } = useTranslation();
  return useMutation<SendBookingLinkResponse, Error, string>({
    mutationFn: sendStageBookingLink,
    onError: (error) => {
      const axiosError = error as Error & { response?: { status: number } };
      if (axiosError?.response?.status === 403) {
        toast.error(t("booking_link.not_enabled"));
      } else {
        toast.error(error.message || t("booking_link.error"));
      }
    },
  });
};

// ==================== NEW PUBLIC HOOKS ====================

/**
 * Get calendar settings using booking token (PUBLIC)
 */
export const useCalendarSettingsByToken = (token: string | null) => {
  return useQuery<CalendarSettingsPublic>({
    queryKey: ["calendarSettings", "token", token],
    queryFn: () => getCalendarSettingsByToken(token!),
    enabled: !!token,
    retry: false,
  });
};

/**
 * Select a time slot (PUBLIC)
 */
export const useSelectTimeSlot = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation<
    TimeSlotResponse,
    Error,
    { token: string; data: SelectTimeSlotRequest }
  >({
    mutationFn: ({ token, data }) => selectTimeSlot(token, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["timeSlots", "available", variables.token],
      });
      toast.success(t("time_slots.interview_selected"));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select time slot");
    },
  });
};
