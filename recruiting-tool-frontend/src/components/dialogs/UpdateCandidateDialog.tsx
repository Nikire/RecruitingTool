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
	CircularProgress,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
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
	const {t} = useTranslation();
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
			<DialogTitle>{t('candidates.update_title')}</DialogTitle>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={activeTab} onChange={handleTabChange}>
					<Tab label={t('candidates.info_tab')} />
					<Tab label={t('candidates.files_tab')} />
					<Tab label={t('candidates.notes_tab')} />
				</Tabs>
			</Box>

			{activeTab === 0 && (
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent>
						<TextField
							label={t('candidates.name_label')}
							fullWidth
							margin="normal"
							{...register('name', {
								required: t('validation.name_required'),
								minLength: {
									value: 3,
									message: t('validation.name_min_length', {min: 3}),
								},
								maxLength: {
									value: 100,
									message: t('validation.name_max_length', {max: 100}),
								},
							})}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<TextField
							label={t('candidates.email_label')}
							type="email"
							fullWidth
							margin="normal"
							{...register('email', {
								required: t('validation.email_required'),
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: t('validation.email_invalid'),
								},
							})}
							error={!!errors.email}
							helperText={errors.email?.message}
						/>

						{isError && (
							<Typography color="error" sx={{mt: 2}}>
								{t('errors.update_failed', {entity: t('candidates.title').toLowerCase()})}
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
							disabled={isPending}
							startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
						>
							{isPending ? t('common.updating') : t('common.update')}
						</Button>
					</DialogActions>
				</form>
			)}

			{activeTab === 1 && (
				<>
					<DialogContent>
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" gutterBottom>
								{t('candidates.upload_files')}
							</Typography>
							<FileUpload candidateUid={candidate?.uid} />
						</Box>

						<Divider sx={{ my: 3 }} />

						<Box>
							<Typography variant="h6" gutterBottom>
								{t('candidates.uploaded_files')}
							</Typography>
							<FileList candidateUid={candidate?.uid} />
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>
							{t('common.close')}
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
							{t('common.close')}
						</Button>
					</DialogActions>
				</>
			)}
		</Dialog>
	);
};

export default UpdateCandidateDialog;
