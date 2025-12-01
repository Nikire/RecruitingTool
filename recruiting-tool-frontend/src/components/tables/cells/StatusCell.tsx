import {Chip, ChipProps} from '@mui/material';
import {useTranslation} from 'react-i18next';

type StatusType =
	| 'OPEN'
	| 'CLOSED'
	| 'CANCELLED'
	| 'IN_PROGRESS'
	| 'PENDING'
	| 'APPROVED'
	| 'REJECTED'
	| 'COMPLETED'
	| 'ACTIVE'
	| 'INACTIVE'
	| 'HIRED'
	| 'DRAFT'
	| string;

interface StatusCellProps {
	/**
	 * The status value to display
	 */
	status: StatusType | null | undefined;
	/**
	 * Size of the chip
	 * @default 'small'
	 */
	size?: ChipProps['size'];
	/**
	 * i18n namespace for status translations
	 * Uses `{namespace}.{status.toLowerCase()}` pattern
	 * @default 'status'
	 */
	translationNamespace?: string;
	/**
	 * Custom color mapping override
	 */
	colorMap?: Record<string, ChipProps['color']>;
}

const DEFAULT_COLOR_MAP: Record<string, ChipProps['color']> = {
	// Positive states
	OPEN: 'success',
	ACTIVE: 'success',
	APPROVED: 'success',
	COMPLETED: 'success',
	HIRED: 'success',

	// In-progress states
	IN_PROGRESS: 'primary',
	PENDING: 'warning',
	DRAFT: 'default',

	// Closed/Neutral states
	CLOSED: 'default',
	INACTIVE: 'default',

	// Negative states
	CANCELLED: 'error',
	REJECTED: 'error',
};

/**
 * StatusCell - Consistent status chip formatting for DataGrid cells
 *
 * @example
 * ```tsx
 * // In column definition
 * {
 *   field: 'status',
 *   headerName: 'Status',
 *   renderCell: (params) => <StatusCell status={params.value} />
 * }
 *
 * // With custom translation namespace
 * <StatusCell status="OPEN" translationNamespace="job_position_status" />
 * ```
 */
const StatusCell: React.FC<StatusCellProps> = ({
	status,
	size = 'small',
	translationNamespace = 'status',
	colorMap,
}) => {
	const {t} = useTranslation();

	if (!status) {
		return null;
	}

	const normalizedStatus = status.toUpperCase();
	const mergedColorMap = {...DEFAULT_COLOR_MAP, ...colorMap};
	const chipColor = mergedColorMap[normalizedStatus] || 'default';

	// Try to get translation, fallback to formatted status
	const translationKey = `${translationNamespace}.${status.toLowerCase()}`;
	const translatedLabel = t(translationKey, {defaultValue: ''});
	const label = translatedLabel || status.replace(/_/g, ' ');

	return (
		<Chip
			label={label}
			color={chipColor}
			size={size}
			sx={{
				fontWeight: 500,
				textTransform: 'capitalize',
				// Ensure chip is vertically centered in the cell
				display: 'inline-flex',
				alignItems: 'center',
			}}
		/>
	);
};

export default StatusCell;
