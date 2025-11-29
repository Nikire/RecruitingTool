import {useState} from 'react';
import {Typography, Box, useTheme, useMediaQuery} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useSearchPaginationHandlers} from '../../hooks/useSearchPaginationHandlers';
import JobPositionsList from '../../components/job-positions/JobPositionsList';
import SearchBar from '../../components/search/SearchBar';

// Define search state interface
interface SearchState {
	page: number;
	limit: number;
	search: string;
}

const CareersPage: React.FC = () => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	// Local search state for public careers page
	const [searchState, setSearchState] = useState<SearchState>({
		page: 1,
		limit: 10,
		search: '',
	});

	const {page, limit, search} = searchState;

	const {handleSearch, handlePageChange, handleLimitChange} =
		useSearchPaginationHandlers(setSearchState);

	return (
		<Box>
			<Box sx={{mb: {xs: 2, sm: 3}}}>
				<Typography
					variant={isMobile ? 'h5' : 'h4'}
					sx={{
						fontSize: {xs: '1.5rem', sm: '1.75rem', md: '2rem'},
						fontWeight: 600,
						mb: 0.5,
					}}
				>
					{t('careers.title')}
				</Typography>
				<Typography
					variant="body2"
					color="textSecondary"
					sx={{fontSize: {xs: '0.875rem', sm: '1rem'}}}
				>
					{t('careers.subtitle')}
				</Typography>
			</Box>

			<Box sx={{mb: {xs: 2, sm: 3}, maxWidth: {xs: '100%', md: 400}}}>
				<SearchBar
					onSearch={handleSearch}
					placeholder={t('careers.search_placeholder')}
					value={search}
				/>
			</Box>

			<JobPositionsList
				page={page}
				limit={limit}
				search={search}
				onPageChange={handlePageChange}
				onLimitChange={handleLimitChange}
				publicMode={true}
			/>
		</Box>
	);
};

export default CareersPage;
