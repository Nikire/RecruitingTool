import {
	Typography,
	Button,
	Box,
	Chip,
	IconButton,
	CircularProgress,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useState} from 'react';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useDialog} from '../../hooks/useDialog';
import {useEmailTemplates, useDeleteEmailTemplate} from '../../hooks/api/useEmailTemplates';
import EmailTemplateDialog from '../../components/dialogs/EmailTemplateDialog';
import EmailTemplatePreviewDialog from '../../components/dialogs/EmailTemplatePreviewDialog';
import ConfirmDeleteDialog from '../../components/dialogs/ConfirmDeleteDialog';
import {canManageResources} from '../../utils/permissions';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';
import {EmailTemplate} from '../../types/emailTemplate.types';
import {format} from 'date-fns';

const EmailTemplatesPage: React.FC = () => {
	const {t} = useTranslation();
	const {user} = useUserAtom();
	const createDialog = useDialog<never>();
	const updateDialog = useDialog<EmailTemplate>();
	const previewDialog = useDialog<string>();
	const deleteDialog = useDialog<EmailTemplate>();

	const {data: templates, isLoading} = useEmailTemplates();
	const {mutate: deleteTemplate, isPending: isDeleting} = useDeleteEmailTemplate();

	const canManage = canManageResources(user);

	const handleDelete = () => {
		if (deleteDialog.data) {
			deleteTemplate(deleteDialog.data.uid, {
				onSuccess: () => {
					deleteDialog.close();
				},
			});
		}
	};

	const columns: GridColDef[] = [
		{
			field: 'name',
			headerName: t('email_templates.table_name'),
			flex: 1,
			minWidth: 200,
		},
		{
			field: 'subject',
			headerName: t('email_templates.table_subject'),
			flex: 1,
			minWidth: 250,
		},
		{
			field: 'isDefault',
			headerName: t('email_templates.table_default'),
			width: 120,
			renderCell: (params) =>
				params.value ? (
					<Chip label={t('common.yes')} size="small" color="primary" />
				) : null,
		},
		{
			field: 'companyUid',
			headerName: t('job_positions.company'),
			width: 150,
			renderCell: (params) =>
				params.value ? (
					<Chip label={t('job_positions.company')} size="small" />
				) : (
					<Chip label={t('email_templates.system_wide')} size="small" color="secondary" />
				),
		},
		{
			field: 'createdByName',
			headerName: t('email_templates.table_created_by'),
			width: 150,
		},
		{
			field: 'createdAt',
			headerName: t('email_templates.table_created_at'),
			width: 150,
			renderCell: (params) => format(new Date(params.value), 'MMM dd, yyyy'),
		},
		{
			field: 'actions',
			headerName: t('email_templates.table_actions'),
			width: 150,
			sortable: false,
			renderCell: (params) => (
				<Box>
					<IconButton
						size="small"
						onClick={() => previewDialog.open(params.row.uid)}
						title={t('common.view')}
					>
						<VisibilityIcon fontSize="small" />
					</IconButton>
					{canManage && (
						<>
							<IconButton
								size="small"
								onClick={() => updateDialog.open(params.row)}
								title={t('common.edit')}
							>
								<EditIcon fontSize="small" />
							</IconButton>
							<IconButton
								size="small"
								onClick={() => deleteDialog.open(params.row)}
								title={t('common.delete')}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						</>
					)}
				</Box>
			),
		},
	];

	if (!canManage) {
		return <AccessDeniedMessage requiredRoles={['HR', 'ADMIN', 'SUPER_ADMIN']} />;
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: {xs: 'column', sm: 'row'},
					justifyContent: 'space-between',
					alignItems: {xs: 'flex-start', sm: 'center'},
					mb: 3,
					gap: 2,
				}}
			>
				<Box>
					<Typography variant="h4" sx={{mb: 0.5}}>
						{t('email_templates.title')}
					</Typography>
					<Typography variant="body2" color="textSecondary">
						{t('email_templates.subtitle')}
					</Typography>
				</Box>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => createDialog.open()}
						sx={{
							width: {xs: '100%', sm: 'auto'},
						}}
					>
						{t('email_templates.create_template')}
					</Button>
				)}
			</Box>

			<Box sx={{height: 600, width: '100%'}}>
				<DataGrid
					rows={templates || []}
					columns={columns}
					loading={isLoading}
					pageSizeOptions={[10, 25, 50, 100]}
					initialState={{
						pagination: {paginationModel: {pageSize: 25}},
					}}
					disableRowSelectionOnClick
					getRowId={(row) => row.uid}
					sx={{
						'& .MuiDataGrid-cell:focus': {
							outline: 'none',
						},
						'& .MuiDataGrid-cell:focus-within': {
							outline: 'none',
						},
					}}
				/>
			</Box>

			{/* Create/Update Dialog */}
			<EmailTemplateDialog
				open={createDialog.isOpen || updateDialog.isOpen}
				onClose={() => {
					createDialog.close();
					updateDialog.close();
				}}
				template={updateDialog.data}
			/>

			{/* Preview Dialog */}
			<EmailTemplatePreviewDialog
				open={previewDialog.isOpen}
				onClose={previewDialog.close}
				templateUid={previewDialog.data || null}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDeleteDialog
				open={deleteDialog.isOpen}
				onClose={deleteDialog.close}
				onConfirm={handleDelete}
				title={t('dialogs.delete_confirmation')}
				message={t('email_templates.delete_message')}
				itemName={deleteDialog.data?.name}
				isDeleting={isDeleting}
			/>
		</Box>
	);
};

export default EmailTemplatesPage;
