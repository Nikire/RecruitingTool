import { IconButton, Tooltip } from "@mui/material";
import { CellRow } from "../CellLayouts";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";

interface ActionsCellProps {
  /**
   * Callback when view button is clicked
   */
  onView?: () => void;
  /**
   * Callback when edit button is clicked
   */
  onEdit?: () => void;
  /**
   * Callback when delete button is clicked
   */
  onDelete?: () => void;
  /**
   * Custom actions to render
   */
  customActions?: React.ReactNode;
  /**
   * Whether to show the view button
   * @default true if onView is provided
   */
  showView?: boolean;
  /**
   * Whether to show the edit button
   * @default true if onEdit is provided
   */
  showEdit?: boolean;
  /**
   * Whether to show the delete button
   * @default true if onDelete is provided
   */
  showDelete?: boolean;
  /**
   * Button size
   * @default 'small'
   */
  size?: "small" | "medium";
}

/**
 * ActionsCell - Consistent action buttons for DataGrid cells
 *
 * @example
 * ```tsx
 * // In column definition
 * {
 *   field: 'actions',
 *   headerName: 'Actions',
 *   sortable: false,
 *   renderCell: (params) => (
 *     <ActionsCell
 *       onView={() => handleView(params.row)}
 *       onEdit={() => handleEdit(params.row)}
 *       onDelete={() => handleDelete(params.row)}
 *     />
 *   )
 * }
 *
 * // With only edit and delete
 * <ActionsCell
 *   onEdit={() => handleEdit(row)}
 *   onDelete={() => handleDelete(row)}
 * />
 *
 * // With custom actions
 * <ActionsCell
 *   onEdit={() => handleEdit(row)}
 *   customActions={<CustomButton />}
 * />
 * ```
 */
const ActionsCell: React.FC<ActionsCellProps> = ({
  onView,
  onEdit,
  onDelete,
  customActions,
  showView = !!onView,
  showEdit = !!onEdit,
  showDelete = !!onDelete,
  size = "small",
}) => {
  const { t } = useTranslation();

  return (
    <CellRow gap={0.5}>
      {showView && onView && (
        <Tooltip title={t("common.view")}>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            color="primary"
            aria-label={t("common.view")}
          >
            <VisibilityIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showEdit && onEdit && (
        <Tooltip title={t("common.edit")}>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            color="primary"
            aria-label={t("common.edit")}
          >
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {showDelete && onDelete && (
        <Tooltip title={t("common.delete")}>
          <IconButton
            size={size}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            color="error"
            aria-label={t("common.delete")}
          >
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}

      {customActions}
    </CellRow>
  );
};

export default ActionsCell;
