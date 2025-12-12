import { Typography } from "@mui/material";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { CellRow } from "../CellLayouts";

interface DateCellProps {
  /**
   * The date value to display
   */
  value: string | Date | null | undefined;
  /**
   * Format string for date-fns
   * @default 'MMM dd, yyyy'
   */
  formatString?: string;
  /**
   * Show relative time (e.g., "2 days ago") instead of absolute date
   * @default false
   */
  relative?: boolean;
  /**
   * Include time in the display
   * @default false
   */
  showTime?: boolean;
  /**
   * Fallback text when date is invalid or null
   * @default '-'
   */
  fallback?: string;
}

/**
 * DateCell - Consistent date formatting for DataGrid cells
 *
 * @example
 * ```tsx
 * // In column definition
 * {
 *   field: 'createdAt',
 *   headerName: 'Created',
 *   renderCell: (params) => <DateCell value={params.value} />
 * }
 *
 * // With relative time
 * <DateCell value={date} relative />
 *
 * // With time
 * <DateCell value={date} showTime />
 * ```
 */
const DateCell: React.FC<DateCellProps> = ({
  value,
  formatString,
  relative = false,
  showTime = false,
  fallback = "-",
}) => {
  if (!value) {
    return (
      <CellRow>
        <Typography variant="body2" color="text.secondary">
          {fallback}
        </Typography>
      </CellRow>
    );
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (!isValid(date)) {
    return (
      <CellRow>
        <Typography variant="body2" color="text.secondary">
          {fallback}
        </Typography>
      </CellRow>
    );
  }

  let displayText: string;

  if (relative) {
    displayText = formatDistanceToNow(date, { addSuffix: true });
  } else {
    const defaultFormat = showTime ? "MMM dd, yyyy HH:mm" : "MMM dd, yyyy";
    displayText = format(date, formatString || defaultFormat);
  }

  return (
    <CellRow>
      <Typography variant="body2" title={format(date, "PPpp")}>
        {displayText}
      </Typography>
    </CellRow>
  );
};

export default DateCell;
