import {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
	Box,
	Typography,
	Button,
	Paper,
	CircularProgress,
	Chip,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Card,
	CardContent,
	Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {usePublicJobPosition} from '../../hooks/api/useJobPositions';
import {JobPosition} from '../../types/jobPosition.types';
import StatusLabel from '../../components/StatusLabel';
import {HiringProcessStatus} from '../../types/hiringProcess.types';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {canManageResources} from '../../utils/permissions';
import {ApplyToJobDialog} from '../../components/dialogs/ApplyToJobDialog';
import { useTranslation } from 'react-i18next';

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

const JobPositionDetailPage: React.FC = () => {
	const { t } = useTranslation();
	const {uid} = useParams<{uid: string}>();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const {data: jobPositionData, isLoading, error} = usePublicJobPosition(uid || '');
	const [statusFilter, setStatusFilter] = useState<HiringProcessStatus | 'ALL'>('ALL');
	const [applyDialogOpen, setApplyDialogOpen] = useState(false);

	const canManage = canManageResources(user);

	const statusOptions: Array<HiringProcessStatus | 'ALL'> = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED', 'REJECTED'];

	if (isLoading) {
		return (
			<Box sx={{display: 'flex', justifyContent: 'center', p: {xs: 2, sm: 3, md: 4}}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !jobPositionData) {
		return (
			<Box sx={{p: {xs: 2, sm: 3, md: 4}}}>
				<Typography color="error">
					{t('job_position_detail.error_loading')}
				</Typography>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/job-positions')}
					sx={{mt: 2}}
				>
					{t('job_position_detail.back_to_positions')}
				</Button>
			</Box>
		);
	}

	const jobPosition = jobPositionData as JobPosition;

	// Filter hiring processes by status
	const filteredHiringProcesses = jobPosition.hiringProcesses?.filter(process =>
		statusFilter === 'ALL' || process.status === statusFilter
	) || [];

	return (
		<Box sx={{p: {xs: 2, sm: 3, md: 4}}}>
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate('/careers')}
				sx={{mb: {xs: 2, sm: 3}}}
			>
				{t('common.back_to_careers')}
			</Button>

			<Paper sx={{p: {xs: 2, sm: 3}, mb: {xs: 2, sm: 3}}}>
				<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: {xs: 'flex-start', sm: 'center'}, mb: 2, flexDirection: {xs: 'column', sm: 'row'}, gap: {xs: 2, sm: 0}}}>
					<Box>
						<Typography variant="h4" sx={{fontSize: {xs: '1.75rem', sm: '2.125rem'}}}>{jobPosition.title}</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							{canManage ? t('job_position_detail.hiring_overview') : jobPosition.description || t('job_position_detail.job_posting')}
						</Typography>
					</Box>
					<Box sx={{display: 'flex', gap: 2, alignItems: 'center', width: {xs: '100%', sm: 'auto'}}}>
						<StatusLabel status={jobPosition.status} />
						{jobPosition.status === 'OPEN' && (
							<Button
								variant="contained"
								onClick={() => setApplyDialogOpen(true)}
								sx={{flex: {xs: 1, sm: 'none'}, minHeight: 44}}
							>
								{t('job_position_detail.apply_now')}
							</Button>
						)}
					</Box>
				</Box>

				<Divider sx={{my: 2}} />

				<Box sx={{display: 'flex', gap: {xs: 2, sm: 4}, flexDirection: {xs: 'column', sm: 'row'}, flexWrap: {sm: 'wrap'}}}>
					<Box>
						<Typography variant="body2" color="textSecondary">
							{t('job_position_detail.company')}
						</Typography>
						<Typography variant="body1" sx={{fontWeight: 500}}>
							{jobPosition.companyName || t('common.n_a')}
						</Typography>
					</Box>
					{jobPosition.createdAt && (
						<Box>
							<Typography variant="body2" color="textSecondary">
								{t('careers.posted_date')}
							</Typography>
							<Typography variant="body1">
								{new Date(jobPosition.createdAt).toLocaleDateString()}
							</Typography>
						</Box>
					)}
					{canManage && jobPosition.createdBy && (
						<Box>
							<Typography variant="body2" color="textSecondary">
								{t('job_position_detail.created_by_hr')}
							</Typography>
							<Typography variant="body1">
								{jobPosition.createdBy.name}
							</Typography>
							{jobPosition.createdBy.email && (
								<Typography variant="caption" color="textSecondary">
									{jobPosition.createdBy.email}
								</Typography>
							)}
						</Box>
					)}
					<Box>
						<Typography variant="body2" color="textSecondary">
							{t('job_position_detail.total_stages')}
						</Typography>
						<Typography variant="body1">
							{jobPosition.stages?.length || 0}
						</Typography>
					</Box>
					{canManage && (
						<Box>
							<Typography variant="body2" color="textSecondary">
								{t('job_position_detail.active_processes')}
							</Typography>
							<Typography variant="body1">
								{jobPosition.hiringProcesses?.length || 0}
							</Typography>
						</Box>
					)}
				</Box>
			</Paper>

			{canManage && (
				<>
					<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: {xs: 2, sm: 3}}}>
						<Typography variant="h5" sx={{fontSize: {xs: '1.25rem', sm: '1.5rem'}}}>
							{t('job_position_detail.hiring_processes_count', {
								filtered: filteredHiringProcesses.length,
								total: jobPosition.hiringProcesses?.length || 0
							})}
						</Typography>
					</Box>

					<Box sx={{mb: {xs: 2, sm: 3}, display: 'flex', gap: 1, flexWrap: 'wrap'}}>
						{statusOptions.map((status) => {
							const count = status === 'ALL'
								? jobPosition.hiringProcesses?.length || 0
								: jobPosition.hiringProcesses?.filter(p => p.status === status).length || 0;

							return (
								<Chip
									key={status}
									label={`${status.replace(/_/g, ' ')} (${count})`}
									onClick={() => setStatusFilter(status)}
									color={statusFilter === status ? 'primary' : 'default'}
									variant={statusFilter === status ? 'filled' : 'outlined'}
									clickable
								/>
							);
						})}
					</Box>

					{filteredHiringProcesses.length > 0 ? (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell><strong>{t('job_position_detail.table_title')}</strong></TableCell>
										<TableCell><strong>{t('job_position_detail.table_status')}</strong></TableCell>
										<TableCell><strong>{t('job_position_detail.table_candidate')}</strong></TableCell>
										<TableCell><strong>{t('job_position_detail.table_actions')}</strong></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredHiringProcesses.map((process) => (
										<TableRow key={process.uid} hover sx={{backgroundColor: !process.candidate ? 'rgba(255, 193, 7, 0.05)' : 'inherit'}}>
											<TableCell>{process.title}</TableCell>
											<TableCell>
												<Chip
													label={process.status}
													color={getStatusColor(process.status)}
													size="small"
												/>
											</TableCell>
											<TableCell>
												{process.candidate ? (
													<>
														{process.candidate.name}
														<br />
														<Typography variant="caption" color="textSecondary">
															{process.candidate.email}
														</Typography>
													</>
												) : (
													<Typography variant="body2" color="error" sx={{fontWeight: 500}}>
														{t('hiring_processes.no_candidate')}
													</Typography>
												)}
											</TableCell>
											<TableCell>
												<Button
													size="small"
													variant="outlined"
													onClick={() => navigate(`/hiring-process/${process.uid}`)}
												>
													{t('job_positions.view_details')}
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Paper sx={{p: {xs: 2, sm: 4}, textAlign: 'center'}}>
							<Typography variant="body1" color="textSecondary">
								{statusFilter === 'ALL'
									? t('job_position_detail.no_processes')
									: t('job_position_detail.no_processes_with_status', { status: statusFilter.replace(/_/g, ' ') })}
							</Typography>
						</Paper>
					)}
				</>
			)}

			{/* Hiring Stages - visible to everyone */}
			<Typography variant="h5" sx={{mb: {xs: 1.5, sm: 2}, mt: {xs: 3, sm: 5}, fontSize: {xs: '1.25rem', sm: '1.5rem'}}}>
				{t('job_position_detail.stage_template')}
			</Typography>
			<Card sx={{mb: {xs: 2, sm: 3}}}>
				<CardContent sx={{p: {xs: 2, sm: 3}}}>
					{jobPosition.stages && jobPosition.stages.length > 0 ? (
						<Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
							{jobPosition.stages
								.sort((a, b) => a.position - b.position)
								.map((stage, index) => (
									<Box key={stage.uid} sx={{display: 'flex', alignItems: 'center', gap: 2}}>
										<Chip label={index + 1} size="small" color="primary" />
										<Box sx={{flex: 1}}>
											<Typography variant="body1" fontWeight="bold">
												{stage.title}
											</Typography>
											<Typography variant="body2" color="textSecondary">
												{stage.description}
											</Typography>
											<Typography variant="caption" color="textSecondary">
												{t('job_position_detail.stage_type')}: {stage.type.replace(/_/g, ' ')}
											</Typography>
										</Box>
									</Box>
								))}
						</Box>
					) : (
						<Typography color="textSecondary">
							{t('job_position_detail.no_stages')}
						</Typography>
					)}
				</CardContent>
			</Card>

			{/* Custom Questions - only visible to HR/Admin */}
			{canManage && (
				<>
					<Typography variant="h5" sx={{mb: {xs: 1.5, sm: 2}, mt: {xs: 3, sm: 4}, fontSize: {xs: '1.25rem', sm: '1.5rem'}}}>
						{t('job_position_detail.custom_questions')}
					</Typography>
					<Card sx={{mb: {xs: 2, sm: 3}}}>
						<CardContent sx={{p: {xs: 2, sm: 3}}}>
							{jobPosition.customQuestions && jobPosition.customQuestions.length > 0 ? (
								<Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
									{jobPosition.customQuestions.map((question, index) => (
										<Box key={question.id} sx={{display: 'flex', alignItems: 'flex-start', gap: 2}}>
											<Chip label={index + 1} size="small" color="secondary" />
											<Box sx={{flex: 1}}>
												<Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
													<Typography variant="body1" fontWeight="bold">
														{question.text}
													</Typography>
													{question.required && (
														<Chip label={t('custom_questions.required_chip')} size="small" color="primary" variant="outlined" />
													)}
												</Box>
												<Typography variant="caption" color="textSecondary" display="block" sx={{mb: 1}}>
													{t('custom_questions.type_label', {type: question.type.replace(/_/g, ' ')})}
												</Typography>
												{question.options && question.options.length > 0 && (
													<Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
														{question.options.map((option, optIndex) => (
															<Chip key={optIndex} label={option} size="small" variant="outlined" />
														))}
													</Box>
												)}
											</Box>
										</Box>
									))}
								</Box>
							) : (
								<Alert severity="info">
									<Typography variant="body2">
										{t('job_position_detail.no_custom_questions')}
									</Typography>
								</Alert>
							)}
						</CardContent>
					</Card>
				</>
			)}

			{uid && (
				<ApplyToJobDialog
					open={applyDialogOpen}
					onClose={() => setApplyDialogOpen(false)}
					jobUid={uid}
					jobTitle={jobPosition.title}
				/>
			)}
		</Box>
	);
};

export default JobPositionDetailPage;
