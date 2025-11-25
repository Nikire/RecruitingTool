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
import {useTranslation} from 'react-i18next';

interface ConfirmDeleteDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	message?: string;
	itemName?: string;
	isDeleting?: boolean;
	confirmText?: string;
	cancelText?: string;
	showWarningIcon?: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
	open,
	onClose,
	onConfirm,
	title,
	message,
	itemName,
	isDeleting = false,
	confirmText,
	cancelText,
	showWarningIcon = true,
}) => {
	const {t} = useTranslation();

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			aria-labelledby="confirm-delete-dialog-title"
			aria-describedby="confirm-delete-dialog-description"
		>
			<DialogTitle id="confirm-delete-dialog-title" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
				{showWarningIcon && <WarningIcon color="warning" aria-label={t('aria.warning_icon')} />}
				{title || t('dialogs.delete_confirmation')}
			</DialogTitle>
			<DialogContent>
				<Typography id="confirm-delete-dialog-description" variant="body1" sx={{mb: 2}}>
					{message || t('dialogs.delete_message')}
				</Typography>
				{itemName && (
					<Typography variant="body2" sx={{fontWeight: 'bold', color: 'error.main'}} role="note">
						{itemName}
					</Typography>
				)}
				<Typography variant="body2" color="textSecondary" sx={{mt: 2}} role="note">
					{t('dialogs.action_irreversible')}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isDeleting} aria-label={t('aria.cancel')}>
					{cancelText || t('common.cancel')}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isDeleting}
					startIcon={isDeleting ? <CircularProgress size={20} color="inherit" aria-label={t('aria.loading')} /> : undefined}
					aria-label={isDeleting ? t('common.deleting') : confirmText || t('common.delete')}
				>
					{isDeleting
						? t('common.deleting')
						: confirmText || t('common.delete')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDeleteDialog;
