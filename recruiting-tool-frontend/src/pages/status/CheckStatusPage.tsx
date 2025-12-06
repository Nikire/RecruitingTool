import { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	TextField,
	Button,
	Card,
	CardContent,
	Alert,
	CircularProgress,
	Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getStatusByAccessCode, PublicStatusResponse } from '../../api/hiringProcess';

const CheckStatusPage = () => {
	const { t } = useTranslation();
	const [accessCode, setAccessCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [status, setStatus] = useState<PublicStatusResponse | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!accessCode.trim()) {
			setError(t('check_status.access_code_required'));
			return;
		}

		setLoading(true);
		setError('');
		setStatus(null);

		try {
			const result = await getStatusByAccessCode(accessCode.trim().toUpperCase());
			setStatus(result);
		} catch (err: any) {
			if (err.response?.status === 404) {
				setError(t('check_status.invalid_code'));
			} else if (err.response?.status === 429) {
				setError(t('check_status.too_many_requests'));
			} else {
				setError(t('check_status.error'));
			}
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'OPEN':
				return 'primary';
			case 'IN_PROGRESS':
				return 'info';
			case 'CLOSED':
				return 'success';
			case 'CANCELLED':
				return 'warning';
			case 'REJECTED':
				return 'error';
			default:
				return 'default';
		}
	};

	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			<Box textAlign="center" mb={4}>
				<Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
					{t('check_status.title')}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{t('check_status.subtitle')}
				</Typography>
			</Box>

			<Card sx={{ mb: 4 }}>
				<CardContent sx={{ p: 4 }}>
					<form onSubmit={handleSubmit}>
						<TextField
							fullWidth
							label={t('check_status.access_code_label')}
							placeholder={t('check_status.access_code_placeholder')}
							value={accessCode}
							onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
							disabled={loading}
							error={!!error && !loading}
							helperText={error && !loading ? error : t('check_status.access_code_helper')}
							InputProps={{
								inputProps: {
									maxLength: 8,
									style: { textTransform: 'uppercase' },
								},
							}}
							sx={{ mb: 3 }}
						/>

						<Button
							type="submit"
							variant="contained"
							size="large"
							fullWidth
							disabled={loading}
							startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
						>
							{loading ? t('check_status.checking') : t('check_status.check_button')}
						</Button>
					</form>
				</CardContent>
			</Card>

			{status && (
				<Card>
					<CardContent sx={{ p: 4 }}>
						<Box display="flex" alignItems="center" mb={3}>
							<CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
							<Typography variant="h5" component="h2" fontWeight="bold">
								{t('check_status.status_found')}
							</Typography>
						</Box>

						<Box sx={{ '& > *': { mb: 2 } }}>
							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									{t('check_status.candidate')}
								</Typography>
								<Typography variant="h6">{status.candidateName}</Typography>
							</Box>

							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									{t('check_status.position')}
								</Typography>
								<Typography variant="h6">{status.positionTitle}</Typography>
							</Box>

							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									{t('check_status.company')}
								</Typography>
								<Typography variant="h6">{status.companyName}</Typography>
							</Box>

							{status.currentStage && (
								<Box>
									<Typography variant="caption" color="text.secondary" display="block">
										{t('check_status.current_stage')}
									</Typography>
									<Typography variant="h6">{status.currentStage}</Typography>
								</Box>
							)}

							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									{t('check_status.status_label')}
								</Typography>
								<Chip
									label={t(`status.${status.status.toLowerCase()}`)}
									color={getStatusColor(status.status)}
									sx={{ mt: 1 }}
								/>
							</Box>

							<Box>
								<Typography variant="caption" color="text.secondary" display="block">
									{t('check_status.last_updated')}
								</Typography>
								<Typography variant="body2">
									{new Date(status.lastUpdated).toLocaleDateString()}
								</Typography>
							</Box>
						</Box>

						<Alert severity="info" sx={{ mt: 3 }}>
							{t('check_status.privacy_notice')}
						</Alert>
					</CardContent>
				</Card>
			)}
		</Container>
	);
};

export default CheckStatusPage;
