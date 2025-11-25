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
	CircularProgress,
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useCreateJobPosition} from '../../hooks/api/useJobPositions';
import {JobPositionStatus} from '../../types/jobPosition.types';
import {Stage} from '../../types/stage.types';
import StageBuilder from '../job-positions/StageBuilder';

interface CreateJobPositionDialogProps {
	open: boolean;
	onClose: () => void;
}

interface JobPositionFormData {
	title: string;
	status: JobPositionStatus;
	description?: string;
}

const CreateJobPositionDialog: React.FC<CreateJobPositionDialogProps> = ({
	open,
	onClose,
}) => {
	const {t} = useTranslation();
	const [stages, setStages] = useState<Omit<Stage, 'uid' | 'status'>[]>([]);
	const [stageError, setStageError] = useState<string>('');

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

	const {mutate: createJobPosition, isPending, isError} = useCreateJobPosition();

	const onSubmit = (data: JobPositionFormData) => {
		// Validate stages
		if (stages.length === 0) {
			setStageError(t('validation.stage_required'));
			return;
		}

		// Prepare data with stages
		const jobPositionData = {
			...data,
			stages: stages.map((stage) => ({
				title: stage.title,
				type: stage.type,
				description: stage.description,
				position: stage.position,
				estimatedTime: stage.estimatedTime,
			})),
		};

		createJobPosition(jobPositionData, {
			onSuccess: () => {
				reset();
				setStages([]);
				setStageError('');
				onClose();
			},
		});
	};

	const handleClose = () => {
		reset();
		setStages([]);
		setStageError('');
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>{t('job_positions.create_title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{mb: 3}}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							{t('job_positions.details')}
						</Typography>

						<TextField
							label={t('job_positions.job_title_label')}
							fullWidth
							margin="normal"
							{...register('title', {
								required: t('validation.title_required'),
								minLength: {
									value: 3,
									message: t('validation.min_length', {min: 3}),
								},
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
							placeholder={t('job_positions.title_placeholder')}
						/>

						<TextField
							label={t('job_positions.description_label')}
							fullWidth
							margin="normal"
							multiline
							rows={3}
							{...register('description', {
								maxLength: {
									value: 1000,
									message: t('validation.description_max_length', {max: 1000}),
								},
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
							placeholder={t('job_positions.description_placeholder')}
						/>

						<FormControl fullWidth margin="normal">
							<InputLabel>{t('job_positions.status_label')}</InputLabel>
							<Controller
								name="status"
								control={control}
								rules={{required: t('validation.status_required')}}
								render={({field}) => (
									<Select {...field} label={t('job_positions.status_label')} error={!!errors.status}>
										<MenuItem value="OPEN">{t('status.open')}</MenuItem>
										<MenuItem value="CLOSED">{t('status.closed')}</MenuItem>
										<MenuItem value="CANCELLED">{t('status.cancelled')}</MenuItem>
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

					{/* Stage Builder */}
					<Box sx={{mb: 2}}>
						<StageBuilder
							stages={stages}
							onChange={(newStages) => {
								setStages(newStages);
								if (newStages.length > 0) {
									setStageError('');
								}
							}}
							minStages={1}
							error={stageError}
						/>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('errors.create_failed', {entity: t('job_positions.title').toLowerCase()})}
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
						disabled={isPending || stages.length === 0}
						startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
					>
						{isPending ? t('common.creating') : t('common.create')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateJobPositionDialog;
