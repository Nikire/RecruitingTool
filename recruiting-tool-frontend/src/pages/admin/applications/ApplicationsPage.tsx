import {useState} from 'react';
import {
	Typography,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Paper,
	CircularProgress,
} from '@mui/material';
import {useAuthMe} from '../../../hooks/api/useAuth';
import {canManageResources} from '../../../utils/permissions';
import {ApplicationStatus} from '../../../types/application.types';
import ApplicationsTable from '../../../components/applications/ApplicationsTable';
import AccessDeniedMessage from '../../../components/common/AccessDeniedMessage';
import {useTranslation} from 'react-i18next';

const ApplicationsPage: React.FC = () => {
	const {t} = useTranslation();
	const {user, isLoading: userLoading} = useAuthMe();
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');

	// Wait for user data to load before checking permissions (fixes race condition)
	if (userLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>
				<CircularProgress />
			</Box>
		);
	}

	const canManage = canManageResources(user);

	// Check if user has HR or admin access
	if (!canManage) {
		return <AccessDeniedMessage requiredRoles={['HR', 'ADMIN', 'SUPER_ADMIN']} />;
	}

	const ApplicationStatusOptions: {
		value: ApplicationStatus | '';
		label: string;
	}[] = [
		{value: '', label: t('applications_page.all_applications')},
		{value: ApplicationStatus.PENDING, label: t('status.pending')},
		{value: ApplicationStatus.REVIEWED, label: t('status.reviewed')},
		{value: ApplicationStatus.ACCEPTED, label: t('status.accepted')},
		{value: ApplicationStatus.REJECTED, label: t('status.rejected')},
	];

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant="h4">{t('applications_page.title')}</Typography>
			</Box>

			<Paper sx={{p: 2, mb: 3}}>
				<Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
					<FormControl sx={{minWidth: 200}}>
						<InputLabel id="status-filter-label">
							{t('applications_page.filter_by_status')}
						</InputLabel>
						<Select
							labelId="status-filter-label"
							id="status-filter"
							value={statusFilter}
							label={t('applications_page.filter_by_status')}
							onChange={(e) =>
								setStatusFilter(e.target.value as ApplicationStatus | '')
							}
						>
							{ApplicationStatusOptions.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
			</Paper>

			<ApplicationsTable statusFilter={statusFilter || undefined} />
		</Box>
	);
};

export default ApplicationsPage;
