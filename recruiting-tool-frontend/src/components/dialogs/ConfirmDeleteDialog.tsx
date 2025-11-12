import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface ConfirmDeleteDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	itemName?: string;
	isDeleting?: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
	open,
	onClose,
	onConfirm,
	title,
	message,
	itemName,
	isDeleting = false,
}) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1}}>
				<WarningIcon color="warning" />
				{title}
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1" sx={{mb: 2}}>
					{message}
				</Typography>
				{itemName && (
					<Typography variant="body2" sx={{fontWeight: 'bold', color: 'error.main'}}>
						{itemName}
					</Typography>
				)}
				<Typography variant="body2" color="textSecondary" sx={{mt: 2}}>
					This action cannot be undone.
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isDeleting}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="error"
					disabled={isDeleting}
				>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDeleteDialog;
