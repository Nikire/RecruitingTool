import {useEffect} from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Box,
	Divider,
	Alert,
	CircularProgress,
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useUpdateJobPosition} from '../../hooks/api/useJobPositions';
import {JobPosition, JobPositionStatus} from '../../types/jobPosition.types';

interface UpdateJobPositionDialogProps {
	open: boolean;
	onClose: () => void;
	jobPosition: JobPosition | null;
}

interface JobPositionFormData {
	title: string;
	status: JobPositionStatus;
	description?: string;
}

const UpdateJobPositionDialog: React.FC<UpdateJobPositionDialogProps> = ({
	open,
	onClose,
	jobPosition,
}) => {
	const {t} = useTranslation();
	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: {errors},
	} = useForm<JobPositionFormData>({
		defaultValues: {
			title: '',
			status: 'OPEN',
			description: '',
		},
	});

	const {mutate: updateJobPosition, isPending, isError} = useUpdateJobPosition();

	// Update form values when job position changes
	useEffect(() => {
		if (jobPosition) {
			reset({
				title: jobPosition.title,
				status: jobPosition.status,
				description: jobPosition.description || '',
			});
		}
	}, [jobPosition, reset]);

	const onSubmit = (data: JobPositionFormData) => {
		if (!jobPosition) return;

		updateJobPosition(
			{uid: jobPosition.uid, data},
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
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>{t('update_job_position.title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{mb: 3}}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							{t('update_job_position.details')}
						</Typography>

						<TextField
							label={t('update_job_position.job_title')}
							fullWidth
							margin="normal"
							{...register('title', {
								required: t('update_job_position.job_title_required'),
								minLength: {
									value: 3,
									message: t('update_job_position.job_title_min_length', {min: 3}),
								},
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
							placeholder={t('update_job_position.job_title_placeholder')}
						/>

						<TextField
							label={t('update_job_position.description')}
							fullWidth
							margin="normal"
							multiline
							rows={3}
							{...register('description', {
								maxLength: {
									value: 1000,
									message: t('update_job_position.description_max_length', {max: 1000}),
								},
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
							placeholder={t('update_job_position.description_placeholder')}
						/>

						<FormControl fullWidth margin="normal">
							<InputLabel>{t('update_job_position.status')}</InputLabel>
							<Controller
								name="status"
								control={control}
								rules={{required: t('update_job_position.status_required')}}
								render={({field}) => (
									<Select {...field} label={t('update_job_position.status')} error={!!errors.status}>
										<MenuItem value="OPEN">{t('update_job_position.status_open')}</MenuItem>
										<MenuItem value="CLOSED">{t('update_job_position.status_closed')}</MenuItem>
										<MenuItem value="CANCELLED">{t('update_job_position.status_cancelled')}</MenuItem>
									</Select>
								)}
							/>
							{errors.status && (
								<Typography color="error" variant="caption">
									{errors.status.message}
								</Typography>
							)}
						</FormControl>
					</Box>

					<Divider sx={{my: 3}} />

					{/* Stage Management Info */}
					<Box sx={{mb: 2}}>
						<Alert severity="info">
							{t('update_job_position.stages_info', {count: jobPosition?.stages?.length || 0})}
							{' '}
							{t('update_job_position.stages_manage_help')}
						</Alert>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('update_job_position.failed_to_update')}
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
					>
						{isPending ? <CircularProgress size={20} /> : t('update_job_position.update_button')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateJobPositionDialog;
