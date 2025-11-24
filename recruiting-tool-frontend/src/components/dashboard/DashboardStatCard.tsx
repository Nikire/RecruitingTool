import {Card, CardContent, Box, Typography, CircularProgress} from '@mui/material';
import {useTranslation} from 'react-i18next';

/**
 * Props for the DashboardStatCard component
 */
export interface DashboardStatCardProps {
	/** Title of the stat card (can be i18n key or plain text) */
	title: string;
	/** Main value to display (number or formatted string) */
	value: number | string;
	/** Optional subtitle text (can be i18n key or plain text) */
	subtitle?: string;
	/** Icon element to display */
	icon: React.ReactNode;
	/** MUI theme color for the icon (e.g., 'primary.main', 'success.main') */
	iconColor: string;
	/** Loading state - shows spinner instead of value */
	isLoading?: boolean;
	/** Optional click handler - makes card interactive */
	onClick?: () => void;
	/** Whether to translate title and subtitle using i18n (default: false) */
	translate?: boolean;
}

/**
 * DashboardStatCard - Reusable stat card component for dashboards
 *
 * Displays a key metric with an icon, title, value, and optional subtitle.
 * Supports loading states and click interactions.
 *
 * @example
 * ```tsx
 * <DashboardStatCard
 *   title="dashboard.total_applications"
 *   value={150}
 *   subtitle="dashboard.pending_review"
 *   icon={<AssignmentIcon />}
 *   iconColor="primary.main"
 *   isLoading={isLoading}
 *   onClick={() => navigate('/applications')}
 *   translate
 * />
 * ```
 */
const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
	title,
	value,
	subtitle,
	icon,
	iconColor,
	isLoading = false,
	onClick,
	translate = false,
}) => {
	const {t} = useTranslation();

	// Determine if card should be interactive
	const isClickable = !!onClick;

	// Translate text if requested
	const displayTitle = translate ? t(title) : title;
	const displaySubtitle = subtitle ? (translate ? t(subtitle) : subtitle) : undefined;

	return (
		<Card
			sx={{
				height: '100%',
				cursor: isClickable ? 'pointer' : 'default',
				transition: 'box-shadow 0.3s ease, transform 0.1s ease',
				'&:hover': isClickable ? {
					boxShadow: 4,
					transform: 'translateY(-2px)',
				} : {},
			}}
			onClick={onClick}
		>
			<CardContent>
				<Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
					<Box
						sx={{
							fontSize: 40,
							color: iconColor,
							mr: 2,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{icon}
					</Box>
					<Box sx={{flex: 1}}>
						<Typography color="text.secondary" variant="body2">
							{displayTitle}
						</Typography>
						{isLoading ? (
							<CircularProgress size={24} sx={{mt: 0.5}} />
						) : (
							<Typography variant="h4">{value}</Typography>
						)}
					</Box>
				</Box>
				{displaySubtitle && (
					<Typography variant="body2" color="text.secondary">
						{displaySubtitle}
					</Typography>
				)}
			</CardContent>
		</Card>
	);
};

export default DashboardStatCard;
