import React from 'react';
import {Box, Grid, CircularProgress, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import MetricCard from './MetricCard';
import ConversionFunnel from './ConversionFunnel';
// import TimeToHireChart from './TimeToHireChart'; // TODO: File doesn't exist - needs to be created
import HiringTrendsChart from './HiringTrendsChart';
import SourceDistributionChart from './SourceDistributionChart';
import {
	OverviewMetricsDto,
	PipelineFunnelDto,
	TimeToHireDto,
	MetricCardData,
	MetricTrend,
	StageConversionRate,
} from '../../types/analytics';
import {
	useAnalyticsPipeline,
	useAnalyticsTimeToHire,
	useAnalyticsSources,
	DateRange,
} from '../../hooks/api/useAnalytics';

interface AnalyticsDashboardProps {
	data: OverviewMetricsDto | null | undefined;
	isLoading?: boolean;
	dateRange?: DateRange;
}

/**
 * AnalyticsDashboard Component
 *
 * Main analytics dashboard layout displaying all analytics components.
 * Shows overview metrics, charts, and insights.
 * Now uses real backend data via React Query hooks.
 */
const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
	data,
	isLoading = false,
	dateRange,
}) => {
	const {t} = useTranslation();

	// Fetch additional analytics data
	const { data: pipelineData } = useAnalyticsPipeline(dateRange);
	const { data: timeToHireData } = useAnalyticsTimeToHire(dateRange);
	const { data: sourcesData } = useAnalyticsSources(dateRange);

	// Convert backend conversion metrics to legacy format for ConversionFunnel component
	const convertToLegacyConversionRates = (
		data: OverviewMetricsDto | null | undefined
	): StageConversionRate[] => {
		if (!data) return [];

		const { conversionMetrics } = data;

		return [
			{
				fromStage: 'Application',
				toStage: 'Screening',
				rate: conversionMetrics.applicationToScreeningRate,
				count: 0, // Not available in new API
			},
			{
				fromStage: 'Screening',
				toStage: 'Interview',
				rate: conversionMetrics.screeningToInterviewRate,
				count: 0,
			},
			{
				fromStage: 'Interview',
				toStage: 'Offer',
				rate: conversionMetrics.interviewToOfferRate,
				count: 0,
			},
			{
				fromStage: 'Offer',
				toStage: 'Hired',
				rate: conversionMetrics.offerToHiredRate,
				count: 0,
			},
		];
	};

	// Convert sources data to legacy format for SourceDistributionChart
	const convertToLegacySourceDistribution = (
		sources: typeof sourcesData
	) => {
		if (!sources || sources.length === 0) return [];

		const totalCount = sources.reduce((sum, s) => sum + s.count, 0);
		return sources.map((s) => ({
			source: s.source,
			count: s.count,
			percentage: totalCount > 0 ? Math.round((s.count / totalCount) * 100) : 0,
		}));
	};

	// Convert time-to-hire trend to legacy format for HiringTrendsChart
	const convertToLegacyHiringTrends = (
		timeToHire: TimeToHireDto | null | undefined
	) => {
		if (!timeToHire || !timeToHire.trend) return [];

		return timeToHire.trend.map((t) => ({
			month: t.period,
			count: t.hiresCount,
			target: undefined,
		}));
	};

	// Prepare metric cards data from backend OverviewMetricsDto
	const metricCards: MetricCardData[] = data
		? [
				{
					title: t('analytics.total_applications'),
					value: data.volumeMetrics.totalApplicationsThisMonth,
					icon: <PeopleIcon fontSize="large" />,
					color: 'primary.main',
				},
				{
					title: t('analytics.active_processes'),
					value: data.volumeMetrics.totalActiveProcesses,
					icon: <WorkIcon fontSize="large" />,
					color: 'info.main',
				},
				{
					title: t('analytics.hired_this_month'),
					value: data.volumeMetrics.totalHiredThisMonth,
					icon: <CheckCircleIcon fontSize="large" />,
					color: 'success.main',
				},
				{
					title: t('analytics.avg_time_to_hire'),
					value: Math.round(data.timeMetrics.averageTimeToHire),
					unit: t('analytics.days'),
					icon: <TimerIcon fontSize="large" />,
					color: 'secondary.main',
				},
				{
					title: t('analytics.time_to_first_interview'),
					value: Math.round(data.timeMetrics.timeToFirstInterview),
					unit: t('analytics.days'),
					icon: <AssignmentIcon fontSize="large" />,
					color: 'warning.main',
				},
		  ]
		: [];

	// Loading state
	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<CircularProgress />
			</Box>
		);
	}

	// No data state
	if (!data) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<Typography variant="body1" color="text.secondary">
					{t('analytics.no_data')}
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Overview Metrics */}
			<Box mb={4}>
				<Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
					{t('analytics.overview')}
				</Typography>
				<Grid spacing={3}>
					{metricCards.map((card, index) => (
						<Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
							<MetricCard data={card} />
						</Grid>
					))}
				</Grid>
			</Box>

			{/* Hiring Metrics */}
			<Box mb={4}>
				<Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
					{t('analytics.hiring_metrics')}
				</Typography>
				<Grid container spacing={3}>
					{/* Conversion Funnel */}
					<Grid item xs={12} lg={6}>
						<ConversionFunnel data={convertToLegacyConversionRates(data)} />
					</Grid>

					{/* Time to Hire Chart */}
					{/* TODO: TimeToHireChart component needs to be created */}
					{/* <Grid item xs={12} lg={6}>
            <TimeToHireChart data={timeToHireData} />
          </Grid> */}

					{/* Hiring Trends */}
					{timeToHireData && (
						<Grid item xs={12}>
							<HiringTrendsChart data={convertToLegacyHiringTrends(timeToHireData)} />
						</Grid>
					)}
				</Grid>
			</Box>

			{/* Candidate Metrics */}
			{sourcesData && sourcesData.length > 0 && (
				<Box mb={4}>
					<Typography variant="h5" gutterBottom fontWeight={600} mb={3}>
						{t('analytics.candidate_metrics')}
					</Typography>
					<Grid container spacing={3}>
						{/* Source Distribution */}
						<Grid item xs={12} md={6}>
							<SourceDistributionChart
								data={convertToLegacySourceDistribution(sourcesData)}
							/>
						</Grid>
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default AnalyticsDashboard;
