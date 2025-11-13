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
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
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
}

const UpdateJobPositionDialog: React.FC<UpdateJobPositionDialogProps> = ({
	open,
	onClose,
	jobPosition,
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

	const {mutate: updateJobPosition, isPending, isError} = useUpdateJobPosition();

	// Update form values when job position changes
	useEffect(() => {
		if (jobPosition) {
			reset({
				title: jobPosition.title,
				status: jobPosition.status,
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
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Update Job Position</DialogTitle>
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
							Failed to update job position. Please try again.
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
						{isPending ? 'Updating...' : 'Update'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateJobPositionDialog;
