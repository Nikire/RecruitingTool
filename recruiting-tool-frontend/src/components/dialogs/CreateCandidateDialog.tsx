import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	CircularProgress,
	InputAdornment,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useCreateCandidate} from '../../hooks/api/useCandidates';
import {useValidationRules} from '../../utils/validation';
import {useIsMobile} from '../../hooks/useMediaQuery';
import FormErrorSummary from '../common/FormErrorSummary';

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
	const validationRules = useValidationRules();
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
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			aria-labelledby="create-candidate-dialog-title"
			aria-describedby="create-candidate-dialog-description"
		>
			<DialogTitle id="create-candidate-dialog-title">
				{t('candidates.create_title')}
			</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)} aria-label={t('aria.create_dialog', {entity: t('candidates.title').toLowerCase()})}>
				<DialogContent>
					<FormErrorSummary errors={errors} />

					<TextField
						label={t('candidates.name_label')}
						fullWidth
						margin="normal"
						{...register('name', validationRules.combine(
							validationRules.required(t('candidates.name_label')),
							validationRules.minLength(3),
							validationRules.maxLength(100),
						))}
						error={!!errors.name}
						helperText={errors.name?.message}
						inputProps={{
							'aria-required': 'true',
							'aria-invalid': !!errors.name,
							'aria-describedby': errors.name ? 'name-error' : undefined,
						}}
						InputProps={{
							endAdornment: errors.name ? (
								<InputAdornment position="end">
									<ErrorIcon color="error" aria-label={t('aria.error_icon')} />
								</InputAdornment>
							) : null,
						}}
					/>

					<TextField
						label={t('candidates.email_label')}
						type="email"
						fullWidth
						margin="normal"
						{...register('email', validationRules.email())}
						error={!!errors.email}
						helperText={errors.email?.message}
						inputProps={{
							'aria-required': 'true',
							'aria-invalid': !!errors.email,
							'aria-describedby': errors.email ? 'email-error' : undefined,
						}}
						InputProps={{
							endAdornment: errors.email ? (
								<InputAdornment position="end">
									<ErrorIcon color="error" aria-label={t('aria.error_icon')} />
								</InputAdornment>
							) : null,
						}}
					/>

					{isError && (
						<Typography color="error" sx={{mt: 2}} role="alert" aria-live="polite">
							{t('errors.create_failed', {entity: t('candidates.title').toLowerCase()})}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending} aria-label={t('aria.cancel')}>
						{t('common.cancel')}
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending}
						startIcon={isPending ? <CircularProgress size={20} color="inherit" aria-label={t('aria.loading')} /> : undefined}
						aria-label={isPending ? t('common.creating') : t('common.create')}
					>
						{isPending ? t('common.creating') : t('common.create')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default CreateCandidateDialog;
