import {Divider, Typography, Box, Chip, Paper, CircularProgress, Button, Alert} from '@mui/material';
import {useParams, useNavigate} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import WarningIcon from '@mui/icons-material/Warning';
import StagesTimeline from '../../components/stages/StagesTimeline/StagesTimeline';
import {useHiringProcesses} from '../../hooks/api/useHiringProcess';
import {HiringProcess, HiringProcessStatus} from '../../types/hiringProcess.types';
import {useState} from 'react';
import StageProgressionDialog from '../../components/dialogs/StageProgressionDialog';

const getStatusColor = (status: HiringProcessStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
	switch (status) {
		case 'OPEN':
			return 'info';
		case 'IN_PROGRESS':
			return 'primary';
		case 'CLOSED':
			return 'success';
		case 'CANCELLED':
			return 'default';
		case 'REJECTED':
			return 'error';
		default:
			return 'default';
	}
};

const HiringProcessPage: React.FC = () => {
	const {uid} = useParams<{uid: string}>();
	const navigate = useNavigate();
	const [stageProgressionOpen, setStageProgressionOpen] = useState(false);
	const {
		data: hiringProcessData,
		isLoading: isHiringProcessLoading,
		error,
	} = useHiringProcesses(uid);

	if (isHiringProcessLoading) {
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
					Error loading hiring process. Please try again.
				</Typography>
			</Box>
		);
	}

	if (!hiringProcessData) {
		return (
			<Box sx={{p: 4}}>
				<Typography>No data found</Typography>
			</Box>
		);
	}

	const hiringProcess = hiringProcessData as HiringProcess;

	return (
		<Box sx={{width: '100%'}}>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate(-1)}
				sx={{mb: 3}}
			>
				Back
			</Button>

			<Paper sx={{p: 4, mb: 4}} elevation={2}>
				<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3}}>
					<Box>
						<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
							Hiring Process
						</Typography>
						<Typography variant="h4" sx={{fontWeight: 500}}>
							{hiringProcess.title}
						</Typography>
					</Box>
					<Chip
						label={hiringProcess.status}
						color={getStatusColor(hiringProcess.status)}
						size="medium"
					/>
				</Box>

				{!hiringProcess.candidate && (
					<Alert severity="warning" icon={<WarningIcon />} sx={{mb: 3}}>
						<Box>
							<Typography variant="subtitle2" sx={{fontWeight: 600, mb: 0.5}}>
								No Candidate Assigned
							</Typography>
							<Typography variant="body2">
								This hiring process does not have a candidate assigned yet. Please assign a candidate or check the hiring process configuration.
							</Typography>
						</Box>
					</Alert>
				)}

				<Divider sx={{my: 3}} />

				<Box sx={{display: 'flex', gap: 8, mb: 3}}>
					{hiringProcess.company && (
						<Box>
							<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
								Company
							</Typography>
							<Typography variant="body1" sx={{fontWeight: 500}}>
								{hiringProcess.company.name}
							</Typography>
						</Box>
					)}
					{hiringProcess.jobPosition?.createdBy && (
						<Box>
							<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
								HR Manager
							</Typography>
							<Typography variant="body1">
								{hiringProcess.jobPosition.createdBy.name}
							</Typography>
							<Typography variant="caption" color="textSecondary">
								{hiringProcess.jobPosition.createdBy.email}
							</Typography>
						</Box>
					)}
				</Box>

				{hiringProcess.candidate && (
					<>
						<Divider sx={{my: 3}} />
						<Box>
							<Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600}}>
								Candidate Information
							</Typography>
							<Box sx={{display: 'flex', gap: 6}}>
								<Box>
									<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
										Name
									</Typography>
									<Typography variant="body1">
										{hiringProcess.candidate.name}
									</Typography>
								</Box>
								<Box>
									<Typography variant="body2" color="textSecondary" sx={{mb: 0.5}}>
										Email
									</Typography>
									<Typography variant="body1">
										{hiringProcess.candidate.email}
									</Typography>
								</Box>
							</Box>
						</Box>
					</>
				)}
			</Paper>

			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h5" sx={{fontWeight: 500}}>
					Recruitment Stages
				</Typography>
				{hiringProcess.status !== 'CLOSED' && (
					<Button
						startIcon={<SkipNextIcon />}
						variant="contained"
						onClick={() => setStageProgressionOpen(true)}
					>
						Progress Stage
					</Button>
				)}
			</Box>

			{hiringProcess.stages && <StagesTimeline stages={hiringProcess.stages} />}

			{uid && (
				<StageProgressionDialog
					open={stageProgressionOpen}
					onClose={() => setStageProgressionOpen(false)}
					hiringProcessUid={uid}
					stages={hiringProcess.stages || []}
					currentStageUid={hiringProcess.stages?.find((s) => s.status === 'CURRENT')?.uid}
				/>
			)}
		</Box>
	);
};

export default HiringProcessPage;
