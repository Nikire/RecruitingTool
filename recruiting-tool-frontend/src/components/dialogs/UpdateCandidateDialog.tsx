import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useUpdateCandidate} from '../../hooks/api/useCandidates';
import {Candidate} from '../../types/candidate';
import {useEffect} from 'react';

interface UpdateCandidateDialogProps {
	open: boolean;
	onClose: () => void;
	candidate: Candidate | null;
}

interface CandidateFormData {
	name: string;
	email: string;
}

const UpdateCandidateDialog: React.FC<UpdateCandidateDialogProps> = ({
	open,
	onClose,
	candidate,
}) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<CandidateFormData>({
		defaultValues: {
			name: '',
			email: '',
		},
	});

	const {mutate: updateCandidate, isPending, isError} = useUpdateCandidate();

	// Update form values when candidate changes
	useEffect(() => {
		if (candidate) {
			reset({
				name: candidate.name,
				email: candidate.email,
			});
		}
	}, [candidate, reset]);

	const onSubmit = (data: CandidateFormData) => {
		if (!candidate) return;

		updateCandidate(
			{uid: candidate.uid, data},
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
			<DialogTitle>Update Candidate</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<TextField
						label="Candidate Name"
						fullWidth
						margin="normal"
						{...register('name', {
							required: 'Name is required',
							minLength: {
								value: 3,
								message: 'Name must be at least 3 characters',
							},
							maxLength: {
								value: 100,
								message: 'Name must be less than 100 characters',
							},
						})}
						error={!!errors.name}
						helperText={errors.name?.message}
					/>

					<TextField
						label="Email"
						type="email"
						fullWidth
						margin="normal"
						{...register('email', {
							required: 'Email is required',
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: 'Invalid email address',
							},
						})}
						error={!!errors.email}
						helperText={errors.email?.message}
					/>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to update candidate. Please try again.
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

export default UpdateCandidateDialog;
