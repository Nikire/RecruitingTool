import React from "react";
import {
  TableCell,
  TableSortLabel,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export interface TableHeaderCellProps {
  label: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  sx?: SxProps<Theme>;
  translate?: boolean; // Whether to use i18n for label
}

/**
 * TableHeaderCell - Reusable table header cell component
 *
 * Features:
 * - Consistent styling across all tables
 * - Optional sorting with visual indicators
 * - Configurable width and alignment
 * - i18n support
 *
 * Usage:
 * ```tsx
 * <TableHeaderCell
 *   label="candidates.name"
 *   sortable
 *   sortDirection={sortField === 'name' ? sortDirection : null}
 *   onSort={() => handleSort('name')}
 *   translate
 * />
 * ```
 */
const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  label,
  sortable = false,
  sortDirection = null,
  onSort,
  width,
  minWidth,
  align = "left",
  sx,
  translate = false,
}) => {
  const { t } = useTranslation();

  // Get display label (with i18n if translate is true)
  const displayLabel = translate ? t(label) : label;

  // Build sx props with width/minWidth
  const cellSx: SxProps<Theme> = {
    width,
    minWidth,
    ...sx,
  };

  // If sortable, wrap in TableSortLabel
  if (sortable && onSort) {
    return (
      <TableCell align={align} sx={cellSx}>
        <TableSortLabel
          active={sortDirection !== null}
          direction={sortDirection || "asc"}
          onClick={onSort}
        >
          <Typography variant="body2" fontWeight="600">
            {displayLabel}
          </Typography>
        </TableSortLabel>
      </TableCell>
    );
  }

  // Non-sortable header cell
  return (
    <TableCell align={align} sx={cellSx}>
      <Typography variant="body2" fontWeight="600">
        {displayLabel}
      </Typography>
    </TableCell>
  );
};

export default TableHeaderCell;
