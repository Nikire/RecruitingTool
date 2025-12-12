/**
 * Utility Functions - Barrel Export
 *
 * Centralized export point for all utility modules.
 * Allows clean imports: import { formatDate, showToast } from '@/utils'
 */

// Date Formatting Utilities
export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatRelativeDescription,
  formatDateRange,
  formatDateDistance,
  isValidDate,
  formatDateISO,
  getDateLocale,
  type SupportedLanguage,
} from "./dateFormatters";

// Legacy Date Utilities (deprecated - use dateFormatters instead)
export {
  formatDate as legacyFormatDate,
  formatDateTime as legacyFormatDateTime,
  getRelativeTime,
} from "./dateUtils";

// Toast Notifications
export {
  showToast,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
} from "./toast";

// Status Color Utilities
export {
  getApplicationStatusColor,
  getHiringProcessStatusColor,
  getUserRoleColor,
} from "./statusColors";

// Form Validation
export { useValidationRules } from "./validation";

// Permission Utilities
export * from "./permissions";
