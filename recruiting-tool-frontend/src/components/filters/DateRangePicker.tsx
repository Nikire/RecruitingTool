import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface DateRange {
	startDate: string;
	endDate: string;
}

interface DateRangePickerProps {
	startDate: string;
	endDate: string;
	onChange: (dateRange: DateRange) => void;
	minDate?: string;
	maxDate?: string;
	disabled?: boolean;
}

/**
 * DateRangePicker - Date range selection component
 *
 * Features:
 * - Start and end date pickers
 * - Validation (start date cannot be after end date)
 * - Optional min/max date constraints
 * - i18n support
 * - Accessible with proper labels
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
	startDate,
	endDate,
	onChange,
	minDate,
	maxDate,
	disabled = false,
}) => {
	const { t } = useTranslation();

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({
			startDate: e.target.value,
			endDate,
		});
	};

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({
			startDate,
			endDate: e.target.value,
		});
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				gap: 2,
				alignItems: { xs: 'stretch', sm: 'center' },
			}}
		>
			<TextField
				type="date"
				label={t('search.start_date')}
				value={startDate}
				onChange={handleStartDateChange}
				size="small"
				disabled={disabled}
				InputLabelProps={{
					shrink: true,
				}}
				inputProps={{
					min: minDate,
					max: endDate || maxDate,
					'aria-label': t('search.start_date'),
				}}
				sx={{
					flex: 1,
					'& .MuiInputBase-root': {
						minHeight: { xs: 44, sm: 40 },
					},
				}}
			/>
			<TextField
				type="date"
				label={t('search.end_date')}
				value={endDate}
				onChange={handleEndDateChange}
				size="small"
				disabled={disabled}
				InputLabelProps={{
					shrink: true,
				}}
				inputProps={{
					min: startDate || minDate,
					max: maxDate,
					'aria-label': t('search.end_date'),
				}}
				sx={{
					flex: 1,
					'& .MuiInputBase-root': {
						minHeight: { xs: 44, sm: 40 },
					},
				}}
			/>
		</Box>
	);
};

export default DateRangePicker;
