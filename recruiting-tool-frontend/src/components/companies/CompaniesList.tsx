import {Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useListCompanies} from '../../hooks/api/useCompanies';
import {Company} from '../../types/company.types';
import Pagination from '../pagination/Pagination';
import {TableRowActions} from '../tables';

interface CompaniesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onEdit: (company: Company) => void;
	onDelete: (company: Company) => void;
}

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
	const {data, isLoading} = useListCompanies({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const companies = data?.data;
	const meta = data?.meta;

	// Only show loading spinner on INITIAL load, not on refetch
	if (isLoading && !data) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
				<CircularProgress />
			</Box>
		);
	}

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
