import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	Box,
	Tabs,
	Tab,
	Divider,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useUpdateCandidate} from '../../hooks/api/useCandidates';
import {Candidate} from '../../types/candidate';
import {useEffect, useState} from 'react';
import FileUpload from '../files/FileUpload';
import FileList from '../files/FileList';
import CandidateNotes from '../candidate/CandidateNotes';

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
	const [activeTab, setActiveTab] = useState(0);

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
		setActiveTab(0);
		onClose();
	};

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>Update Candidate</DialogTitle>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={activeTab} onChange={handleTabChange}>
					<Tab label="Candidate Info" />
					<Tab label="Files" />
					<Tab label="Notes" />
				</Tabs>
			</Box>

			{activeTab === 0 && (
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
			)}

			{activeTab === 1 && (
				<>
					<DialogContent>
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" gutterBottom>
								Upload Files
							</Typography>
							<FileUpload candidateUid={candidate?.uid} />
						</Box>

						<Divider sx={{ my: 3 }} />

						<Box>
							<Typography variant="h6" gutterBottom>
								Uploaded Files
							</Typography>
							<FileList candidateUid={candidate?.uid} />
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>
							Close
						</Button>
					</DialogActions>
				</>
			)}

			{activeTab === 2 && (
				<>
					<DialogContent>
						<CandidateNotes candidateUid={candidate?.uid} />
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>
							Close
						</Button>
					</DialogActions>
				</>
			)}
		</Dialog>
	);
};

export default UpdateCandidateDialog;
