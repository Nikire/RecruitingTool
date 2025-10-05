import {Typography} from '@mui/material';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import JobPositionCard from '../../components/cards/job-position-cards/JobPositionCard';

const JobPositionsPage: React.FC = () => {
	const {
		data: jobPositionsData,
		isLoading: isJobPositionsLoading,
		error,
	} = useJobPositions();

	if (isJobPositionsLoading) {
		return <div>LOADING...</div>;
	}

	if (error) {
		return <div>ERROR...</div>;
	}

	if (!jobPositionsData) {
		return <div>No data found</div>;
	}

	const jobPositions = jobPositionsData as JobPosition[];

	console.log(jobPositions);

	return (
		<JobPositionsPageWrapper>
			<Typography variant="h6" gutterBottom>
				Open job positions:
			</Typography>
			{jobPositions.map((jp) => (
				<JobPositionCard key={jp.uid} jobPosition={jp} />
			))}
		</JobPositionsPageWrapper>
	);
};

export default JobPositionsPage;
