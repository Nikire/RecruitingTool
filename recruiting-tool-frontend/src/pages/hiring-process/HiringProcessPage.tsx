// @ts-nocheck
import {Divider, Typography, Box, Chip, Paper, CircularProgress, Button} from '@mui/material';
import {useParams, useNavigate} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StagesTimeline from '../../components/stages/StagesTimeline/StagesTimeline';
import {useHiringProcesses} from '../../hooks/api/useHiringProcess';
import {HiringProcess, HiringProcessStatus} from '../../types/hiringProcess.types';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';

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
	const {user} = useUserAtom();
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

			<Typography variant="h5" sx={{mb: 3, fontWeight: 500}}>
				Recruitment Stages
			</Typography>

			{hiringProcess.stages && <StagesTimeline stages={hiringProcess.stages} />}
		</Box>
	);
};

export default HiringProcessPage;
