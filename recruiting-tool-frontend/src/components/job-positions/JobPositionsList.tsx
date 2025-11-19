import {
	Box,
	CircularProgress,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	Button,
	Card,
	CardContent,
	Skeleton,
	Stack,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import {useState} from 'react';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import Pagination from '../pagination/Pagination';
import {useNavigate} from 'react-router-dom';
import {ApplyToJobDialog} from '../dialogs/ApplyToJobDialog';

interface JobPositionsListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

// Skeleton loader for loading state
const JobPositionCardSkeleton = () => (
	<Card sx={{mb: 2, p: 2}}>
		<Stack spacing={1}>
			<Skeleton variant="text" width="70%" height={28} />
			<Skeleton variant="text" width="40%" height={20} />
			<Box sx={{display: 'flex', gap: 1, mt: 2}}>
				<Skeleton variant="rectangular" width="48%" height={40} />
				<Skeleton variant="rectangular" width="48%" height={40} />
			</Box>
		</Stack>
	</Card>
);

// Mobile card view component
const JobPositionCardView: React.FC<{
	jobPosition: any;
	onApplyClick: (uid: string, title: string) => void;
	onViewDetails: (uid: string) => void;
}> = ({jobPosition, onApplyClick, onViewDetails}) => (
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
		<CardContent sx={{p: 0}}>
			<Typography variant="h6" sx={{mb: 1, fontSize: {xs: '1.1rem', sm: '1.25rem'}}}>
				{jobPosition.title}
			</Typography>

			<Box sx={{display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap'}}>
				<Chip
					label={jobPosition.status}
					color={jobPosition.status === 'OPEN' ? 'success' : jobPosition.status === 'CLOSED' ? 'default' : 'warning'}
					size="small"
					sx={{fontSize: '0.85rem'}}
				/>
				<Chip
					label={`${jobPosition.stages?.length || 0} Stages`}
					variant="outlined"
					size="small"
					sx={{fontSize: '0.85rem'}}
				/>
			</Box>

			{jobPosition.companyName && (
				<Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
					Company: {jobPosition.companyName}
				</Typography>
			)}

			{jobPosition.createdBy && (
				<Typography variant="caption" color="textSecondary" sx={{display: 'block', mb: 2}}>
					Posted by {jobPosition.createdBy.name}
				</Typography>
			)}

			<Box
				sx={{
					display: 'flex',
					gap: 1,
					mt: 2,
					flexWrap: 'wrap',
				}}
			>
				<Button
					fullWidth
					size="small"
					variant="outlined"
					onClick={() => onViewDetails(jobPosition.uid)}
					sx={{
						minHeight: 44,
						fontSize: {xs: '0.9rem', sm: '1rem'},
						flex: {xs: '1 1 auto', sm: '0 1 auto'},
					}}
				>
					View Details
				</Button>
				<Button
					fullWidth
					size="small"
					variant="contained"
					onClick={() => onApplyClick(jobPosition.uid, jobPosition.title)}
					disabled={jobPosition.status !== 'OPEN'}
					sx={{
						minHeight: 44,
						fontSize: {xs: '0.9rem', sm: '1rem'},
						flex: {xs: '1 1 auto', sm: '0 1 auto'},
					}}
				>
					Apply
				</Button>
			</Box>
		</CardContent>
	</Card>
);

const JobPositionsList: React.FC<JobPositionsListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();
	const [applyDialogOpen, setApplyDialogOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState<{uid: string; title: string} | null>(null);

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data;
	const meta = data?.meta;

	const handleApplyClick = (jobUid: string, jobTitle: string) => {
		setSelectedJob({uid: jobUid, title: jobTitle});
		setApplyDialogOpen(true);
	};

	const handleCloseApplyDialog = () => {
		setApplyDialogOpen(false);
		setSelectedJob(null);
	};

	const handleViewDetails = (uid: string) => {
		navigate(`/careers/${uid}`);
	};

	// Only show loading spinner on INITIAL load, not on refetch
	if (isLoading && !data) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: {xs: 2, sm: 4}}}>
				{isMobile ? (
					<Box sx={{width: '100%'}}>
						{[1, 2, 3].map((i) => (
							<JobPositionCardSkeleton key={i} />
						))}
					</Box>
				) : (
					<CircularProgress />
				)}
			</Box>
		);
	}

	if (error && !data) {
		return (
			<Box sx={{p: {xs: 2, sm: 4}}}>
				<Typography color="error" sx={{fontSize: {xs: '0.95rem', sm: '1rem'}}}>
					Error loading job positions. Please try again.
				</Typography>
			</Box>
		);
	}

	// Mobile view (card layout)
	if (isMobile) {
		return (
			<>
				{jobPositions && jobPositions.length > 0 ? (
					<Box sx={{width: '100%'}}>
						{jobPositions.map((jobPosition) => (
							<JobPositionCardView
								key={jobPosition.uid}
								jobPosition={jobPosition}
								onApplyClick={handleApplyClick}
								onViewDetails={handleViewDetails}
							/>
						))}
					</Box>
				) : (
					<Paper sx={{p: {xs: 2, sm: 4}, textAlign: 'center'}}>
						<Typography variant="body1" color="textSecondary">
							No job positions found.
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

				{selectedJob && (
					<ApplyToJobDialog
						open={applyDialogOpen}
						onClose={handleCloseApplyDialog}
						jobUid={selectedJob.uid}
						jobTitle={selectedJob.title}
					/>
				)}
			</>
		);
	}

	// Desktop view (table layout)
	return (
		<>
			{jobPositions && jobPositions.length > 0 ? (
				<TableContainer component={Paper} sx={{width: '100%', overflowX: 'auto'}}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell sx={{minWidth: 200}}><strong>Job Title</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Company</strong></TableCell>
								<TableCell sx={{minWidth: 100}}><strong>Status</strong></TableCell>
								<TableCell sx={{minWidth: 80}}><strong>Stages</strong></TableCell>
								<TableCell sx={{minWidth: 150}}><strong>Created By</strong></TableCell>
								<TableCell sx={{minWidth: 120}}><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{jobPositions.map((jobPosition) => (
								<TableRow key={jobPosition.uid} hover>
									<TableCell sx={{maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
										{jobPosition.title}
									</TableCell>
									<TableCell>{jobPosition.companyName || 'N/A'}</TableCell>
									<TableCell>
										<Chip
											label={jobPosition.status}
											color={jobPosition.status === 'OPEN' ? 'success' : jobPosition.status === 'CLOSED' ? 'default' : 'warning'}
											size="small"
										/>
									</TableCell>
									<TableCell>{jobPosition.stages?.length || 0}</TableCell>
									<TableCell sx={{maxWidth: 180}}>
										{jobPosition.createdBy ? (
											<>
												<Typography variant="body2" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
													{jobPosition.createdBy.name}
												</Typography>
												<Typography variant="caption" color="textSecondary" sx={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block'}}>
													{jobPosition.createdBy.email}
												</Typography>
											</>
										) : (
											'N/A'
										)}
									</TableCell>
									<TableCell>
										<Box sx={{display: 'flex', gap: 1}}>
											<Button
												size="small"
												variant="outlined"
												onClick={() => handleViewDetails(jobPosition.uid)}
											>
												View Details
											</Button>
											<Button
												size="small"
												variant="contained"
												onClick={() => handleApplyClick(jobPosition.uid, jobPosition.title)}
												disabled={jobPosition.status !== 'OPEN'}
											>
												Apply
											</Button>
										</Box>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			) : (
				<Paper sx={{p: 4, textAlign: 'center'}}>
					<Typography variant="body1" color="textSecondary">
						No job positions found.
					</Typography>
				</Paper>
			)}

			{meta && <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />}

			{selectedJob && (
				<ApplyToJobDialog
					open={applyDialogOpen}
					onClose={handleCloseApplyDialog}
					jobUid={selectedJob.uid}
					jobTitle={selectedJob.title}
				/>
			)}
		</>
	);
};

export default JobPositionsList;
