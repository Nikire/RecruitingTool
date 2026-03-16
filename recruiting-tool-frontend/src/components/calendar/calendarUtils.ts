/**
 * Calendar utility functions shared across calendar components.
 */

const ORGANIZER_COLORS = [
  "#1976d2",
  "#388e3c",
  "#d32f2f",
  "#7b1fa2",
  "#f57c00",
  "#0097a7",
  "#c62828",
  "#283593",
  "#2e7d32",
  "#6a1b9a",
];

/**
 * Returns a deterministic color based on a uid string.
 */
export const getOrganizerColor = (uid: string): string => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ORGANIZER_COLORS.length;
  return ORGANIZER_COLORS[index];
};

/**
 * Returns a date string in YYYY-MM-DD format for a given Date object.
 */
export const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Returns an array of Date objects representing all days in a calendar month grid
 * (6 weeks x 7 days, starting from the Sunday/Monday of the week that contains the 1st).
 */
export const getMonthGridDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  // Start on Monday (1) not Sunday (0)
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const start = new Date(firstDay);
  start.setDate(start.getDate() - startDow);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};

/**
 * Returns an array of 7 Date objects starting from the Monday of the week containing `baseDate`.
 */
export const getWeekDays = (baseDate: Date): Date[] => {
  const dow = baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

/**
 * Short weekday names (Mon, Tue, ...) in English.
 * Components should replace these with i18n-aware versions if needed.
 */
export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Hour range shown in week/day views */
export const HOUR_START = 8;
export const HOUR_END = 20;

/**
 * Parses a "HH:MM" time string into total minutes from midnight.
 */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};
