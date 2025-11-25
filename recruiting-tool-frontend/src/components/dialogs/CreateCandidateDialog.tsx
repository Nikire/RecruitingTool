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
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t('candidates.create_title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
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
						InputProps={{
							endAdornment: errors.name ? (
								<InputAdornment position="end">
									<ErrorIcon color="error" />
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
						InputProps={{
							endAdornment: errors.email ? (
								<InputAdornment position="end">
									<ErrorIcon color="error" />
								</InputAdornment>
							) : null,
						}}
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
