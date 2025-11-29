import { useState } from 'react';
import {
	Box,
	Button,
	Collapse,
	Divider,
	IconButton,
	MenuItem,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';
import SearchInput from './SearchInput';
import DateRangePicker, { DateRange } from './DateRangePicker';
import FilterChips, { ActiveFilter } from './FilterChips';

export interface FilterBarFilters {
	search: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	[key: string]: string | undefined;
}

export interface FilterBarProps {
	filters: FilterBarFilters;
	onChange: (filters: FilterBarFilters) => void;
	statusOptions?: Array<{ value: string; labelKey: string }>;
	showDateRange?: boolean;
	showStatusFilter?: boolean;
	searchPlaceholder?: string;
}

/**
 * FilterBar - Reusable advanced search and filtering component
 *
 * Features:
 * - Debounced search input
 * - Optional status filter dropdown
 * - Optional date range picker
 * - Active filter chips with individual removal
 * - "Clear all filters" button
 * - Collapsible advanced filters section
 * - Fully responsive design
 * - i18n compliant
 * - Accessible (ARIA labels, keyboard navigation)
 *
 * Usage:
 * ```tsx
 * const [filters, setFilters] = useState<FilterBarFilters>({
 *   search: '',
 *   status: '',
 *   startDate: '',
 *   endDate: '',
 * });
 *
 * <FilterBar
 *   filters={filters}
 *   onChange={setFilters}
 *   statusOptions={[
 *     { value: 'OPEN', labelKey: 'status.open' },
 *     { value: 'CLOSED', labelKey: 'status.closed' },
 *   ]}
 *   showDateRange={true}
 *   showStatusFilter={true}
 *   searchPlaceholder="Search candidates..."
 * />
 * ```
 */
const FilterBar: React.FC<FilterBarProps> = ({
	filters,
	onChange,
	statusOptions = [],
	showDateRange = false,
	showStatusFilter = false,
	searchPlaceholder,
}) => {
	const { t } = useTranslation();
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	const handleSearchChange = (search: string) => {
		onChange({ ...filters, search });
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ ...filters, status: e.target.value });
	};

	const handleDateRangeChange = (dateRange: DateRange) => {
		onChange({
			...filters,
			startDate: dateRange.startDate,
			endDate: dateRange.endDate,
		});
	};

	const handleClearAll = () => {
		onChange({
			search: '',
			status: '',
			startDate: '',
			endDate: '',
		});
	};

	const handleRemoveFilter = (filterKey: string) => {
		onChange({ ...filters, [filterKey]: '' });
	};

	const toggleAdvancedFilters = () => {
		setShowAdvancedFilters((prev) => !prev);
	};

	// Build active filters for chips
	const activeFilters: ActiveFilter[] = [];

	if (filters.search) {
		activeFilters.push({
			id: 'search',
			label: t('common.search'),
			value: filters.search,
			onRemove: () => handleRemoveFilter('search'),
		});
	}

	if (filters.status && showStatusFilter) {
		const statusOption = statusOptions.find((opt) => opt.value === filters.status);
		activeFilters.push({
			id: 'status',
			label: t('search.status'),
			value: statusOption ? t(statusOption.labelKey) : filters.status,
			onRemove: () => handleRemoveFilter('status'),
		});
	}

	if (filters.startDate && showDateRange) {
		activeFilters.push({
			id: 'startDate',
			label: t('search.start_date'),
			value: filters.startDate,
			onRemove: () => handleRemoveFilter('startDate'),
		});
	}

	if (filters.endDate && showDateRange) {
		activeFilters.push({
			id: 'endDate',
			label: t('search.end_date'),
			value: filters.endDate,
			onRemove: () => handleRemoveFilter('endDate'),
		});
	}

	const hasAdvancedFilters = showDateRange || showStatusFilter;
	const hasActiveFilters = activeFilters.length > 0;

	return (
		<Box sx={{ mb: 3 }}>
			{/* Search Bar */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					gap: 2,
					alignItems: { xs: 'stretch', sm: 'center' },
				}}
			>
				<Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: 600 } }}>
					<SearchInput
						value={filters.search}
						onChange={handleSearchChange}
						placeholder={searchPlaceholder}
					/>
				</Box>

				{/* Advanced Filters Toggle */}
				{hasAdvancedFilters && (
					<Button
						variant="outlined"
						startIcon={<FilterListIcon />}
						endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
						onClick={toggleAdvancedFilters}
						aria-expanded={showAdvancedFilters}
						aria-controls="advanced-filters-panel"
						sx={{
							minHeight: 44,
							whiteSpace: 'nowrap',
						}}
					>
						{t('search.filters')}
					</Button>
				)}
			</Box>

			{/* Advanced Filters Panel */}
			{hasAdvancedFilters && (
				<Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
					<Paper
						id="advanced-filters-panel"
						sx={{
							mt: 2,
							p: 2,
							backgroundColor: 'background.default',
						}}
						elevation={0}
					>
						<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
							{t('search.advanced_search')}
						</Typography>
						<Divider sx={{ mb: 2 }} />

						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							{/* Status Filter */}
							{showStatusFilter && statusOptions.length > 0 && (
								<TextField
									select
									label={t('search.status')}
									value={filters.status || ''}
									onChange={handleStatusChange}
									size="small"
									fullWidth
									sx={{
										maxWidth: { xs: '100%', sm: 300 },
									}}
								>
									<MenuItem value="">
										<em>{t('common.select')}</em>
									</MenuItem>
									{statusOptions.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{t(option.labelKey)}
										</MenuItem>
									))}
								</TextField>
							)}

							{/* Date Range Filter */}
							{showDateRange && (
								<Box>
									<Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
										{t('search.date_range')}
									</Typography>
									<DateRangePicker
										startDate={filters.startDate || ''}
										endDate={filters.endDate || ''}
										onChange={handleDateRangeChange}
									/>
								</Box>
							)}

							{/* Apply/Reset Buttons */}
							<Box
								sx={{
									display: 'flex',
									gap: 1,
									justifyContent: 'flex-end',
								}}
							>
								<Button
									variant="outlined"
									size="small"
									onClick={handleClearAll}
									disabled={!hasActiveFilters}
								>
									{t('search.reset_filters')}
								</Button>
							</Box>
						</Box>
					</Paper>
				</Collapse>
			)}

			{/* Active Filter Chips */}
			{hasActiveFilters && (
				<Box sx={{ mt: 2 }}>
					<FilterChips filters={activeFilters} onClearAll={handleClearAll} />
				</Box>
			)}
		</Box>
	);
};

export default FilterBar;
