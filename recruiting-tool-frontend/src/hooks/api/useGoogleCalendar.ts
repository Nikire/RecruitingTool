import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

export interface CalendarConnectionStatus {
  connected: boolean;
}

export interface WorkingHoursDay {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface WorkingHours {
  monday: WorkingHoursDay;
  tuesday: WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday: WorkingHoursDay;
  friday: WorkingHoursDay;
  saturday: WorkingHoursDay;
  sunday: WorkingHoursDay;
}

export interface CalendarSettingsResponse {
  bufferTime: number;
  defaultDuration: number;
  workingHours: WorkingHours;
}

export interface SaveCalendarSettingsDto {
  bufferTime: number;
  defaultDuration: number;
  workingHours: WorkingHours;
}

export interface AuthUrlResponse {
  authUrl: string;
  message: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  optional?: boolean;
}

export interface CreateCalendarEventDto {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  location?: string;
  attendees?: CalendarAttendee[];
  createMeetLink?: boolean;
  sendUpdates?: boolean;
}

export interface CalendarEventResponse {
  id: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  meetLink?: string;
  location?: string;
  attendees?: CalendarAttendee[];
  status: string;
  htmlLink: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilityResponse {
  busy: boolean;
  availableSlots: AvailabilitySlot[];
}

/**
 * Hook to get Google Calendar connection status
 */
export const useCalendarConnectionStatus = () => {
  return useQuery<CalendarConnectionStatus>({
    queryKey: ["google-calendar", "status"],
    queryFn: async () => {
      const response = await api.get<CalendarConnectionStatus>(
        "/google-calendar/status",
      );
      return response.data;
    },
  });
};

/**
 * Hook to get Google Calendar OAuth authorization URL
 */
export const useGetAuthUrl = () => {
  return useMutation<AuthUrlResponse>({
    mutationFn: async () => {
      const response = await api.get<AuthUrlResponse>(
        "/google-calendar/auth-url",
      );
      return response.data;
    },
  });
};

/**
 * Hook to disconnect Google Calendar
 */
export const useDisconnectCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }>({
    mutationFn: async () => {
      const response = await api.delete<{ message: string }>(
        "/google-calendar/disconnect",
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate calendar status query
      queryClient.invalidateQueries({
        queryKey: ["google-calendar", "status"],
      });
    },
  });
};

/**
 * Hook to create a calendar event with Google Meet
 */
export const useCreateCalendarEvent = () => {
  return useMutation<CalendarEventResponse, Error, CreateCalendarEventDto>({
    mutationFn: async (dto: CreateCalendarEventDto) => {
      const response = await api.post<CalendarEventResponse>(
        "/google-calendar/events",
        dto,
      );
      return response.data;
    },
  });
};

/**
 * Hook to update a calendar event
 */
export const useUpdateCalendarEvent = () => {
  return useMutation<
    CalendarEventResponse,
    Error,
    { eventId: string; dto: Partial<CreateCalendarEventDto> }
  >({
    mutationFn: async ({ eventId, dto }) => {
      const response = await api.put<CalendarEventResponse>(
        `/google-calendar/events/${eventId}`,
        dto,
      );
      return response.data;
    },
  });
};

/**
 * Hook to delete a calendar event
 */
export const useDeleteCalendarEvent = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (eventId: string) => {
      const response = await api.delete<{ message: string }>(
        `/google-calendar/events/${eventId}`,
      );
      return response.data;
    },
  });
};

/**
 * Hook to get user availability (free/busy)
 */
export const useGetAvailability = (params: {
  startDate: string;
  endDate: string;
  timeZone?: string;
}) => {
  return useQuery<AvailabilityResponse>({
    queryKey: ["google-calendar", "availability", params],
    queryFn: async () => {
      const response = await api.get<AvailabilityResponse>(
        "/google-calendar/availability",
        {
          params,
        },
      );
      return response.data;
    },
    enabled: !!params.startDate && !!params.endDate,
  });
};

/**
 * Hook to get calendar settings (working hours, buffer time, default duration)
 */
export const useGetCalendarSettings = () => {
  return useQuery<CalendarSettingsResponse>({
    queryKey: ["google-calendar", "settings"],
    queryFn: async () => {
      const response = await api.get<CalendarSettingsResponse>(
        "/google-calendar/settings",
      );
      return response.data;
    },
  });
};

/**
 * Hook to save calendar settings
 */
export const useSaveCalendarSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<CalendarSettingsResponse, Error, SaveCalendarSettingsDto>({
    mutationFn: async (dto: SaveCalendarSettingsDto) => {
      const response = await api.put<CalendarSettingsResponse>(
        "/google-calendar/settings",
        dto,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["google-calendar", "settings"], data);
    },
  });
};
