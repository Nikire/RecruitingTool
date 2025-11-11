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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useCandidates} from '../../hooks/api/useCandidates';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import CreateCandidateDialog from '../../components/dialogs/CreateCandidateDialog';
import {canManageResources} from '../../utils/permissions';

const CandidatesPage: React.FC = () => {
	const [openDialog, setOpenDialog] = useState(false);
	const {user} = useUserAtom();
	const {data: candidates, isLoading, error} = useCandidates();

	const canManage = canManageResources(user);

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

			<CreateCandidateDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
			/>
		</Box>
	);
};

export default CandidatesPage;
