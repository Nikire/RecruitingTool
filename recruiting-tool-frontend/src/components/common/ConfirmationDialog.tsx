import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	CircularProgress,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import {useTranslation} from 'react-i18next';

interface ConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	severity?: 'warning' | 'error' | 'info';
	isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	open,
	onClose,
	onConfirm,
	title,
	message,
	confirmText,
	cancelText,
	severity = 'warning',
	isLoading = false,
}) => {
	const {t} = useTranslation();

	// Determine icon based on severity
	const getIcon = () => {
		switch (severity) {
			case 'error':
				return <ErrorIcon color="error" aria-label={t('aria.error_icon')} />;
			case 'info':
				return <InfoIcon color="info" aria-label={t('aria.info_icon')} />;
			case 'warning':
			default:
				return <WarningIcon color="warning" aria-label={t('aria.warning_icon')} />;
		}
	};

	// Determine button color based on severity
	const getButtonColor = () => {
		switch (severity) {
			case 'error':
				return 'error';
			case 'info':
				return 'primary';
			case 'warning':
			default:
				return 'warning';
		}
	};

	const handleConfirm = async () => {
		await onConfirm();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			aria-labelledby="confirmation-dialog-title"
			aria-describedby="confirmation-dialog-description"
		>
			<DialogTitle
				id="confirmation-dialog-title"
				sx={{display: 'flex', alignItems: 'center', gap: 1}}
			>
				{getIcon()}
				{title}
			</DialogTitle>
			<DialogContent>
				<Typography id="confirmation-dialog-description" variant="body1">
					{message}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={onClose}
					disabled={isLoading}
					aria-label={cancelText || t('common.cancel')}
				>
					{cancelText || t('common.cancel')}
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color={getButtonColor()}
					disabled={isLoading}
					startIcon={isLoading ? <CircularProgress size={20} color="inherit" aria-label={t('aria.loading')} /> : undefined}
					aria-label={confirmText || t('common.confirm')}
				>
					{isLoading
						? t('common.loading')
						: confirmText || t('common.confirm')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationDialog;
