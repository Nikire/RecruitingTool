import {Box, CircularProgress, Typography, Card, CardContent, CardActionArea, Chip, Grid} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import Pagination from '../pagination/Pagination';
import {useNavigate} from 'react-router-dom';

interface JobPositionsListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const JobPositionsList: React.FC<JobPositionsListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
}) => {
	const navigate = useNavigate();

	const {data, isLoading, error} = useListJobPositions({
		page,
		limit,
		search,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	const jobPositions = data?.data;
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
					Error loading job positions. Please try again.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{jobPositions && jobPositions.length > 0 ? (
				<Grid container spacing={3}>
					{jobPositions.map((jobPosition) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={jobPosition.uid}>
							<Card
								elevation={2}
								sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									'&:hover': {
										elevation: 4,
										transform: 'translateY(-4px)',
										transition: 'all 0.2s ease-in-out',
									},
								}}
							>
								<CardActionArea
									onClick={() => navigate(`/job-positions/${jobPosition.uid}`)}
									sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}
								>
									<CardContent sx={{flexGrow: 1, width: '100%'}}>
										<Box sx={{display: 'flex', alignItems: 'flex-start', mb: 2}}>
											<WorkIcon sx={{mr: 1, color: 'primary.main', fontSize: 28}} />
											<Box sx={{flex: 1}}>
												<Typography variant="h6" component="div" gutterBottom sx={{
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
												}}>
													{jobPosition.title}
												</Typography>
												<Chip
													label={jobPosition.status}
													color={jobPosition.status === 'OPEN' ? 'success' : 'default'}
													size="small"
												/>
											</Box>
										</Box>

										<Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
											<BusinessIcon sx={{fontSize: 18, mr: 1, color: 'text.secondary'}} />
											<Typography variant="body2" color="text.secondary">
												{jobPosition.companyName || 'Company not specified'}
											</Typography>
										</Box>

										<Box sx={{mt: 2, pt: 2, borderTop: 1, borderColor: 'divider'}}>
											<Typography variant="caption" color="text.secondary" display="block">
												{jobPosition.stages?.length || 0} stage{jobPosition.stages?.length !== 1 ? 's' : ''} • {jobPosition.hiringProcesses?.length || 0} active process{jobPosition.hiringProcesses?.length !== 1 ? 'es' : ''}
											</Typography>
										</Box>
									</CardContent>
								</CardActionArea>
							</Card>
						</Grid>
					))}
				</Grid>
			) : (
				<Box sx={{textAlign: 'center', py: 8}}>
					<WorkIcon sx={{fontSize: 64, color: 'text.disabled', mb: 2}} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No job positions available
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Check back later for new opportunities
					</Typography>
				</Box>
			)}

			{meta && (
				<Box sx={{mt: 4}}>
					<Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
				</Box>
			)}
		</>
	);
};

export default JobPositionsList;
