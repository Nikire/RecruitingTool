import React from 'react';
import {
	Card,
	CardContent,
	Typography,
	Box,
	Chip,
	Button,
	Avatar,
	Stack,
	alpha,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {useNavigate} from 'react-router-dom';

interface CompactJobCardProps {
	jobPosition: {
		uid: string;
		title: string;
		companyName?: string;
		companyLogoUrl?: string;
		status: string;
		createdAt: string;
		description?: string;
		// New fields from backend
		city?: string;
		country?: string;
		jobType?: string;
		workLocation?: string;
		experienceLevel?: string;
		salaryMin?: number;
		salaryMax?: number;
		salaryCurrency?: string;
		showSalary?: boolean;
		tags?: string[];
		isHighlighted?: boolean;
	};
	onApplyClick: (uid: string, title: string) => void;
}

const CompactJobCard: React.FC<CompactJobCardProps> = React.memo(({jobPosition, onApplyClick}) => {
	const {t} = useTranslation();
	const navigate = useNavigate();

	const handleCardClick = () => {
		navigate(`/careers/${jobPosition.uid}`);
	};

	// Calculate days since posted
	const daysSincePosted = Math.floor(
		(Date.now() - new Date(jobPosition.createdAt).getTime()) / (1000 * 60 * 60 * 24)
	);

	const getPostedText = () => {
		if (daysSincePosted === 0) {
			return t('careers.posted_today');
		} else if (daysSincePosted === 1) {
			return t('careers.posted_yesterday');
		} else if (daysSincePosted < 7) {
			return t('careers.posted_days_ago', {days: daysSincePosted});
		} else if (daysSincePosted < 30) {
			const weeks = Math.floor(daysSincePosted / 7);
			return t('careers.posted_weeks_ago', {weeks});
		} else {
			const months = Math.floor(daysSincePosted / 30);
			return t('careers.posted_months_ago', {months});
		}
	};

	// Get company initials for avatar fallback
	const getCompanyInitials = (name: string | undefined) => {
		if (!name) return '?';
		return name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	// Format location
	const getLocationText = () => {
		const parts = [];
		if (jobPosition.city) parts.push(jobPosition.city);
		if (jobPosition.country) parts.push(jobPosition.country);
		return parts.join(', ') || t('careersJob.location_not_specified');
	};

	// Format salary
	const getSalaryText = () => {
		if (!jobPosition.showSalary || (!jobPosition.salaryMin && !jobPosition.salaryMax)) {
			return null;
		}
		const currency = jobPosition.salaryCurrency || '$';
		const min = jobPosition.salaryMin
			? `${currency}${jobPosition.salaryMin.toLocaleString()}`
			: '';
		const max = jobPosition.salaryMax
			? `${currency}${jobPosition.salaryMax.toLocaleString()}`
			: '';

		if (min && max) {
			return `${min} - ${max}`;
		} else if (min) {
			return `${t('careersJob.from')} ${min}`;
		} else if (max) {
			return `${t('careersJob.up_to')} ${max}`;
		}
		return null;
	};

	// Get work location type badge color
	const getWorkLocationColor = () => {
		switch (jobPosition.workLocation) {
			case 'REMOTE':
				return 'success';
			case 'HYBRID':
				return 'info';
			case 'ON_SITE':
				return 'default';
			default:
				return 'default';
		}
	};

	// Get work location label
	const getWorkLocationLabel = () => {
		switch (jobPosition.workLocation) {
			case 'REMOTE':
				return t('careersFilters.remote');
			case 'HYBRID':
				return t('careersFilters.hybrid');
			case 'ON_SITE':
				return t('careersFilters.onsite');
			default:
				return t('careersJob.location_not_specified');
		}
	};

	// Get job type label
	const getJobTypeLabel = () => {
		switch (jobPosition.jobType) {
			case 'FULL_TIME':
				return t('careersFilters.full_time');
			case 'PART_TIME':
				return t('careersFilters.part_time');
			case 'CONTRACT':
				return t('careersFilters.contract');
			case 'INTERNSHIP':
				return t('careersFilters.internship');
			case 'TEMPORARY':
				return t('careersFilters.temporary');
			default:
				return t('careersFilters.full_time');
		}
	};

	const salaryText = getSalaryText();

	return (
		<Card
			sx={{
				height: '100%',
				width: 320,
				maxWidth: '100%',
				mx: 'auto',
				display: 'flex',
				flexDirection: 'column',
				transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				cursor: 'pointer',
				position: 'relative',
				overflow: 'visible',
				border: jobPosition.isHighlighted ? 2 : 1,
				borderColor: jobPosition.isHighlighted ? 'primary.main' : 'divider',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: (theme) =>
						`0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
					'& .apply-button': {
						transform: 'scale(1.02)',
					},
				},
			}}
			onClick={handleCardClick}
		>
			{/* New/Highlighted badge */}
			{(jobPosition.status === 'OPEN' && daysSincePosted < 7) ||
			jobPosition.isHighlighted ? (
				<Chip
					label={
						jobPosition.isHighlighted
							? t('careersJob.featured')
							: t('careers.new_position')
					}
					color={jobPosition.isHighlighted ? 'primary' : 'success'}
					size="small"
					sx={{
						position: 'absolute',
						top: -10,
						right: 16,
						fontWeight: 600,
						boxShadow: 2,
					}}
				/>
			) : null}

			<CardContent sx={{p: 2.5, flex: 1, display: 'flex', flexDirection: 'column'}}>
				{/* Company logo and name */}
				<Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, mb: 2}}>
					{jobPosition.companyLogoUrl ? (
						<Avatar
							src={jobPosition.companyLogoUrl}
							alt={jobPosition.companyName}
							sx={{width: 40, height: 40, boxShadow: 1}}
						/>
					) : (
						<Avatar
							sx={{
								width: 40,
								height: 40,
								bgcolor: 'primary.main',
								fontSize: '1rem',
								fontWeight: 700,
								boxShadow: 1,
							}}
						>
							{getCompanyInitials(jobPosition.companyName)}
						</Avatar>
					)}
					<Box sx={{flex: 1, minWidth: 0}}>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{
								fontWeight: 600,
								fontSize: '0.75rem',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{jobPosition.companyName || t('careers.company_name')}
						</Typography>
					</Box>
				</Box>

				{/* Job title */}
				<Typography
					variant="h6"
					sx={{
						fontWeight: 700,
						mb: 1.5,
						fontSize: '1.1rem',
						lineHeight: 1.3,
						color: 'text.primary',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						minHeight: '2.6em',
					}}
				>
					{jobPosition.title}
				</Typography>

				{/* Location and Work Type */}
				<Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mb={1.5}>
					<Chip
						icon={<LocationOnIcon sx={{fontSize: 14}} />}
						label={getLocationText()}
						size="small"
						sx={{
							fontSize: '0.7rem',
							height: 24,
							'& .MuiChip-icon': {color: 'text.secondary'},
						}}
					/>
					<Chip
						label={getWorkLocationLabel()}
						size="small"
						color={getWorkLocationColor()}
						sx={{fontSize: '0.7rem', height: 24}}
					/>
				</Stack>

				{/* Job Type */}
				<Box sx={{mb: 1.5}}>
					<Chip
						icon={<WorkIcon sx={{fontSize: 14}} />}
						label={getJobTypeLabel()}
						size="small"
						variant="outlined"
						sx={{
							fontSize: '0.7rem',
							height: 24,
							borderColor: 'divider',
							'& .MuiChip-icon': {color: 'text.secondary'},
						}}
					/>
				</Box>

				{/* Salary (if shown) */}
				{salaryText && (
					<Box sx={{mb: 1.5}}>
						<Chip
							icon={<AttachMoneyIcon sx={{fontSize: 14}} />}
							label={salaryText}
							size="small"
							color="success"
							variant="outlined"
							sx={{fontSize: '0.7rem', height: 24}}
						/>
					</Box>
				)}

				{/* Tags (first 3) */}
				{jobPosition.tags && jobPosition.tags.length > 0 && (
					<Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} mb={1.5}>
						{jobPosition.tags.slice(0, 3).map((tag, index) => (
							<Chip
								key={index}
								label={tag}
								size="small"
								variant="outlined"
								sx={{
									fontSize: '0.65rem',
									height: 20,
									borderColor: 'divider',
									color: 'text.secondary',
								}}
							/>
						))}
					</Stack>
				)}

				{/* Posted date */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						mb: 2,
						color: 'text.secondary',
					}}
				>
					<AccessTimeIcon sx={{fontSize: 14}} />
					<Typography variant="caption" sx={{fontWeight: 500, fontSize: '0.7rem'}}>
						{getPostedText()}
					</Typography>
				</Box>

				{/* Spacer to push button to bottom */}
				<Box sx={{flex: 1}} />

				{/* Apply button */}
				<Button
					className="apply-button"
					fullWidth
					variant="contained"
					size="medium"
					onClick={(e) => {
						e.stopPropagation();
						onApplyClick(jobPosition.uid, jobPosition.title);
					}}
					disabled={jobPosition.status !== 'OPEN'}
					sx={{
						py: 1,
						fontWeight: 600,
						fontSize: '0.875rem',
						transition: 'all 0.2s',
						boxShadow: 1,
						'&:hover': {
							boxShadow: 2,
						},
					}}
				>
					{t('careers.apply_now')}
				</Button>
			</CardContent>
		</Card>
	);
});

CompactJobCard.displayName = 'CompactJobCard';

export default CompactJobCard;
