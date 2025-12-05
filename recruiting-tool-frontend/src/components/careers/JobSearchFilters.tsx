import {Box, TextField, InputAdornment, Chip, Stack, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {useState, useCallback} from 'react';

interface JobSearchFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
}

const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({search, onSearchChange}) => {
	const {t} = useTranslation();
	const [localSearch, setLocalSearch] = useState(search);

	// Debounced search handler
	const handleSearchChange = useCallback(
		(value: string) => {
			setLocalSearch(value);
			// Debounce search for better UX
			const timeoutId = setTimeout(() => {
				onSearchChange(value);
			}, 300);
			return () => clearTimeout(timeoutId);
		},
		[onSearchChange]
	);

	const handleClearSearch = () => {
		setLocalSearch('');
		onSearchChange('');
	};

	return (
		<Box sx={{mb: 4}}>
			{/* Search bar */}
			<TextField
				fullWidth
				placeholder={t('careers.search_placeholder')}
				value={localSearch}
				onChange={(e) => handleSearchChange(e.target.value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{color: 'text.secondary', fontSize: 24}} />
						</InputAdornment>
					),
					endAdornment: localSearch && (
						<InputAdornment position="end">
							<CloseIcon
								sx={{
									color: 'text.secondary',
									fontSize: 20,
									cursor: 'pointer',
									'&:hover': {color: 'text.primary'},
								}}
								onClick={handleClearSearch}
							/>
						</InputAdornment>
					),
					sx: {
						bgcolor: 'background.paper',
						borderRadius: 2,
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: 'divider',
							borderWidth: 2,
						},
						'&:hover .MuiOutlinedInput-notchedOutline': {
							borderColor: 'primary.main',
						},
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							borderColor: 'primary.main',
						},
					},
				}}
				sx={{
					'& .MuiInputBase-input': {
						py: 2,
						fontSize: '1.1rem',
					},
				}}
			/>

			{/* Filter chips - for future expansion */}
			{/*
			<Stack direction="row" spacing={1} sx={{mt: 2, flexWrap: 'wrap', gap: 1}}>
				<Chip
					label={t('job_position_filters.all_departments')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
				<Chip
					label={t('job_position_filters.engineering')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
				<Chip
					label={t('job_position_card.remote')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
			</Stack>
			*/}
		</Box>
	);
};

export default JobSearchFilters;
