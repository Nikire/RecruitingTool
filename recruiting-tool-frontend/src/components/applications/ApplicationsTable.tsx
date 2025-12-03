import {useState} from 'react';
import {Typography, Box, Paper} from '@mui/material';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import {useApplications} from '../../hooks/api/useApplications';
import {Application, ApplicationStatus} from '../../types/application.types';
import ApplicationDetailDialog from '../dialogs/ApplicationDetailDialog';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';
import {EnhancedDataGrid, DateCell, StatusCell, ActionsCell, CellColumn, CellRow} from '../tables';

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

	// Custom color mapping for application statuses
	const applicationStatusColors: Record<string, 'success' | 'warning' | 'error' | 'primary' | 'default'> = {
		PENDING: 'warning',
		REVIEWED: 'primary',
		ACCEPTED: 'success',
		REJECTED: 'error',
	};

	const columns: GridColDef[] = [
		{
			field: 'applicantName',
			headerName: t('applications.applicant_name'),
			flex: 1,
			minWidth: 150,
		},
		{
			field: 'applicantEmail',
			headerName: t('applications.email'),
			flex: 1,
			minWidth: 180,
		},
		{
			field: 'applicantPhone',
			headerName: t('applications.phone'),
			width: 130,
			renderCell: (params) => params.value || '-',
		},
		{
			field: 'jobPositionTitle',
			headerName: t('applications.job_position'),
			flex: 1,
			minWidth: 180,
			renderCell: (params: GridRenderCellParams<Application>) => (
				<CellColumn gap={0.25}>
					<Typography variant="body2">{params.value}</Typography>
					{params.row.companyName && (
						<Typography variant="caption" color="text.secondary">
							{params.row.companyName}
						</Typography>
					)}
				</CellColumn>
			),
		},
		{
			field: 'status',
			headerName: t('applications.status'),
			width: 130,
			renderCell: (params) => (
				<CellRow centered>
					<StatusCell status={params.value} colorMap={applicationStatusColors} />
				</CellRow>
			),
		},
		{
			field: 'appliedAt',
			headerName: t('applications.applied_date'),
			width: 170,
			renderCell: (params) => <DateCell value={params.value} showTime />,
		},
		{
			field: 'actions',
			headerName: t('common.actions'),
			width: 100,
			sortable: false,
			filterable: false,
			align: 'center',
			headerAlign: 'center',
			renderCell: (params: GridRenderCellParams<Application>) => (
				<ActionsCell onView={() => handleViewClick(params.row)} />
			),
		},
	];

	if (isError) {
		return <ErrorMessage message="applications.error_loading" />;
	}

	if (!isLoading && (!applications || applications.length === 0)) {
		const emptyMessage = statusFilter
			? 'applications.no_applications_with_status'
			: 'applications.no_applications_submitted';
		return <EmptyState message={emptyMessage} />;
	}

	return (
		<>
			<Paper sx={{mb: 2}}>
				<Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
					<Typography variant="body2" color="text.secondary">
						{t('applications.total_applications', {count: applications?.length || 0})}
					</Typography>
				</Box>
			</Paper>

			<Box sx={{height: 600, width: '100%'}}>
				<EnhancedDataGrid
					rows={applications || []}
					columns={columns}
					loading={isLoading}
					getRowId={(row) => row.uid}
					pageSizeOptions={[10, 25, 50, 100]}
					initialState={{
						pagination: {paginationModel: {pageSize: 25}},
					}}
					disableRowSelectionOnClick
					onRowClick={(params) => handleViewClick(params.row)}
					onboardingKey="applications-table"
					localeText={{
						noRowsLabel: t('applications.no_applications_submitted'),
					}}
					sx={{
						'& .MuiDataGrid-row': {
							cursor: 'pointer',
						},
					}}
				/>
			</Box>

			<ApplicationDetailDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				application={selectedApplication}
			/>
		</>
	);
};

export default ApplicationsTable;
