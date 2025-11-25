import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	Box,
	CircularProgress,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useUpdateCompany} from '../../hooks/api/useCompanies';
import {Company} from '../../types/company.types';
import {useEffect} from 'react';

interface UpdateCompanyDialogProps {
	open: boolean;
	onClose: () => void;
	company: Company | null;
}

interface CompanyFormData {
	name: string;
	description?: string;
}

const UpdateCompanyDialog: React.FC<UpdateCompanyDialogProps> = ({
	open,
	onClose,
	company,
}) => {
	const {t} = useTranslation();
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<CompanyFormData>({
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const {mutate: updateCompany, isPending, isError} = useUpdateCompany();

	// Update form values when company changes
	useEffect(() => {
		if (company) {
			reset({
				name: company.name,
				description: company.description || '',
			});
		}
	}, [company, reset]);

	const onSubmit = (data: CompanyFormData) => {
		if (!company) return;

		updateCompany(
			{uid: company.uid, data},
			{
				onSuccess: () => {
					reset();
					onClose();
				},
			}
		);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t('companies.update_title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label={t('companies.name_label')}
							fullWidth
							{...register('name', {
								required: t('validation.name_required'),
								minLength: {
									value: 2,
									message: t('validation.name_min_length', {min: 2}),
								},
								maxLength: {
									value: 100,
									message: t('validation.name_max_length', {max: 100}),
								},
							})}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<TextField
							label={t('companies.description_label')}
							multiline
							rows={3}
							fullWidth
							{...register('description', {
								maxLength: {
									value: 500,
									message: t('validation.description_max_length', {max: 500}),
								},
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('errors.update_failed', {entity: t('companies.title').toLowerCase()})}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						{t('common.cancel')}
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending}
						startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
					>
						{isPending ? t('common.updating') : t('common.update')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateCompanyDialog;
