import {Box, Skeleton} from '@mui/material';
import {useTranslation} from 'react-i18next';

interface SkeletonLoaderProps {
	variant: 'list' | 'table' | 'card';
	count?: number;
	height?: number;
}

/**
 * SkeletonLoader - Reusable skeleton loading component
 * Used for list items, table rows, and cards during data fetching
 *
 * @param variant - Type of skeleton to render (list, table, card)
 * @param count - Number of skeleton items to display (default: 5)
 * @param height - Height of each skeleton item in pixels (default: varies by variant)
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
	variant,
	count = 5,
	height,
}) => {
	const {t} = useTranslation();

	// Default heights based on variant
	const defaultHeight = {
		list: 60,
		table: 52,
		card: 200,
	};

	const itemHeight = height || defaultHeight[variant];

	// Screen reader accessibility
	const getAriaLabel = () => {
		switch (variant) {
			case 'list':
				return t('common.loading');
			case 'table':
				return t('common.loading');
			case 'card':
				return t('common.loading');
			default:
				return t('common.loading');
		}
	};

	return (
		<Box role="status" aria-label={getAriaLabel()} aria-live="polite">
			{Array.from({length: count}).map((_, index) => (
				<Box key={index} sx={{mb: variant === 'card' ? 2 : 1}}>
					{variant === 'list' && (
						<Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
							<Skeleton variant="circular" width={40} height={40} />
							<Box sx={{flex: 1}}>
								<Skeleton variant="text" width="60%" height={24} />
								<Skeleton variant="text" width="40%" height={20} />
							</Box>
						</Box>
					)}

					{variant === 'table' && (
						<Skeleton
							variant="rectangular"
							height={itemHeight}
							sx={{borderRadius: 1}}
						/>
					)}

					{variant === 'card' && (
						<Skeleton
							variant="rectangular"
							height={itemHeight}
							sx={{borderRadius: 2}}
						/>
					)}
				</Box>
			))}
		</Box>
	);
};

export default SkeletonLoader;
