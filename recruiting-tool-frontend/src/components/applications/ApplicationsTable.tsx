import {useState} from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	IconButton,
	CircularProgress,
	Alert,
	Typography,
	Box,
	Tooltip,
} from '@mui/material';
import {Visibility as VisibilityIcon} from '@mui/icons-material';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {useApplications} from '../../hooks/api/useApplications';
import {Application, ApplicationStatus} from '../../types/application.types';
import ApplicationDetailDialog from '../dialogs/ApplicationDetailDialog';

interface ApplicationsTableProps {
	statusFilter?: ApplicationStatus;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({statusFilter}) => {
	const {t} = useTranslation();
	const {data: applications, isLoading, isError} = useApplications(
		statusFilter ? {status: statusFilter} : undefined
	);
	const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleViewClick = (application: Application) => {
		setSelectedApplication(application);
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setSelectedApplication(null);
	};

	const getStatusColor = (status: ApplicationStatus) => {
		switch (status) {
			case ApplicationStatus.PENDING:
				return 'warning';
			case ApplicationStatus.REVIEWED:
				return 'info';
			case ApplicationStatus.ACCEPTED:
				return 'success';
			case ApplicationStatus.REJECTED:
				return 'error';
			default:
				return 'default';
		}
	};

	if (isLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Alert severity="error">
				{t('applications.error_loading')}
			</Alert>
		);
	}

	if (!applications || applications.length === 0) {
		return (
			<Paper sx={{p: 4, textAlign: 'center'}}>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					{t('applications.no_applications_found')}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{statusFilter
						? t('applications.no_applications_with_status', {status: statusFilter})
						: t('applications.no_applications_submitted')}
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<Paper sx={{mb: 2}}>
				<Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
					<Typography variant="body2" color="text.secondary">
						{t('applications.total_applications', {count: applications.length})}
					</Typography>
				</Box>
			</Paper>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{t('applications.applicant_name')}</TableCell>
							<TableCell>{t('applications.email')}</TableCell>
							<TableCell>{t('applications.phone')}</TableCell>
							<TableCell>{t('applications.job_position')}</TableCell>
							<TableCell>{t('applications.status')}</TableCell>
							<TableCell>{t('applications.applied_date')}</TableCell>
							<TableCell align="center">{t('common.actions')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{applications.map((application) => (
							<TableRow
								key={application.uid}
								hover
								sx={{cursor: 'pointer'}}
								onClick={() => handleViewClick(application)}
							>
								<TableCell>{application.applicantName}</TableCell>
								<TableCell>{application.applicantEmail}</TableCell>
								<TableCell>{application.applicantPhone}</TableCell>
								<TableCell>
									<Typography variant="body2">{application.jobPositionTitle}</Typography>
									{application.companyName && (
										<Typography variant="caption" color="text.secondary">
											{application.companyName}
										</Typography>
									)}
								</TableCell>
								<TableCell>
									<Chip
										label={application.status}
										color={getStatusColor(application.status)}
										size="small"
									/>
								</TableCell>
								<TableCell>
									{format(new Date(application.appliedAt), 'MMM d, yyyy h:mm a')}
								</TableCell>
								<TableCell align="center">
									<Tooltip title={t('applications.view_details')}>
										<IconButton
											onClick={(e) => {
												e.stopPropagation();
												handleViewClick(application);
											}}
											size="small"
											color="primary"
										>
											<VisibilityIcon />
										</IconButton>
									</Tooltip>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<ApplicationDetailDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				application={selectedApplication}
			/>
		</>
	);
};

export default ApplicationsTable;
