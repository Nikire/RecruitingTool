import api from "./axios";

export interface RequestDemoDto {
  email: string;
  name?: string;
  company?: string;
}

export interface DemoBookingResponse {
  token: string;
  bookingUrl: string;
  expiresAt: string;
}

export interface DemoTimeSlot {
  uid: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DemoCalendarSettings {
  workingDays: number[];
  advanceBookingDays: number;
  blockedDates?: string[];
}

export const requestDemo = (
  dto: RequestDemoDto,
): Promise<DemoBookingResponse> =>
  api
    .post<DemoBookingResponse>("/demo-booking/request", dto)
    .then((res) => res.data);

export const getDemoSlots = (token: string): Promise<DemoTimeSlot[]> =>
  api
    .get<DemoTimeSlot[]>(`/demo-booking/slots/${token}`)
    .then((res) => res.data);

export const getDemoSettings = (token: string): Promise<DemoCalendarSettings> =>
  api
    .get<DemoCalendarSettings>(`/demo-booking/settings/${token}`)
    .then((res) => res.data);

export const confirmDemoSlot = (
  token: string,
  slotUid: string,
): Promise<DemoTimeSlot> =>
  api
    .post<DemoTimeSlot>(`/demo-booking/confirm/${token}`, { slotUid })
    .then((res) => res.data);
