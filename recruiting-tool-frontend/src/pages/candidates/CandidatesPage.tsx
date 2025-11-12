import {useState} from 'react';
import {
	Typography,
	Button,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useListCandidates} from '../../hooks/api/useCandidates';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources, isAdmin} from '../../utils/permissions';
import Pagination from '../../components/pagination/Pagination';
import SearchBar from '../../components/search/SearchBar';

const CandidatesPage: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const {user} = useUserAtom();
	const {data, isLoading, error} = useListCandidates({page, limit, search, sortBy: 'createdAt', sortOrder: 'desc'});

	const candidates = data?.data;
	const meta = data?.meta;

	const canManage = canManageResources(user);
	const hasAdminAccess = isAdmin(user);

	// Check if user has admin access
	if (!hasAdminAccess) {
		return (
			<Box sx={{p: 4}}>
				<Alert severity="error" sx={{mb: 2}}>
					Access Denied: You need ADMIN or SUPER_ADMIN role to view candidates.
				</Alert>
				<Typography variant="body1">
					Please contact your administrator if you believe you should have access to this page.
				</Typography>
			</Box>
		);
	}

	if (isLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{p: 4}}>
				<Typography color="error">
					Error loading candidates. Please try again.
				</Typography>
			</Box>
		);
	}

	const handleSearch = (value: string) => {
		setSearch(value);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setPage(1); // Reset to first page when changing limit
	};

	return (
		<Box sx={{p: 4}}>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h4">
					Candidates
				</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setOpenDialog(true)}
					>
						Create Candidate
					</Button>
				)}
			</Box>

			<Box sx={{mb: 3, maxWidth: 400}}>
				<SearchBar onSearch={handleSearch} placeholder="Search by name or email..." />
			</Box>

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
						No candidates found. {canManage && 'Create your first candidate to get started.'}
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />}

			<CreateCandidateDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default CandidatesPage;
