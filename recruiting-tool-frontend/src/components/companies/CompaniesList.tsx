import {Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {useListCompanies} from '../../hooks/api/useCompanies';
import {Company} from '../../types/company.types';
import Pagination from '../pagination/Pagination';

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
							<TableCell>Name</TableCell>
							<TableCell>Description</TableCell>
							<TableCell align="center">Users</TableCell>
							<TableCell align="center">Job Positions</TableCell>
							<TableCell align="center">Actions</TableCell>
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
									<IconButton size="small" onClick={() => onEdit(company)} color="primary">
										<EditIcon />
									</IconButton>
									<IconButton size="small" onClick={() => onDelete(company)} color="error">
										<DeleteIcon />
									</IconButton>
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
