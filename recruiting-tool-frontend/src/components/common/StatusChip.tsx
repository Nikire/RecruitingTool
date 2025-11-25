import {Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {ApplicationStatus} from '../../types/application.types';
import {HiringProcessStatus} from '../../types/hiringProcess.types';
import {UserRoles} from '../../types/user.types';
import {
	getApplicationStatusColor,
	getHiringProcessStatusColor,
	getUserRoleColor,
} from '../../utils/statusColors';

/**
 * Supported status types for the StatusChip component
 */
export type StatusType = 'application' | 'hiringProcess' | 'userRole' | 'jobPosition';

/**
 * Props for the StatusChip component
 */
export interface StatusChipProps {
	/** The status value to display */
	status: string;
	/** The type of status (determines color mapping) */
	type: StatusType;
	/** Size of the chip */
	size?: 'small' | 'medium';
	/** Whether to translate the status text using i18n (default: false) */
	translate?: boolean;
	/** Optional i18n namespace prefix for translation (e.g., 'status.') */
	translationPrefix?: string;
	/** Optional custom variant */
	variant?: 'filled' | 'outlined';
}

/**
 * StatusChip - Reusable status chip component with type-based color logic
 *
 * Automatically applies the correct MUI color based on status type and value.
 * Supports multiple status types: applications, hiring processes, user roles, job positions.
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
	size = 'small',
	translate = false,
	translationPrefix = 'status.',
	variant = 'filled',
}) => {
	const {t} = useTranslation();

	/**
	 * Get the appropriate MUI color based on status type and value
	 */
	const getColor = (): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default' => {
		switch (type) {
			case 'application':
				return getApplicationStatusColor(status as ApplicationStatus);
			case 'hiringProcess':
				return getHiringProcessStatusColor(status as HiringProcessStatus);
			case 'userRole':
				return getUserRoleColor(status as UserRoles);
			case 'jobPosition':
				// Job position status mapping (OPEN, CLOSED, ARCHIVED)
				switch (status) {
					case 'OPEN':
						return 'success';
					case 'CLOSED':
						return 'default';
					case 'ARCHIVED':
						return 'warning';
					default:
						return 'default';
				}
			default:
				return 'default';
		}
	};

	/**
	 * Get the display label for the status
	 */
	const getLabel = () => {
		if (translate) {
			// Try with prefix first, then fallback to status key
			const translationKey = translationPrefix
				? `${translationPrefix}${status.toLowerCase()}`
				: status.toLowerCase();
			return t(translationKey);
		}
		return status;
	};

	return (
		<Chip
			label={getLabel()}
			color={getColor()}
			size={size}
			variant={variant}
		/>
	);
};

export default StatusChip;
