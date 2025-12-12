import { useState, MouseEvent } from "react";
import {
  Box,
  Chip,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArchiveIcon from "@mui/icons-material/Archive";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

/**
 * Status option configuration for StatusBadgeEditor
 */
export interface StatusOption {
  /** The status value (e.g., 'OPEN', 'CLOSED') */
  value: string;
  /** i18n translation key for the status label */
  labelKey: string;
  /** MUI color for the status chip */
  color:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success"
    | "default";
  /** Optional icon to display in the menu */
  icon?: React.ReactNode;
}

/**
 * Props for the StatusBadgeEditor component
 */
export interface StatusBadgeEditorProps {
  /** Current status value */
  currentStatus: string;
  /** Array of available status options */
  statusOptions: StatusOption[];
  /** Callback when status is changed */
  onChange: (newStatus: string) => void;
  /** Whether the editor is disabled (e.g., during save) */
  disabled?: boolean;
  /** Size of the chip */
  size?: "small" | "medium";
  /** Optional label to display before the chip */
  label?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Default icons for common statuses
 */
const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  OPEN: <CheckCircleIcon fontSize="small" />,
  CLOSED: <CancelIcon fontSize="small" />,
  CANCELLED: <CancelIcon fontSize="small" />,
  ARCHIVED: <ArchiveIcon fontSize="small" />,
  ACTIVE: <CheckCircleIcon fontSize="small" />,
  IN_PROGRESS: <HourglassEmptyIcon fontSize="small" />,
  REJECTED: <CancelIcon fontSize="small" />,
};

/**
 * StatusBadgeEditor - Click-to-edit status badge with visual menu
 *
 * Displays current status as a chip/badge and allows users to change it by clicking.
 * Opens a menu with available status options for selection.
 *
 * @example
 * ```tsx
 * const statusOptions: StatusOption[] = [
 *   { value: 'OPEN', labelKey: 'status.open', color: 'success' },
 *   { value: 'CLOSED', labelKey: 'status.closed', color: 'default' },
 *   { value: 'CANCELLED', labelKey: 'status.cancelled', color: 'error' },
 * ];
 *
 * <StatusBadgeEditor
 *   currentStatus="OPEN"
 *   statusOptions={statusOptions}
 *   onChange={(newStatus) => updateStatus(newStatus)}
 *   label="Status:"
 * />
 * ```
 */
const StatusBadgeEditor: React.FC<StatusBadgeEditorProps> = ({
  currentStatus,
  statusOptions,
  onChange,
  disabled = false,
  size = "small",
  label,
  ariaLabel,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Find the current status option
  const currentOption = statusOptions.find(
    (opt) => opt.value === currentStatus,
  );

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (statusValue: string) => {
    if (statusValue !== currentStatus) {
      onChange(statusValue);
    }
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}

      <Chip
        label={currentOption ? t(currentOption.labelKey) : currentStatus}
        color={currentOption?.color || "default"}
        size={size}
        onClick={handleClick}
        onDelete={disabled ? undefined : () => {}} // Shows edit icon
        deleteIcon={<EditIcon fontSize="small" />}
        sx={{
          cursor: disabled ? "default" : "pointer",
          "&:hover": disabled
            ? {}
            : {
                opacity: 0.9,
                boxShadow: 1,
              },
          transition: "all 0.2s",
        }}
        disabled={disabled}
        aria-label={ariaLabel || t("status_editor.click_to_edit")}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: { minWidth: 180 },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t("status_editor.select_status")}
          </Typography>
        </MenuItem>

        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            selected={option.value === currentStatus}
          >
            <ListItemIcon>
              {option.icon || DEFAULT_ICONS[option.value]}
            </ListItemIcon>
            <ListItemText>
              <Chip
                label={t(option.labelKey)}
                color={option.color}
                size="small"
              />
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default StatusBadgeEditor;
