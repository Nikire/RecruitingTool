import { Box, Chip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ActiveFilter {
	id: string;
	label: string;
	value: string;
	onRemove: () => void;
}

interface FilterChipsProps {
	filters: ActiveFilter[];
	onClearAll?: () => void;
}

/**
 * FilterChips - Display active filters as chips
 *
 * Features:
 * - Shows active filters as deletable chips
 * - "Clear all" button when multiple filters exist
 * - Empty state when no filters
 * - i18n support
 * - Responsive layout
 */
const FilterChips: React.FC<FilterChipsProps> = ({ filters, onClearAll }) => {
	const { t } = useTranslation();

	if (filters.length === 0) {
		return null;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				gap: 1,
				alignItems: { xs: 'flex-start', sm: 'center' },
			}}
		>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{
					fontWeight: 500,
					whiteSpace: 'nowrap',
				}}
			>
				{t('search.active_filters')}:
			</Typography>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 1,
					flex: 1,
				}}
			>
				{filters.map((filter) => (
					<Chip
						key={filter.id}
						label={`${filter.label}: ${filter.value}`}
						onDelete={filter.onRemove}
						size="small"
						color="primary"
						variant="outlined"
						sx={{
							maxWidth: { xs: '100%', sm: '300px' },
						}}
					/>
				))}
				{filters.length > 1 && onClearAll && (
					<Chip
						label={t('search.clear_all')}
						onClick={onClearAll}
						size="small"
						color="default"
						variant="outlined"
						sx={{
							fontWeight: 600,
							cursor: 'pointer',
							'&:hover': {
								backgroundColor: 'action.hover',
							},
						}}
					/>
				)}
			</Box>
		</Box>
	);
};

export default FilterChips;
