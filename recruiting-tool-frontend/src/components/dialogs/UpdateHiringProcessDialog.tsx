import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Box,
	CircularProgress,
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useUpdateHiringProcess} from '../../hooks/api/useHiringProcess';
import {HiringProcess} from '../../types/hiringProcess.types';
import {useEffect} from 'react';

interface UpdateHiringProcessDialogProps {
	open: boolean;
	onClose: () => void;
	hiringProcess: HiringProcess | null;
}

interface HiringProcessFormData {
	title: string;
	status: string;
}

const hiringProcessStatuses = [
	{value: 'OPEN', labelKey: 'update_hiring_process.status_open'},
	{value: 'IN_PROGRESS', labelKey: 'update_hiring_process.status_in_progress'},
	{value: 'CLOSED', labelKey: 'update_hiring_process.status_closed'},
	{value: 'CANCELLED', labelKey: 'update_hiring_process.status_cancelled'},
	{value: 'REJECTED', labelKey: 'update_hiring_process.status_rejected'},
];

const UpdateHiringProcessDialog: React.FC<UpdateHiringProcessDialogProps> = ({
	open,
	onClose,
	hiringProcess,
}) => {
	const {t} = useTranslation();
	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: {errors},
	} = useForm<HiringProcessFormData>({
		defaultValues: {
			title: '',
			status: 'OPEN',
		},
	});

	const {mutate: updateHiringProcess, isPending, isError} = useUpdateHiringProcess();

	// Update form values when hiring process changes
	useEffect(() => {
		if (hiringProcess) {
			reset({
				title: hiringProcess.title,
				status: hiringProcess.status,
			});
		}
	}, [hiringProcess, reset]);

	const onSubmit = (data: HiringProcessFormData) => {
		if (!hiringProcess) return;

		updateHiringProcess(
			{uid: hiringProcess.uid, data},
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
			<DialogTitle>{t('update_hiring_process.title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label={t('update_hiring_process.title_label')}
							fullWidth
							{...register('title', {
								required: t('validation.title_required'),
								minLength: {
									value: 3,
									message: t('update_hiring_process.title_min_length', {min: 3}),
								},
								maxLength: {
									value: 200,
									message: t('update_hiring_process.title_max_length', {max: 200}),
								},
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
						/>

						<FormControl fullWidth error={!!errors.status}>
							<InputLabel>{t('update_hiring_process.status_label')}</InputLabel>
							<Controller
								name="status"
								control={control}
								rules={{required: t('validation.status_required')}}
								render={({field}) => (
									<Select {...field} label={t('update_hiring_process.status_label')}>
										{hiringProcessStatuses.map((status) => (
											<MenuItem key={status.value} value={status.value}>
												{t(status.labelKey)}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							{errors.status && (
								<Typography color="error" variant="caption">
									{errors.status.message}
								</Typography>
							)}
						</FormControl>

						<Typography variant="caption" color="textSecondary">
							{t('update_hiring_process.note')}
						</Typography>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('update_hiring_process.failed_to_update')}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						{t('common.cancel')}
					</Button>
					<Button type="submit" variant="contained" disabled={isPending}>
						{isPending ? <CircularProgress size={20} /> : t('common.update')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateHiringProcessDialog;
