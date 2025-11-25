import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	CircularProgress,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useCreateCandidate} from '../../hooks/api/useCandidates';

interface CreateCandidateDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface CandidateFormData {
	name: string;
	email: string;
}

const CreateCandidateDialog: React.FC<CreateCandidateDialogProps> = ({
	open,
	onClose,
	onSuccess,
}) => {
	const {t} = useTranslation();
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
				onSuccess?.();
			},
		});
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t('candidates.create_title')}</DialogTitle>
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
							{t('errors.create_failed', {entity: t('candidates.title').toLowerCase()})}
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
						{isPending ? t('common.creating') : t('common.create')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateCandidateDialog;
