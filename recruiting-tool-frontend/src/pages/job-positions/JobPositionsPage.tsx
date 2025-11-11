import {useState} from 'react';
import {Typography, Button, Box} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import {JobPositionsPageWrapper} from './JobPositionsPage.styles';
import JobPositionCard from '../../components/cards/job-position-cards/JobPositionCard';
import CreateJobPositionDialog from '../../components/dialogs/CreateJobPositionDialog';
import ManageStagesDialog from '../../components/dialogs/ManageStagesDialog';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';

const JobPositionsPage: React.FC = () => {
	const [openCreateDialog, setOpenCreateDialog] = useState(false);
	const [selectedJobPosition, setSelectedJobPosition] = useState<JobPosition | null>(null);
	const {user} = useUserAtom();
	const {
		data: jobPositionsData,
		isLoading: isJobPositionsLoading,
		error,
	} = useJobPositions();

	const canManage = canManageResources(user);

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

	const handleManageStages = (jobPosition: JobPosition) => {
		setSelectedJobPosition(jobPosition);
	};

	const handleCloseStagesDialog = () => {
		setSelectedJobPosition(null);
	};

	return (
		<JobPositionsPageWrapper>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
				<Typography variant="h6">
					Open job positions:
				</Typography>
				{canManage && (
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setOpenCreateDialog(true)}
					>
						Create Job Position
					</Button>
				)}
			</Box>
			{jobPositions.map((jp) => (
				<JobPositionCard
					key={jp.uid}
					jobPosition={jp}
					onManageStages={() => handleManageStages(jp)}
					canManageStages={canManage}
				/>
			))}

			<CreateJobPositionDialog
				open={openCreateDialog}
				onClose={() => setOpenCreateDialog(false)}
			/>

			{selectedJobPosition && (
				<ManageStagesDialog
					open={!!selectedJobPosition}
					onClose={handleCloseStagesDialog}
					jobPositionUid={selectedJobPosition.uid}
					jobPositionTitle={selectedJobPosition.title}
					existingStages={selectedJobPosition.stages}
				/>
			)}
		</JobPositionsPageWrapper>
	);
};

export default JobPositionsPage;
