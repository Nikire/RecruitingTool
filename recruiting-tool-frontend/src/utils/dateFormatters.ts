/**
 * Date Formatting Utilities
 *
 * Centralized date formatting functions using date-fns with i18n support.
 * Replaces repeated date formatting logic across components.
 *
 * @module dateFormatters
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  isValid,
  parseISO,
} from "date-fns";
import { es, enUS } from "date-fns/locale";

/**
 * Supported languages for date formatting
 */
export type SupportedLanguage = "en" | "es";

/**
 * Get date-fns locale based on language code
 * @param language - Language code ('en' or 'es')
 * @returns date-fns locale object
 */
export const getDateLocale = (language: SupportedLanguage | string): Locale => {
  return language === "es" ? es : enUS;
};

/**
 * Parse a date value to a valid Date object
 * @param date - Date string, Date object, or null/undefined
 * @returns Valid Date object or null
 */
const parseDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;

  const parsedDate = typeof date === "string" ? parseISO(date) : date;

  return isValid(parsedDate) ? parsedDate : null;
};

/**
 * Format date to standard format: "Dec 10, 2025" or localized equivalent
 * @param date - Date to format (string or Date object)
 * @param formatStr - Optional custom format string (date-fns format)
 * @param language - Language code for localization ('en' or 'es')
 * @returns Formatted date string or fallback
 *
 * @example
 * ```ts
 * formatDate('2025-12-10') // "Dec 10, 2025"
 * formatDate('2025-12-10', 'PPP', 'es') // "10 de diciembre de 2025"
 * formatDate('2025-12-10', 'yyyy-MM-dd') // "2025-12-10"
 * ```
 */
export const formatDate = (
  date: string | Date | null | undefined,
  formatStr: string = "MMM dd, yyyy",
  language: SupportedLanguage | string = "en",
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "-";

  const locale = getDateLocale(language);
  return format(parsedDate, formatStr, { locale });
};

/**
 * Format date with time: "Dec 10, 2025, 3:30 PM" or localized equivalent
 * @param date - Date to format (string or Date object)
 * @param language - Language code for localization ('en' or 'es')
 * @returns Formatted date-time string or fallback
 *
 * @example
 * ```ts
 * formatDateTime('2025-12-10T15:30:00') // "Dec 10, 2025, 3:30 PM"
 * formatDateTime('2025-12-10T15:30:00', 'es') // "10 dic 2025, 15:30"
 * ```
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  language: SupportedLanguage | string = "en",
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "-";

  const locale = getDateLocale(language);
  return format(parsedDate, "MMM dd, yyyy, h:mm a", { locale });
};

/**
 * Format relative time from now: "2 hours ago", "in 5 minutes", etc.
 * @param date - Date to format (string or Date object)
 * @param language - Language code for localization ('en' or 'es')
 * @param addSuffix - Whether to add "ago" or "in" suffix (default: true)
 * @returns Relative time string or fallback
 *
 * @example
 * ```ts
 * formatRelativeTime('2025-12-10T10:00:00') // "2 hours ago"
 * formatRelativeTime('2025-12-10T10:00:00', 'es') // "hace 2 horas"
 * formatRelativeTime('2025-12-11T10:00:00') // "in 22 hours"
 * ```
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined,
  language: SupportedLanguage | string = "en",
  addSuffix: boolean = true,
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "-";

  const locale = getDateLocale(language);
  return formatDistanceToNow(parsedDate, { addSuffix, locale });
};

/**
 * Format relative description: "yesterday at 3:20 PM", "last Friday at 10:00 AM", etc.
 * @param date - Date to format (string or Date object)
 * @param baseDate - Reference date (default: now)
 * @param language - Language code for localization ('en' or 'es')
 * @returns Relative description string or fallback
 *
 * @example
 * ```ts
 * formatRelativeDescription('2025-12-09T15:00:00') // "yesterday at 3:00 PM"
 * formatRelativeDescription('2025-12-09T15:00:00', new Date(), 'es') // "ayer a las 15:00"
 * ```
 */
export const formatRelativeDescription = (
  date: string | Date | null | undefined,
  baseDate: Date = new Date(),
  language: SupportedLanguage | string = "en",
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "-";

  const locale = getDateLocale(language);
  return formatRelative(parsedDate, baseDate, { locale });
};

/**
 * Format date range: "Dec 10 - Dec 15, 2025" or localized equivalent
 * @param startDate - Start date (string or Date object)
 * @param endDate - End date (string or Date object)
 * @param language - Language code for localization ('en' or 'es')
 * @returns Formatted date range string or fallback
 *
 * @example
 * ```ts
 * formatDateRange('2025-12-10', '2025-12-15') // "Dec 10 - Dec 15, 2025"
 * formatDateRange('2025-12-10', '2025-12-15', 'es') // "10 dic - 15 dic 2025"
 * formatDateRange('2025-12-10', '2026-01-05') // "Dec 10, 2025 - Jan 5, 2026"
 * ```
 */
export const formatDateRange = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  language: SupportedLanguage | string = "en",
): string => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);

  if (!parsedStartDate || !parsedEndDate) return "-";

  const locale = getDateLocale(language);

  // Same year - show compact format: "Dec 10 - Dec 15, 2025"
  if (parsedStartDate.getFullYear() === parsedEndDate.getFullYear()) {
    const start = format(parsedStartDate, "MMM dd", { locale });
    const end = format(parsedEndDate, "MMM dd, yyyy", { locale });
    return `${start} - ${end}`;
  }

  // Different years - show full format: "Dec 10, 2025 - Jan 5, 2026"
  const start = format(parsedStartDate, "MMM dd, yyyy", { locale });
  const end = format(parsedEndDate, "MMM dd, yyyy", { locale });
  return `${start} - ${end}`;
};

/**
 * Format distance between two dates: "2 hours", "3 days", etc.
 * @param startDate - Start date (string or Date object)
 * @param endDate - End date (string or Date object)
 * @param language - Language code for localization ('en' or 'es')
 * @returns Distance string or fallback
 *
 * @example
 * ```ts
 * formatDateDistance('2025-12-10T10:00:00', '2025-12-10T12:00:00') // "2 hours"
 * formatDateDistance('2025-12-10', '2025-12-13', 'es') // "3 días"
 * ```
 */
export const formatDateDistance = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  language: SupportedLanguage | string = "en",
): string => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);

  if (!parsedStartDate || !parsedEndDate) return "-";

  const locale = getDateLocale(language);
  return formatDistance(parsedStartDate, parsedEndDate, { locale });
};

/**
 * Validate if a date string/object is valid
 * @param date - Date to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * isValidDate('2025-12-10') // true
 * isValidDate('invalid') // false
 * isValidDate(null) // false
 * ```
 */
export const isValidDate = (
  date: string | Date | null | undefined,
): boolean => {
  return parseDate(date) !== null;
};

/**
 * Format date for API/database (ISO 8601): "2025-12-10T15:30:00.000Z"
 * @param date - Date to format
 * @returns ISO 8601 string or null
 *
 * @example
 * ```ts
 * formatDateISO(new Date()) // "2025-12-10T15:30:00.000Z"
 * ```
 */
export const formatDateISO = (
  date: string | Date | null | undefined,
): string | null => {
  const parsedDate = parseDate(date);
  if (!parsedDate) return null;

  return parsedDate.toISOString();
};
