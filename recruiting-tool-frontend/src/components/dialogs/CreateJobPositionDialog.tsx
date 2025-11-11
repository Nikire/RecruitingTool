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
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useCreateJobPosition} from '../../hooks/api/useJobPositions';
import {JobPositionStatus} from '../../types/jobPosition.types';

interface CreateJobPositionDialogProps {
	open: boolean;
	onClose: () => void;
}

interface JobPositionFormData {
	title: string;
	status: JobPositionStatus;
}

const CreateJobPositionDialog: React.FC<CreateJobPositionDialogProps> = ({
	open,
	onClose,
}) => {
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
		},
	});

	const {mutate: createJobPosition, isPending, isError} = useCreateJobPosition();

	const onSubmit = (data: JobPositionFormData) => {
		createJobPosition(data, {
			onSuccess: () => {
				reset();
				onClose();
			},
		});
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Create New Job Position</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
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
						disabled={isPending}
					>
						{isPending ? 'Creating...' : 'Create'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateJobPositionDialog;
