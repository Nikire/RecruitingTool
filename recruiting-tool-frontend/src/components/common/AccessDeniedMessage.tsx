import {Box, Alert, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface AccessDeniedMessageProps {
	requiredRoles?: string[];
	message?: string;
}

/**
 * AccessDeniedMessage - Displays a consistent access denied message
 * Used across pages where users don't have sufficient permissions
 */
const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({
	requiredRoles,
	message,
}) => {
	const {t} = useTranslation();

	const defaultMessage = requiredRoles
		? t('access.denied_with_roles', {roles: requiredRoles.join(', ')})
		: t('access.denied');

	return (
		<Box sx={{mt: 8}}>
			<Alert severity="error" sx={{mb: 2}}>
				{message || defaultMessage}
			</Alert>
			<Typography variant="body1">
				{t('access.contact_admin')}
			</Typography>
		</Box>
	);
};

export default AccessDeniedMessage;
