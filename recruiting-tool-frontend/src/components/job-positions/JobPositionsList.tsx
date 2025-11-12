import {Box, CircularProgress, Typography} from '@mui/material';
import {useListJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import JobPositionCard from '../cards/job-position-cards/JobPositionCard';
import Pagination from '../pagination/Pagination';

interface JobPositionsListProps {
	page: number;
	limit: number;
	search: string;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	onManageStages: (jobPosition: JobPosition) => void;
	canManageStages: boolean;
}

const JobPositionsList: React.FC<JobPositionsListProps> = ({
	page,
	limit,
	search,
	onPageChange,
	onLimitChange,
	onManageStages,
	canManageStages,
}) => {
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
			{jobPositions?.map((jp) => (
				<JobPositionCard
					key={jp.uid}
					jobPosition={jp}
					onManageStages={() => onManageStages(jp)}
					canManageStages={canManageStages}
				/>
			))}

			{meta && (
				<Pagination
					meta={meta}
					onPageChange={onPageChange}
					onLimitChange={onLimitChange}
				/>
			)}
		</>
	);
};

export default JobPositionsList;
