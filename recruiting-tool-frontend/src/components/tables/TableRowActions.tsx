import {IconButton, Tooltip, Box} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {useTranslation} from 'react-i18next';

/**
 * Custom action configuration for table rows
 */
export interface CustomAction {
	/** Icon element to display */
	icon: React.ReactNode;
	/** Click handler for the action */
	onClick: () => void;
	/** Optional tooltip text (i18n key or plain text) */
	tooltip?: string;
	/** MUI color variant for the icon button */
	color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit';
	/** Whether the action is disabled */
	disabled?: boolean;
}

/**
 * Props for the TableRowActions component
 */
export interface TableRowActionsProps {
	/** Handler for edit action */
	onEdit?: () => void;
	/** Handler for delete action */
	onDelete?: () => void;
	/** Handler for view/details action */
	onView?: () => void;
	/** Array of custom actions to display */
	customActions?: CustomAction[];
	/** Whether to translate tooltip text using i18n (default: true) */
	translate?: boolean;
	/** Size of icon buttons */
	size?: 'small' | 'medium' | 'large';
}

/**
 * TableRowActions - Reusable action buttons component for table rows
 *
 * Provides consistent edit/delete/view actions with optional custom actions.
 * Supports i18n for tooltips and customizable button sizes.
 *
 * @example
 * ```tsx
 * <TableRowActions
 *   onEdit={() => handleEdit(item)}
 *   onDelete={() => handleDelete(item)}
 *   onView={() => handleView(item)}
 * />
 * ```
 *
 * @example With custom actions
 * ```tsx
 * <TableRowActions
 *   onEdit={() => handleEdit(item)}
 *   customActions={[
 *     {
 *       icon: <DownloadIcon />,
 *       onClick: () => handleDownload(item),
 *       tooltip: 'common.download',
 *       color: 'info',
 *     }
 *   ]}
 *   translate
 * />
 * ```
 */
const TableRowActions: React.FC<TableRowActionsProps> = ({
	onEdit,
	onDelete,
	onView,
	customActions = [],
	translate = true,
	size = 'small',
}) => {
	const {t} = useTranslation();

	// Helper to get tooltip text
	const getTooltip = (key: string) => (translate ? t(key) : key);

	return (
		<Box sx={{display: 'flex', gap: 0.5, justifyContent: 'flex-end'}}>
			{/* View action */}
			{onView && (
				<Tooltip title={getTooltip('common.view')}>
					<IconButton
						size={size}
						color="info"
						onClick={onView}
						aria-label={getTooltip('common.view')}
					>
						<VisibilityIcon fontSize={size} />
					</IconButton>
				</Tooltip>
			)}

			{/* Edit action */}
			{onEdit && (
				<Tooltip title={getTooltip('common.edit')}>
					<IconButton
						size={size}
						color="primary"
						onClick={onEdit}
						aria-label={getTooltip('common.edit')}
					>
						<EditIcon fontSize={size} />
					</IconButton>
				</Tooltip>
			)}

			{/* Delete action */}
			{onDelete && (
				<Tooltip title={getTooltip('common.delete')}>
					<IconButton
						size={size}
						color="error"
						onClick={onDelete}
						aria-label={getTooltip('common.delete')}
					>
						<DeleteIcon fontSize={size} />
					</IconButton>
				</Tooltip>
			)}

			{/* Custom actions */}
			{customActions.map((action, index) => {
				const tooltipText = action.tooltip ? getTooltip(action.tooltip) : '';
				const button = (
					<IconButton
						key={index}
						size={size}
						color={action.color || 'default'}
						onClick={action.onClick}
						disabled={action.disabled}
						aria-label={tooltipText || `${t('aria.actions')} ${index + 1}`}
					>
						{action.icon}
					</IconButton>
				);

				return tooltipText ? (
					<Tooltip key={index} title={tooltipText}>
						{button}
					</Tooltip>
				) : (
					button
				);
			})}
		</Box>
	);
};

export default TableRowActions;
