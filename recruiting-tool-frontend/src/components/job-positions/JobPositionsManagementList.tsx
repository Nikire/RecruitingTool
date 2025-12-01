import {Box, Typography, Chip, Paper} from '@mui/material';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {useListJobPositions, useDeleteJobPosition} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import UpdateJobPositionDialog from '../dialogs/UpdateJobPositionDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {useDialog} from '../../hooks/useDialog';
import {useConfirmDelete} from '../../hooks/useConfirmDelete';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {EnhancedDataGrid, DateCell, StatusCell, ActionsCell, CellColumn, CellRow} from '../tables';

interface JobPositionsManagementListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

// Custom color mapping for job position statuses
const jobPositionStatusColors: Record<string, 'success' | 'warning' | 'error' | 'primary' | 'default'> = {
	OPEN: 'success',
	CLOSED: 'default',
	DRAFT: 'warning',
};

const JobPositionsManagementList: React.FC<JobPositionsManagementListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {t} = useTranslation();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const canManage = canManageResources(user);

	// Dialog state management using custom hooks
	const updateDialog = useDialog<JobPosition>();
	const deleteMutation = useDeleteJobPosition();
	const deleteConfirm = useConfirmDelete<JobPosition>(deleteMutation);

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data || [];
	const totalRows = data?.meta?.total || 0;

	const handleViewDetails = (jobPosition: JobPosition) => {
		navigate(`/hr/job-positions/${jobPosition.uid}`);
	};

	const columns: GridColDef[] = [
		{
			field: 'title',
			headerName: t('job_positions_table.header_job_title'),
			flex: 1,
			minWidth: 200,
		},
		{
			field: 'companyName',
			headerName: t('job_positions_table.header_company'),
			width: 150,
			renderCell: (params) => params.value || t('common.n_a'),
		},
		{
			field: 'status',
			headerName: t('job_positions_table.header_status'),
			width: 120,
			renderCell: (params) => (
				<CellRow centered>
					<StatusCell status={params.value} colorMap={jobPositionStatusColors} />
				</CellRow>
			),
		},
		{
			field: 'stages',
			headerName: t('job_positions_table.header_stages'),
			width: 100,
			valueGetter: (value: any[]) => value?.length || 0,
		},
		{
			field: 'hiringProcesses',
			headerName: t('job_positions_table.header_hiring_processes'),
			width: 140,
			renderCell: (params: GridRenderCellParams<JobPosition>) => (
				<CellRow centered>
					<Chip
						label={t('job_positions_table.processes_count', {count: params.row.hiringProcesses?.length || 0})}
						color="primary"
						variant="outlined"
						size="small"
					/>
				</CellRow>
			),
		},
		{
			field: 'createdBy',
			headerName: t('job_positions_table.header_created_by'),
			width: 180,
			renderCell: (params: GridRenderCellParams<JobPosition>) =>
				params.row.createdBy ? (
					<CellColumn gap={0.25}>
						<Typography variant="body2" noWrap>
							{params.row.createdBy.name}
						</Typography>
						<Typography variant="caption" color="text.secondary" noWrap>
							{params.row.createdBy.email}
						</Typography>
					</CellColumn>
				) : (
					t('common.n_a')
				),
		},
		{
			field: 'createdAt',
			headerName: t('careers.posted_date'),
			width: 130,
			renderCell: (params) => <DateCell value={params.value} />,
		},
		{
			field: 'actions',
			headerName: t('job_positions_table.header_actions'),
			width: 120,
			sortable: false,
			filterable: false,
			renderCell: (params: GridRenderCellParams<JobPosition>) => (
				<ActionsCell
					onView={() => handleViewDetails(params.row)}
					onEdit={canManage ? () => updateDialog.openWith(params.row) : undefined}
					onDelete={canManage ? () => deleteConfirm.confirmDelete(params.row) : undefined}
				/>
			),
		},
	];

	if (error && !data) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					{t('job_positions_table.error_loading')}
				</Typography>
			</Box>
		);
	}

	if (!isLoading && jobPositions.length === 0) {
		return (
			<Paper sx={{p: 4, textAlign: 'center'}}>
				<Typography variant="body1" color="textSecondary">
					{t('job_positions_table.no_positions')}
				</Typography>
			</Paper>
		);
	}

	return (
		<>
			<Box sx={{height: 600, width: '100%'}}>
				<EnhancedDataGrid
					rows={jobPositions}
					columns={columns}
					loading={isLoading}
					getRowId={(row) => row.uid}
					rowCount={totalRows}
					paginationMode="server"
					paginationModel={{page: page - 1, pageSize: limit}}
					onPaginationModelChange={(model) => {
						if (model.page !== page - 1) {
							onPageChange(model.page + 1);
						}
						if (model.pageSize !== limit) {
							onLimitChange(model.pageSize);
						}
					}}
					pageSizeOptions={[10, 25, 50, 100]}
					disableRowSelectionOnClick
					onboardingKey="job-positions-management"
					localeText={{
						noRowsLabel: t('job_positions_table.no_positions'),
					}}
				/>
			</Box>

			<UpdateJobPositionDialog
				open={updateDialog.isOpen}
				onClose={updateDialog.close}
				jobPosition={updateDialog.selectedItem}
			/>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onClose={deleteConfirm.handleCancel}
				onConfirm={deleteConfirm.handleConfirm}
				title={t('job_positions_table.delete_title')}
				message={t('job_positions_table.delete_message')}
				itemName={deleteConfirm.selectedItem?.title}
				isDeleting={deleteConfirm.isDeleting}
			/>
		</>
	);
};

export default JobPositionsManagementList;
