import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Card,
	CardContent,
	Skeleton,
	Stack,
	Chip,
	IconButton,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useTranslation} from 'react-i18next';
import {useListCompanies} from '../../hooks/api/useCompanies';
import {Company} from '../../types/company.types';
import Pagination from '../pagination/Pagination';
import {TableRowActions} from '../tables';
import TableSkeletonLoader from '../common/TableSkeletonLoader';

interface CompaniesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onEdit: (company: Company) => void;
	onDelete: (company: Company) => void;
}

// Skeleton loader for loading state
const CompanyCardSkeleton = () => (
	<Card sx={{mb: 2, p: 2}}>
		<Stack spacing={1}>
			<Skeleton variant="text" width="70%" height={28} />
			<Skeleton variant="text" width="90%" height={20} />
			<Box sx={{display: 'flex', gap: 1, mt: 2}}>
				<Skeleton variant="rectangular" width={80} height={32} />
				<Skeleton variant="rectangular" width={80} height={32} />
			</Box>
			<Box sx={{display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end'}}>
				<Skeleton variant="circular" width={40} height={40} />
				<Skeleton variant="circular" width={40} height={40} />
			</Box>
		</Stack>
	</Card>
);

// Mobile card view component
const CompanyCardView: React.FC<{
	company: Company;
	onEdit: (company: Company) => void;
	onDelete: (company: Company) => void;
}> = ({company, onEdit, onDelete}) => {
	const {t} = useTranslation();
	return (
		<Card
			sx={{
				mb: 2,
				p: 2,
				transition: 'all 0.2s ease-in-out',
				'&:hover': {
					boxShadow: 3,
					transform: 'translateY(-2px)',
				},
			}}
		>
			<CardContent sx={{p: 0, '&:last-child': {pb: 0}}}>
				<Typography variant="h6" sx={{mb: 1, fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>
					{company.name}
				</Typography>

				<Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
					{company.description || '-'}
				</Typography>

				<Box sx={{display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap'}}>
					<Chip
						label={`${company.userCount || 0} ${t('users.title')}`}
						variant="outlined"
						size="small"
						sx={{fontSize: '0.85rem'}}
					/>
					<Chip
						label={`${company.jobPositionCount || 0} ${t('job_positions.title')}`}
						variant="outlined"
						size="small"
						sx={{fontSize: '0.85rem'}}
					/>
				</Box>

				<Box
					sx={{
						display: 'flex',
						gap: 1,
						justifyContent: 'flex-end',
						mt: 2,
					}}
				>
					<IconButton
						size="small"
						color="primary"
						onClick={() => onEdit(company)}
						aria-label={t('users.edit_user_tooltip')}
						sx={{
							minHeight: 44,
							minWidth: 44,
						}}
					>
						<EditIcon />
					</IconButton>
					<IconButton
						size="small"
						color="error"
						onClick={() => onDelete(company)}
						aria-label={t('users.delete_user_tooltip')}
						sx={{
							minHeight: 44,
							minWidth: 44,
						}}
					>
						<DeleteIcon />
					</IconButton>
				</Box>
			</CardContent>
		</Card>
	);
};

const CompaniesList: React.FC<CompaniesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
	onEdit,
	onDelete,
}) => {
	const {t} = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const {data, isLoading} = useListCompanies({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const companies = data?.data;
	const meta = data?.meta;

	// Show skeleton loader on INITIAL load, not on refetch
	if (isLoading && !data) {
		return (
			<Box sx={{width: '100%'}}>
				{isMobile ? (
					<Box sx={{width: '100%'}}>
						{[1, 2, 3].map((i) => (
							<CompanyCardSkeleton key={i} />
						))}
					</Box>
				) : (
					<TableSkeletonLoader rows={limit} columns={5} />
				)}
			</Box>
		);
	}

	// Mobile view (card layout)
	if (isMobile) {
		return (
			<>
				{companies && companies.length > 0 ? (
					<Box sx={{width: '100%'}}>
						{companies.map((company) => (
							<CompanyCardView
								key={company.uid}
								company={company}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</Box>
				) : (
					<Paper sx={{p: {xs: 2, sm: 4}, textAlign: 'center'}}>
						<Typography variant="body1" color="textSecondary">
							{t('companies.no_companies')}
						</Typography>
					</Paper>
				)}

				{meta && (
					<Pagination
						meta={meta}
						onPageChange={onPageChange}
						onLimitChange={onLimitChange}
					/>
				)}
			</>
		);
	}

	// Desktop view (table layout)
	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{t('companies.name_label')}</TableCell>
							<TableCell>{t('companies.description_label')}</TableCell>
							<TableCell align="center">{t('users.title')}</TableCell>
							<TableCell align="center">{t('job_positions.title')}</TableCell>
							<TableCell align="center">{t('common.actions')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{companies?.map((company) => (
							<TableRow key={company.uid}>
								<TableCell>{company.name}</TableCell>
								<TableCell>{company.description || '-'}</TableCell>
								<TableCell align="center">{company.userCount || 0}</TableCell>
								<TableCell align="center">{company.jobPositionCount || 0}</TableCell>
								<TableCell align="center">
									<TableRowActions
										onEdit={() => onEdit(company)}
										onDelete={() => onDelete(company)}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}
		</>
	);
};

export default CompaniesList;
