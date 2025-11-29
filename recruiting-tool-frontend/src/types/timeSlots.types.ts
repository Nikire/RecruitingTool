/**
 * Time Slot Types
 * Matches backend DTOs for interview time slot management
 */

export interface TimeSlot {
  uid: string;
  interviewUid: string;
  startTime: Date | string;
  endTime: Date | string;
  isAvailable: boolean;
  selectedAt: Date | string | null;
  createdAt: Date | string;
}

export interface BookingToken {
  uid: string;
  token: string;
  interviewUid: string;
  expiresAt: Date | string;
  usedAt: Date | string | null;
  createdAt: Date | string;
  bookingUrl: string;
}

// ==================== Request DTOs ====================

export interface GenerateTimeSlotsRequest {
  interviewUid: string;
  hrScheduleUid: string;
  duration: number; // in minutes
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}

export interface GenerateCustomTimeSlotsRequest {
  interviewUid: string;
  slots: Array<{
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
  }>;
}

export interface SelectTimeSlotRequest {
  slotUid: string;
}

// ==================== Response DTOs ====================

export interface TimeSlotResponse {
  uid: string;
  interviewUid: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isAvailable: boolean;
  selectedAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
}

export interface BookingTokenResponse {
  uid: string;
  token: string;
  interviewUid: string;
  expiresAt: string; // ISO 8601
  usedAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  bookingUrl: string;
}
