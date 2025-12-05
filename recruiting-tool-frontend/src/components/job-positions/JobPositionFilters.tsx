import React from 'react';
import {
	Box,
	TextField,
	MenuItem,
	Button,
	Paper,
	InputAdornment,
	Typography,
	Chip,
	Stack,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {JobPositionStatus} from '../../types/jobPosition.types';

export interface JobPositionFiltersState {
	search: string;
	status: JobPositionStatus | 'ALL';
	department: string;
}

interface JobPositionFiltersProps {
	filters: JobPositionFiltersState;
	onChange: (filters: JobPositionFiltersState) => void;
}

const JobPositionFilters: React.FC<JobPositionFiltersProps> = ({
	filters,
	onChange,
}) => {
	const {t} = useTranslation();

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange({
			...filters,
			search: event.target.value,
		});
	};

	const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange({
			...filters,
			status: event.target.value as JobPositionStatus | 'ALL',
		});
	};

	const handleDepartmentChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		onChange({
			...filters,
			department: event.target.value,
		});
	};

	const handleClearFilters = () => {
		onChange({
			search: '',
			status: 'ALL',
			department: 'ALL',
		});
	};

	const hasActiveFilters =
		filters.search !== '' || filters.status !== 'ALL' || filters.department !== 'ALL';

	const activeFilterCount = [
		filters.search !== '',
		filters.status !== 'ALL',
		filters.department !== 'ALL',
	].filter(Boolean).length;

	return (
		<Paper sx={{p: 2, mb: 3}}>
			<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
				{/* Search Input */}
				<TextField
					fullWidth
					placeholder={t('job_position_filters.search_placeholder')}
					value={filters.search}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
						endAdornment: filters.search && (
							<InputAdornment position="end">
								<Button
									size="small"
									onClick={() => onChange({...filters, search: ''})}
									sx={{minWidth: 'auto', p: 0.5}}
								>
									<ClearIcon fontSize="small" />
								</Button>
							</InputAdornment>
						),
					}}
				/>

				{/* Filter Dropdowns */}
				<Box
					sx={{
						display: 'flex',
						gap: 2,
						flexWrap: 'wrap',
					}}
				>
					{/* Status Filter */}
					<TextField
						select
						label={t('job_position_filters.status_label')}
						value={filters.status}
						onChange={handleStatusChange}
						sx={{minWidth: 200, flex: '1 1 200px'}}
						size="small"
					>
						<MenuItem value="ALL">{t('job_position_filters.all_statuses')}</MenuItem>
						<MenuItem value="OPEN">{t('status.open')}</MenuItem>
						<MenuItem value="CLOSED">{t('status.closed')}</MenuItem>
						<MenuItem value="CANCELLED">{t('status.cancelled')}</MenuItem>
					</TextField>

					{/* Department Filter */}
					<TextField
						select
						label={t('job_position_filters.department_label')}
						value={filters.department}
						onChange={handleDepartmentChange}
						sx={{minWidth: 200, flex: '1 1 200px'}}
						size="small"
					>
						<MenuItem value="ALL">{t('job_position_filters.all_departments')}</MenuItem>
						<MenuItem value="engineering">{t('job_position_filters.engineering')}</MenuItem>
						<MenuItem value="marketing">{t('job_position_filters.marketing')}</MenuItem>
						<MenuItem value="sales">{t('job_position_filters.sales')}</MenuItem>
						<MenuItem value="hr">{t('job_position_filters.hr')}</MenuItem>
						<MenuItem value="finance">{t('job_position_filters.finance')}</MenuItem>
						<MenuItem value="operations">{t('job_position_filters.operations')}</MenuItem>
					</TextField>

					{/* Clear Filters Button */}
					{hasActiveFilters && (
						<Button
							variant="outlined"
							onClick={handleClearFilters}
							startIcon={<ClearIcon />}
							sx={{flex: '0 0 auto'}}
							size="small"
						>
							{t('job_position_filters.clear_filters')}
						</Button>
					)}
				</Box>

				{/* Active Filters Display */}
				{hasActiveFilters && (
					<Box>
						<Typography variant="caption" color="text.secondary" sx={{mr: 1}}>
							{t('job_position_filters.active_filters', {
								count: activeFilterCount,
							})}
						</Typography>
						<Stack direction="row" spacing={1} sx={{mt: 1, flexWrap: 'wrap'}}>
							{filters.search && (
								<Chip
									label={`${t('common.search')}: ${filters.search}`}
									size="small"
									onDelete={() => onChange({...filters, search: ''})}
								/>
							)}
							{filters.status !== 'ALL' && (
								<Chip
									label={`${t('job_position_filters.status_label')}: ${t(
										`status.${filters.status.toLowerCase()}`
									)}`}
									size="small"
									onDelete={() => onChange({...filters, status: 'ALL'})}
								/>
							)}
							{filters.department !== 'ALL' && (
								<Chip
									label={`${t('job_position_filters.department_label')}: ${t(
										`job_position_filters.${filters.department}`
									)}`}
									size="small"
									onDelete={() => onChange({...filters, department: 'ALL'})}
								/>
							)}
						</Stack>
					</Box>
				)}
			</Box>
		</Paper>
	);
};

export default JobPositionFilters;
