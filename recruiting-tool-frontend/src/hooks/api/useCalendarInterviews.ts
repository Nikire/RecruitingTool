import { interviewKeys } from "../../api/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axios";
import { UpdateInterviewDto } from "../../types/interview.types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarInterviewOrganizer {
  uid: string;
  name: string;
  profilePicture?: string;
}

export interface CalendarInterviewCandidate {
  uid: string;
  name: string;
  email: string;
}

export interface CalendarInterviewJobPosition {
  uid: string;
  title: string;
}

export interface CalendarInterviewStage {
  uid: string;
  title: string;
  position?: number;
}

export interface CalendarInterview {
  uid: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  meetingLink?: string;
  status: string;
  notes?: string;
  candidate?: CalendarInterviewCandidate;
  jobPosition?: CalendarInterviewJobPosition;
  stage?: CalendarInterviewStage;
  organizer?: CalendarInterviewOrganizer;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetches all interviews for the company calendar within a date range.
 * Optionally filters by specific team member UIDs.
 */
export const useCompanyCalendarInterviews = (
  startDate: string,
  endDate: string,
  memberUids?: string[],
) => {
  return useQuery<CalendarInterview[]>({
    queryKey: interviewKeys.calendar(startDate, endDate, memberUids),
    queryFn: async () => {
      const params: Record<string, string> = {
        startDate,
        endDate,
      };

      if (memberUids && memberUids.length > 0) {
        params.memberUids = memberUids.join(",");
      }

      const response = await axiosInstance.get<CalendarInterview[]>(
        "/interview/calendar",
        { params },
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Reschedules an interview by updating its date/time via PATCH /interviews/:uid.
 * Invalidates all calendar and interview queries on success.
 */
export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: UpdateInterviewDto }) =>
      axiosInstance
        .patch<CalendarInterview>(`/interview/${uid}`, data)
        .then((res) => res.data),
    onSuccess: () => {
      toast.success(t("success.interview_rescheduled"));
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_reschedule_failed"),
      );
    },
  });
};

/**
 * Updates the notes field of an interview via PATCH /interview/:uid.
 */
export const useUpdateInterviewNotes = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ uid, notes }: { uid: string; notes: string | null }) =>
      axiosInstance
        .patch<CalendarInterview>(`/interview/${uid}`, { notes })
        .then((res) => res.data),
    onSuccess: (_data, { notes }) => {
      toast.success(
        notes === null || notes === ""
          ? t("interviews.notes_cleared")
          : t("interviews.notes_saved"),
      );
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.generic"),
      );
    },
  });
};

/**
 * Cancels an interview via DELETE /interviews/:uid.
 * Invalidates all calendar and interview queries on success.
 */
export const useCancelCalendarInterview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) =>
      axiosInstance
        .delete<{ message: string }>(`/interview/${uid}`)
        .then((res) => res.data),
    onSuccess: () => {
      toast.success(t("success.interview_cancelled"));
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("errors.interview_cancel_failed"),
      );
    },
  });
};
