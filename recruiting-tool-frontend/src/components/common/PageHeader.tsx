import {Box, Typography, Button} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface PageHeaderProps {
	title: string; // i18n key
	action?: {
		label: string; // i18n key
		icon?: React.ReactNode;
		onClick: () => void;
		disabled?: boolean;
	};
}

/**
 * PageHeader - Consistent page header with optional action button
 * Used across pages for unified header styling and structure
 */
const PageHeader: React.FC<PageHeaderProps> = ({title, action}) => {
	const {t} = useTranslation();

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				mb: 3,
			}}
		>
			<Typography variant="h4">{t(title)}</Typography>
			{action && (
				<Button
					variant="contained"
					startIcon={action.icon}
					onClick={action.onClick}
					disabled={action.disabled}
				>
					{t(action.label)}
				</Button>
			)}
		</Box>
	);
};

export default PageHeader;
