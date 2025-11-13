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
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
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
	{value: 'OPEN', label: 'Open'},
	{value: 'IN_PROGRESS', label: 'In Progress'},
	{value: 'CLOSED', label: 'Closed'},
	{value: 'CANCELLED', label: 'Cancelled'},
	{value: 'REJECTED', label: 'Rejected'},
];

const UpdateHiringProcessDialog: React.FC<UpdateHiringProcessDialogProps> = ({
	open,
	onClose,
	hiringProcess,
}) => {
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
			<DialogTitle>Update Hiring Process</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label="Title"
							fullWidth
							{...register('title', {
								required: 'Title is required',
								minLength: {
									value: 3,
									message: 'Title must be at least 3 characters',
								},
								maxLength: {
									value: 200,
									message: 'Title must be less than 200 characters',
								},
							})}
							error={!!errors.title}
							helperText={errors.title?.message}
						/>

						<FormControl fullWidth error={!!errors.status}>
							<InputLabel>Status</InputLabel>
							<Controller
								name="status"
								control={control}
								rules={{required: 'Status is required'}}
								render={({field}) => (
									<Select {...field} label="Status">
										{hiringProcessStatuses.map((status) => (
											<MenuItem key={status.value} value={status.value}>
												{status.label}
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
							Note: Candidate and Job Position cannot be changed after creation.
						</Typography>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to update hiring process. Please try again.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={isPending}>
						{isPending ? 'Updating...' : 'Update'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateHiringProcessDialog;
