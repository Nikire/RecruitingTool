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
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useState} from 'react';
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
			setStageError('At least one hiring stage is required');
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
			<DialogTitle>Create New Job Position</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{mb: 3}}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							Job Position Details
						</Typography>

						<TextField
							label="Job Title"
							fullWidth
							margin="normal"
							{...register('title', {
								required: 'Job title is required',
								minLength: {
									value: 3,
									message: 'Job title must be at least 3 characters',
								},
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
							placeholder="e.g., Senior Software Engineer"
						/>

						<TextField
							label="Description"
							fullWidth
							margin="normal"
							multiline
							rows={3}
							{...register('description', {
								maxLength: {
									value: 1000,
									message: 'Description must be less than 1000 characters',
								},
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
							placeholder="Describe the job position..."
						/>

						<FormControl fullWidth margin="normal">
							<InputLabel>Status</InputLabel>
							<Controller
								name="status"
								control={control}
								rules={{required: 'Status is required'}}
								render={({field}) => (
									<Select {...field} label="Status" error={!!errors.status}>
										<MenuItem value="OPEN">Open</MenuItem>
										<MenuItem value="CLOSED">Closed</MenuItem>
										<MenuItem value="CANCELLED">Cancelled</MenuItem>
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
							Failed to create job position. Please try again.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending || stages.length === 0}
					>
						{isPending ? 'Creating...' : 'Create Job Position'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateJobPositionDialog;
