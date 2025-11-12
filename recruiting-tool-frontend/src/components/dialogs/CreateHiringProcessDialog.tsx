import {useState} from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	CircularProgress,
	Box,
	TextField,
	ToggleButtonGroup,
	ToggleButton,
	Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import {useForm, Controller} from 'react-hook-form';
import {useCreateHiringProcess} from '../../hooks/api/useHiringProcess';
import {useCandidates, useCreateCandidate} from '../../hooks/api/useCandidates';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';

interface CreateHiringProcessDialogProps {
	open: boolean;
	onClose: () => void;
}

type CandidateMode = 'existing' | 'new';

interface HiringProcessFormData {
	candidateUid: string;
	jobPositionUid: string;
	// New candidate fields
	candidateName: string;
	candidateEmail: string;
}

const CreateHiringProcessDialog: React.FC<CreateHiringProcessDialogProps> = ({
	open,
	onClose,
}) => {
	const [candidateMode, setCandidateMode] = useState<CandidateMode>('existing');

	const {
		control,
		handleSubmit,
		reset,
		register,
		formState: {errors},
	} = useForm<HiringProcessFormData>({
		defaultValues: {
			candidateUid: '',
			jobPositionUid: '',
			candidateName: '',
			candidateEmail: '',
		},
	});

	const {mutate: createHiringProcess, isPending, isError} = useCreateHiringProcess();
	const {mutate: createCandidate, isPending: isCreatingCandidate} = useCreateCandidate();
	const {data: candidates, isLoading: loadingCandidates} = useCandidates();
	const {data: jobPositionsData, isLoading: loadingJobPositions} = useJobPositions();

	const jobPositions = jobPositionsData as JobPosition[] | undefined;

	const onSubmit = (data: HiringProcessFormData) => {
		if (candidateMode === 'new') {
			// First create the candidate, then create the hiring process
			createCandidate(
				{
					name: data.candidateName,
					email: data.candidateEmail,
				},
				{
					onSuccess: (newCandidate) => {
						// Now create the hiring process with the new candidate
						createHiringProcess(
							{
								candidateUid: newCandidate.uid,
								jobPositionUid: data.jobPositionUid,
							},
							{
								onSuccess: () => {
									reset();
									setCandidateMode('existing');
									onClose();
								},
							}
						);
					},
				}
			);
		} else {
			// Use existing candidate
			createHiringProcess(
				{
					candidateUid: data.candidateUid,
					jobPositionUid: data.jobPositionUid,
				},
				{
					onSuccess: () => {
						reset();
						onClose();
					},
				}
			);
		}
	};

	const handleClose = () => {
		reset();
		setCandidateMode('existing');
		onClose();
	};

	const isLoading = loadingCandidates || loadingJobPositions;
	const isSubmitting = isPending || isCreatingCandidate;

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Create New Hiring Process</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					{isLoading ? (
						<Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
							<CircularProgress />
						</Box>
					) : (
						<>
							<FormControl fullWidth margin="normal">
								<InputLabel>Job Position</InputLabel>
								<Controller
									name="jobPositionUid"
									control={control}
									rules={{required: 'Job position is required'}}
									render={({field}) => (
										<Select
											{...field}
											label="Job Position"
											error={!!errors.jobPositionUid}
										>
											{jobPositions && jobPositions.length > 0 ? (
												jobPositions.map((jp) => (
													<MenuItem key={jp.uid} value={jp.uid}>
														{jp.title} ({jp.status})
													</MenuItem>
												))
											) : (
												<MenuItem disabled>No job positions available</MenuItem>
											)}
										</Select>
									)}
								/>
								{errors.jobPositionUid && (
									<Typography color="error" variant="caption">
										{errors.jobPositionUid.message}
									</Typography>
								)}
							</FormControl>

							<Divider sx={{my: 3}} />

							<Box sx={{mb: 2}}>
								<Typography variant="subtitle2" gutterBottom>
									Candidate Selection
								</Typography>
								<ToggleButtonGroup
									value={candidateMode}
									exclusive
									onChange={(_, value) => value && setCandidateMode(value)}
									fullWidth
									size="small"
								>
									<ToggleButton value="existing">
										<PersonIcon sx={{mr: 1}} />
										Select Existing
									</ToggleButton>
									<ToggleButton value="new">
										<AddIcon sx={{mr: 1}} />
										Create New
									</ToggleButton>
								</ToggleButtonGroup>
							</Box>

							{candidateMode === 'existing' ? (
								<FormControl fullWidth margin="normal">
									<InputLabel>Candidate</InputLabel>
									<Controller
										name="candidateUid"
										control={control}
										rules={{
											required: candidateMode === 'existing' ? 'Candidate is required' : false,
										}}
										render={({field}) => (
											<Select
												{...field}
												label="Candidate"
												error={!!errors.candidateUid}
											>
												{candidates && candidates.length > 0 ? (
													candidates.map((candidate) => (
														<MenuItem key={candidate.uid} value={candidate.uid}>
															{candidate.name} ({candidate.email})
														</MenuItem>
													))
												) : (
													<MenuItem disabled>No candidates available</MenuItem>
												)}
											</Select>
										)}
									/>
									{errors.candidateUid && (
										<Typography color="error" variant="caption">
											{errors.candidateUid.message}
										</Typography>
									)}
								</FormControl>
							) : (
								<Box>
									<TextField
										label="Candidate Name"
										fullWidth
										margin="normal"
										{...register('candidateName', {
											required: candidateMode === 'new' ? 'Name is required' : false,
											minLength: {
												value: 3,
												message: 'Name must be at least 3 characters',
											},
										})}
										error={!!errors.candidateName}
										helperText={errors.candidateName?.message}
									/>
									<TextField
										label="Candidate Email"
										type="email"
										fullWidth
										margin="normal"
										{...register('candidateEmail', {
											required: candidateMode === 'new' ? 'Email is required' : false,
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: 'Invalid email address',
											},
										})}
										error={!!errors.candidateEmail}
										helperText={errors.candidateEmail?.message}
									/>
								</Box>
							)}

							<Typography variant="caption" color="textSecondary" sx={{mt: 2, display: 'block'}}>
								The hiring process title will be automatically generated as:
								"[Job Position] - [Candidate Name]"
							</Typography>
						</>
					)}

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to create hiring process. Please try again.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting || isLoading}
					>
						{isSubmitting ? 'Creating...' : 'Create'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateHiringProcessDialog;
