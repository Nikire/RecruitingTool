import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getStatusColor,
  getStatusTranslationKey,
  type StatusDomain,
} from "../../theme/statusPalette";

/**
 * Supported status types for the StatusChip component.
 *
 * Aliased to `StatusDomain` so this component and `StatusLabel` speak the exact
 * same vocabulary — there is one list of domains, in `theme/statusPalette.ts`.
 */
export type StatusType = StatusDomain;

/**
 * Props for the StatusChip component
 */
export interface StatusChipProps {
  /** The status value to display */
  status: string;
  /** The type of status (selects the domain-specific colour overrides) */
  type: StatusType;
  /** Size of the chip */
  size?: "small" | "medium";
  /** Whether to translate the status text using i18n (default: false) */
  translate?: boolean;
  /** Optional i18n namespace prefix for translation (e.g., 'status.') */
  translationPrefix?: string;
  /** Optional custom variant */
  variant?: "filled" | "outlined";
}

/**
 * StatusChip - Reusable status chip component with type-based color logic.
 *
 * Colours come from `theme/statusPalette.ts`, the single source of truth shared
 * with `StatusLabel`. This component owns *presentation* only; it must never
 * re-derive a colour locally.
 *
 * @example
 * ```tsx
 * <StatusChip
 *   status="PENDING"
 *   type="application"
 *   translate
 *   translationPrefix="status."
 * />
 * ```
 *
 * @example With job position status
 * ```tsx
 * <StatusChip
 *   status="OPEN"
 *   type="jobPosition"
 *   size="small"
 * />
 * ```
 */
const StatusChip: React.FC<StatusChipProps> = ({
  status,
  type,
  size = "small",
  translate = false,
  translationPrefix = "status.",
  variant = "filled",
}) => {
  const { t } = useTranslation();

  /**
   * Get the display label for the status
   */
  const getLabel = () => {
    if (translate) {
      return t(getStatusTranslationKey(status, translationPrefix));
    }
    return status;
  };

  return (
    <Chip
      label={getLabel()}
      color={getStatusColor(status, type)}
      size={size}
      variant={variant}
      aria-label={`${t("aria.status")}: ${getLabel()}`}
    />
  );
};

export default StatusChip;
