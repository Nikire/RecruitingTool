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
import {useCreateCandidate} from '../../hooks/api/useCandidates';

interface CreateCandidateDialogProps {
	open: boolean;
	onClose: () => void;
}

interface CandidateFormData {
	name: string;
	email: string;
}

const CreateCandidateDialog: React.FC<CreateCandidateDialogProps> = ({
	open,
	onClose,
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

	const {mutate: createCandidate, isPending, isError} = useCreateCandidate();

	const onSubmit = (data: CandidateFormData) => {
		createCandidate(data, {
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
			<DialogTitle>Create New Candidate</DialogTitle>
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
							Failed to create candidate. Please try again.
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

export default CreateCandidateDialog;
