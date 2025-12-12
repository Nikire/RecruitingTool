import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * StatusFilterChips - Reusable component for displaying status filter chips with counts
 *
 * This component provides a consistent way to display filterable status options
 * as chips with item counts. Commonly used in list/detail pages to filter items by status.
 *
 * @template T - The type of status values (e.g., 'OPEN' | 'CLOSED')
 *
 * @example
 * // Basic usage
 * <StatusFilterChips
 *   options={['OPEN', 'IN_PROGRESS', 'CLOSED']}
 *   currentFilter="ALL"
 *   onFilterChange={(status) => setStatusFilter(status)}
 *   getCount={(status) => status === 'ALL' ? items.length : items.filter(i => i.status === status).length}
 * />
 *
 * @example
 * // With i18n translation
 * <StatusFilterChips
 *   options={['OPEN', 'CLOSED', 'ARCHIVED']}
 *   currentFilter={statusFilter}
 *   onFilterChange={setStatusFilter}
 *   getCount={(status) => calculateCount(status)}
 *   translateStatus
 *   translationPrefix="hiring_process_status."
 * />
 */

export interface StatusFilterChipsProps<T extends string> {
  /** Array of status options to display (e.g., ['OPEN', 'CLOSED', 'ARCHIVED']) */
  options: T[];

  /** Currently selected filter status (can be one of the options or 'ALL') */
  currentFilter: T | "ALL";

  /** Callback when a filter chip is clicked */
  onFilterChange: (status: T | "ALL") => void;

  /** Function to get the count for each status (including 'ALL') */
  getCount: (status: T | "ALL") => number;

  /** If true, translates status labels using i18n. If false, displays status as-is with formatting */
  translateStatus?: boolean;

  /** Translation prefix for status labels (e.g., 'hiring_process_status.') */
  translationPrefix?: string;
}

/**
 * StatusFilterChips Component
 *
 * Displays a row of clickable status filter chips with counts.
 * Each chip shows the status name and the number of items with that status.
 * The active filter is highlighted with primary color and filled variant.
 *
 * Features:
 * - Responsive flex layout with wrapping
 * - Active state highlighting
 * - Optional i18n support for status labels
 * - Consistent spacing and styling
 */
const StatusFilterChips = <T extends string>({
  options,
  currentFilter,
  onFilterChange,
  getCount,
  translateStatus = false,
  translationPrefix = "",
}: StatusFilterChipsProps<T>) => {
  const { t } = useTranslation();

  // Always include 'ALL' as the first option
  const allOptions: Array<T | "ALL"> = ["ALL", ...options];

  /**
   * Formats a status label for display
   * - If translateStatus=true: Uses i18n translation
   * - If translateStatus=false: Formats the raw status (e.g., 'IN_PROGRESS' → 'IN PROGRESS')
   */
  const formatStatusLabel = (status: T | "ALL"): string => {
    if (translateStatus && translationPrefix) {
      return t(`${translationPrefix}${status.toLowerCase()}`);
    }
    return status.replace(/_/g, " ");
  };

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      {allOptions.map((status) => {
        const count = getCount(status);
        const isActive = currentFilter === status;

        return (
          <Chip
            key={status}
            label={`${formatStatusLabel(status)} (${count})`}
            onClick={() => onFilterChange(status)}
            color={isActive ? "primary" : "default"}
            variant={isActive ? "filled" : "outlined"}
            clickable
          />
        );
      })}
    </Box>
  );
};

export default StatusFilterChips;
