import {Box, Card, CardContent, Skeleton} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface CardSkeletonLoaderProps {
	count?: number;
	height?: number;
	variant?: 'default' | 'stat' | 'entity';
}

/**
 * CardSkeletonLoader - Skeleton loader for card-based layouts
 * Used for dashboard cards, entity cards, and stat cards
 *
 * @param count - Number of skeleton cards to display (default: 4)
 * @param height - Height of each card in pixels (default: 150)
 * @param variant - Type of card skeleton (default, stat, entity)
 */
const CardSkeletonLoader: React.FC<CardSkeletonLoaderProps> = ({
	count = 4,
	height = 150,
	variant = 'default',
}) => {
	const {t} = useTranslation();

	const renderCardContent = () => {
		switch (variant) {
			case 'stat':
				// Stat card skeleton (dashboard metric cards)
				return (
					<CardContent>
						<Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
							<Skeleton variant="circular" width={48} height={48} />
							<Box sx={{flex: 1}}>
								<Skeleton variant="text" width="60%" height={24} />
							</Box>
						</Box>
						<Skeleton variant="text" width="40%" height={32} />
						<Skeleton variant="text" width="80%" height={20} sx={{mt: 1}} />
					</CardContent>
				);

			case 'entity':
				// Entity card skeleton (candidate, job position cards)
				return (
					<CardContent>
						<Skeleton variant="text" width="70%" height={28} sx={{mb: 1}} />
						<Skeleton variant="text" width="50%" height={20} sx={{mb: 2}} />
						<Skeleton variant="rectangular" height={60} sx={{mb: 2}} />
						<Box sx={{display: 'flex', gap: 1}}>
							<Skeleton variant="rectangular" width={80} height={32} />
							<Skeleton variant="rectangular" width={80} height={32} />
						</Box>
					</CardContent>
				);

			default:
				// Default card skeleton
				return (
					<CardContent>
						<Skeleton variant="text" width="80%" height={28} sx={{mb: 1}} />
						<Skeleton variant="text" width="60%" height={20} sx={{mb: 2}} />
						<Skeleton
							variant="rectangular"
							height={height - 100}
							sx={{mb: 1}}
						/>
					</CardContent>
				);
		}
	};

	return (
		<Box
			role="status"
			aria-label={t('common.loading')}
			aria-live="polite"
			sx={{
				display: 'grid',
				gridTemplateColumns: {
					xs: '1fr',
					sm: 'repeat(2, 1fr)',
					md: 'repeat(auto-fill, minmax(250px, 1fr))',
				},
				gap: 2,
			}}
		>
			{Array.from({length: count}).map((_, index) => (
				<Card key={index} sx={{minHeight: height}}>
					{renderCardContent()}
				</Card>
			))}
		</Box>
	);
};

export default CardSkeletonLoader;
