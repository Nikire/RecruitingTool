import {Typography, Button, Box, Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {GridColDef} from '@mui/x-data-grid';
import {EnhancedDataGrid, CellRow, ActionsCell, DateCell} from '../../components/tables';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useDialog} from '../../hooks/useDialog';
import {useEmailTemplates, useDeleteEmailTemplate} from '../../hooks/api/useEmailTemplates';
import EmailTemplateDialog from '../../components/dialogs/EmailTemplateDialog';
import EmailTemplatePreviewDialog from '../../components/dialogs/EmailTemplatePreviewDialog';
import ConfirmDeleteDialog from '../../components/dialogs/ConfirmDeleteDialog';
import {canManageResources} from '../../utils/permissions';
import AccessDeniedMessage from '../../components/common/AccessDeniedMessage';
import {EmailTemplate} from '../../types/emailTemplate.types';

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
					<CellRow centered>
						<Chip label={t('common.yes')} size="small" color="primary" />
					</CellRow>
				) : null,
		},
		{
			field: 'companyUid',
			headerName: t('job_positions.company'),
			width: 150,
			renderCell: (params) => (
				<CellRow centered>
					{params.value ? (
						<Chip label={t('job_positions.company')} size="small" />
					) : (
						<Chip label={t('email_templates.system_wide')} size="small" color="secondary" />
					)}
				</CellRow>
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
			renderCell: (params) => <DateCell value={params.value} />,
		},
		{
			field: 'actions',
			headerName: t('email_templates.table_actions'),
			width: 150,
			sortable: false,
			filterable: false,
			renderCell: (params) => (
				<ActionsCell
					onView={() => previewDialog.open(params.row.uid)}
					onEdit={canManage ? () => updateDialog.open(params.row) : undefined}
					onDelete={canManage ? () => deleteDialog.open(params.row) : undefined}
				/>
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
				<EnhancedDataGrid
					rows={templates || []}
					columns={columns}
					loading={isLoading}
					pageSizeOptions={[10, 25, 50, 100]}
					initialState={{
						pagination: {paginationModel: {pageSize: 25}},
					}}
					disableRowSelectionOnClick
					getRowId={(row) => row.uid}
					onboardingKey="email-templates"
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
