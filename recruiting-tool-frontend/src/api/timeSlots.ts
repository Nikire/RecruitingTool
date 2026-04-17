import axios from "./axios";
import {
  TimeSlotResponse,
  BookingTokenResponse,
  GenerateTimeSlotsRequest,
  GenerateCustomTimeSlotsRequest,
  SelectTimeSlotRequest,
} from "../types/timeSlots.types";

const TIME_SLOTS_BASE_URL = "/time-slots";

// ==================== PROTECTED ENDPOINTS (HR/ADMIN) ====================

/**
 * Generate time slots from HR schedule availability
 */
export const generateTimeSlots = async (
  data: GenerateTimeSlotsRequest,
): Promise<TimeSlotResponse[]> => {
  const response = await axios.post<TimeSlotResponse[]>(
    `${TIME_SLOTS_BASE_URL}/generate`,
    data,
  );
  return response.data;
};

/**
 * Generate custom time slots manually
 */
export const generateCustomTimeSlots = async (
  data: GenerateCustomTimeSlotsRequest,
): Promise<TimeSlotResponse[]> => {
  const response = await axios.post<TimeSlotResponse[]>(
    `${TIME_SLOTS_BASE_URL}/generate-custom`,
    data,
  );
  return response.data;
};

/**
 * Generate booking token for an interview
 */
export const generateBookingToken = async (
  interviewUid: string,
): Promise<BookingTokenResponse> => {
  const response = await axios.post<BookingTokenResponse>(
    `${TIME_SLOTS_BASE_URL}/booking-token/${interviewUid}`,
  );
  return response.data;
};

/**
 * Get all time slots for an interview (HR view)
 */
export const getTimeSlotsByInterview = async (
  interviewUid: string,
): Promise<TimeSlotResponse[]> => {
  const response = await axios.get<TimeSlotResponse[]>(
    `${TIME_SLOTS_BASE_URL}/interview/${interviewUid}`,
  );
  return response.data;
};

/**
 * Cancel selected time slot and re-open all slots
 */
export const cancelSlotSelection = async (
  interviewUid: string,
): Promise<void> => {
  await axios.delete(`${TIME_SLOTS_BASE_URL}/cancel/${interviewUid}`);
};

// ==================== PUBLIC ENDPOINTS (CANDIDATE) ====================

/**
 * Get available time slots using booking token (PUBLIC - no auth required)
 */
export const getAvailableSlots = async (
  token: string,
): Promise<TimeSlotResponse[]> => {
  const response = await axios.get<TimeSlotResponse[]>(
    `${TIME_SLOTS_BASE_URL}/available/${token}`,
  );
  return response.data;
};

/**
 * Select a time slot using booking token (PUBLIC - no auth required)
 */
export const selectTimeSlot = async (
  token: string,
  data: SelectTimeSlotRequest,
): Promise<TimeSlotResponse> => {
  const response = await axios.post<TimeSlotResponse>(
    `${TIME_SLOTS_BASE_URL}/select/${token}`,
    data,
  );
  return response.data;
};

// ==================== NEW PROTECTED ENDPOINTS ====================

export interface SendBookingLinkResponse {
  bookingUrl: string;
  expiresAt: string;
  candidateEmail: string;
  slotsGenerated: number;
}

/**
 * Send booking link email to candidate for an interview (PROTECTED)
 */
export const sendBookingLink = async (
  interviewUid: string,
): Promise<SendBookingLinkResponse> => {
  const response = await axios.post<SendBookingLinkResponse>(
    `${TIME_SLOTS_BASE_URL}/send-booking-link/${interviewUid}`,
  );
  return response.data;
};

// ==================== NEW PUBLIC ENDPOINTS ====================

export interface CalendarSettingsPublic {
  workingDays: number[];
  blockedDates: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  advanceBookingDays: number;
}

/**
 * Get calendar settings using booking token (PUBLIC - no auth required)
 */
export const getCalendarSettingsByToken = async (
  token: string,
): Promise<CalendarSettingsPublic> => {
  const response = await axios.get<CalendarSettingsPublic>(
    `${TIME_SLOTS_BASE_URL}/settings/${token}`,
  );
  return response.data;
};
