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
import {useTranslation} from 'react-i18next';
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

	const {t} = useTranslation();

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t('hiring_processes.create_title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					{isLoading ? (
						<Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
							<CircularProgress />
						</Box>
					) : (
						<>
							<FormControl fullWidth margin="normal">
								<InputLabel>{t('job_positions.title')}</InputLabel>
								<Controller
									name="jobPositionUid"
									control={control}
									rules={{required: t('validation.job_position_required')}}
									render={({field}) => (
										<Select
											{...field}
											label={t('job_positions.title')}
											error={!!errors.jobPositionUid}
										>
											{jobPositions && jobPositions.length > 0 ? (
												jobPositions.map((jp) => (
													<MenuItem key={jp.uid} value={jp.uid}>
														{jp.title} ({t(`status.${jp.status.toLowerCase()}`)})
													</MenuItem>
												))
											) : (
												<MenuItem disabled>{t('job_positions.no_positions')}</MenuItem>
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
									{t('hiring_processes.candidate_selection')}
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
										{t('hiring_processes.select_existing')}
									</ToggleButton>
									<ToggleButton value="new">
										<AddIcon sx={{mr: 1}} />
										{t('hiring_processes.create_new')}
									</ToggleButton>
								</ToggleButtonGroup>
							</Box>

							{candidateMode === 'existing' ? (
								<FormControl fullWidth margin="normal">
									<InputLabel>{t('candidates.title')}</InputLabel>
									<Controller
										name="candidateUid"
										control={control}
										rules={{
											required: candidateMode === 'existing' ? t('validation.candidate_required') : false,
										}}
										render={({field}) => (
											<Select
												{...field}
												label={t('candidates.title')}
												error={!!errors.candidateUid}
											>
												{candidates && candidates.length > 0 ? (
													candidates.map((candidate) => (
														<MenuItem key={candidate.uid} value={candidate.uid}>
															{candidate.name} ({candidate.email})
														</MenuItem>
													))
												) : (
													<MenuItem disabled>{t('candidates.no_candidates')}</MenuItem>
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
										label={t('candidates.name_label')}
										fullWidth
										margin="normal"
										{...register('candidateName', {
											required: candidateMode === 'new' ? t('validation.name_required') : false,
											minLength: {
												value: 3,
												message: t('validation.name_min_length', {min: 3}),
											},
										})}
										error={!!errors.candidateName}
										helperText={errors.candidateName?.message}
									/>
									<TextField
										label={t('candidates.email_label')}
										type="email"
										fullWidth
										margin="normal"
										{...register('candidateEmail', {
											required: candidateMode === 'new' ? t('validation.email_required') : false,
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: t('validation.email_invalid'),
											},
										})}
										error={!!errors.candidateEmail}
										helperText={errors.candidateEmail?.message}
									/>
								</Box>
							)}

							<Typography variant="caption" color="textSecondary" sx={{mt: 2, display: 'block'}}>
								{t('hiring_processes.title_auto_generated')}
								<br />
								{t('hiring_processes.title_format')}
							</Typography>
						</>
					)}

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('errors.create_failed', {entity: t('hiring_processes.title').toLowerCase()})}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isSubmitting}>
						{t('common.cancel')}
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting || isLoading}
						startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
					>
						{isSubmitting ? t('common.creating') : t('common.create')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateHiringProcessDialog;
