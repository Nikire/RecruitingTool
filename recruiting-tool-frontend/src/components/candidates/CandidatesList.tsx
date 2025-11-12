import {Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import {useListCandidates} from '../../hooks/api/useCandidates';
import Pagination from '../pagination/Pagination';

interface CandidatesListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const {data, isLoading, error} = useListCandidates({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const candidates = data?.data;
	const meta = data?.meta;

	// Only show loading spinner on INITIAL load, not on refetch
	if (isLoading && !data) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error && !data) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					Error loading candidates. Please try again.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{candidates && candidates.length > 0 ? (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>Name</strong></TableCell>
								<TableCell><strong>Email</strong></TableCell>
								<TableCell><strong>UID</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{candidates.map((candidate) => (
								<TableRow key={candidate.uid} hover>
									<TableCell>{candidate.name}</TableCell>
									<TableCell>{candidate.email}</TableCell>
									<TableCell>
										<Typography variant="caption" sx={{fontFamily: 'monospace'}}>
											{candidate.uid}
										</Typography>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography variant="body1" color="textSecondary">
						No candidates found.
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}
		</>
	);
};

export default CandidatesList;
