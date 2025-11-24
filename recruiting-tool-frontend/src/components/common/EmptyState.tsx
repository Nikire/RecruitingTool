import {Paper, Typography, Button, Box} from '@mui/material';
import {useTranslation} from 'react-i18next';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
	message: string; // i18n key
	icon?: React.ReactNode;
	action?: {
		label: string; // i18n key
		onClick: () => void;
	};
}

/**
 * EmptyState - Consistent empty state message component
 * Used when there's no data to display (e.g., empty lists, no search results)
 */
const EmptyState: React.FC<EmptyStateProps> = ({message, icon, action}) => {
	const {t} = useTranslation();

	return (
		<Paper sx={{p: 4, textAlign: 'center'}}>
			<Box sx={{mb: 2}}>
				{icon || <InboxIcon sx={{fontSize: 48, color: 'text.secondary'}} />}
			</Box>
			<Typography variant="h6" color="text.secondary" gutterBottom>
				{t(message)}
			</Typography>
			{action && (
				<Button
					variant="outlined"
					onClick={action.onClick}
					sx={{mt: 2}}
				>
					{t(action.label)}
				</Button>
			)}
		</Paper>
	);
};

export default EmptyState;
