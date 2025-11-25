import {Box, Typography} from '@mui/material';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {Application} from '../../types/application.types';
import {StatusChip} from '../common';

/**
 * Props for the ApplicationListItem component
 */
export interface ApplicationListItemProps {
	/** The application data to display */
	application: Application;
	/** Click handler when the item is clicked */
	onClick: (application: Application) => void;
}

/**
 * ApplicationListItem - Reusable application list item component
 *
 * Displays a single application in a list format with applicant details,
 * job position, status chip, and application date. Includes hover effect
 * and click interaction.
 *
 * Used in dashboard recent applications and other application lists.
 *
 * @example
 * ```tsx
 * <ApplicationListItem
 *   application={application}
 *   onClick={(app) => setSelectedApplication(app)}
 * />
 * ```
 *
 * @component
 * @category Dashboard
 */
const ApplicationListItem: React.FC<ApplicationListItemProps> = ({
	application,
	onClick,
}) => {
	const {t} = useTranslation();

	return (
		<Box
			sx={{
				py: 2,
				borderBottom: '1px solid',
				borderColor: 'divider',
				'&:last-child': {borderBottom: 'none'},
				cursor: 'pointer',
				'&:hover': {bgcolor: 'action.hover'},
				px: 2,
				borderRadius: 1,
				transition: 'background-color 0.2s ease',
			}}
			onClick={() => onClick(application)}
		>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1}}>
				<Box sx={{flex: 1}}>
					<Typography variant="subtitle1" fontWeight="medium">
						{application.applicantName}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{t('dashboard.applied_for')}: {application.jobPositionTitle}
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
						{application.applicantEmail}
					</Typography>
				</Box>
				<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, ml: 2}}>
					<StatusChip
						status={application.status}
						type="application"
						size="small"
						translate
					/>
					<Typography variant="caption" color="text.secondary">
						{application.appliedAt ? format(new Date(application.appliedAt), 'MMM dd, yyyy') : t('common.n_a')}
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default ApplicationListItem;
