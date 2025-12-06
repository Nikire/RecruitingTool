import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Grid,
	Typography,
	useTheme,
	alpha,
	IconButton,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const LandingPage = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const navigate = useNavigate();

	const features = [
		{
			icon: <TimelineIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.multi_stage_hiring.title'),
			description: t('landing.features.multi_stage_hiring.description'),
			color: theme.palette.primary.main,
		},
		{
			icon: <PeopleIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.candidate_tracking.title'),
			description: t('landing.features.candidate_tracking.description'),
			color: theme.palette.secondary.main,
		},
		{
			icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.ai_screening.title'),
			description: t('landing.features.ai_screening.description'),
			color: theme.palette.success.main,
		},
		{
			icon: <CalendarTodayIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.interview_scheduling.title'),
			description: t('landing.features.interview_scheduling.description'),
			color: theme.palette.info.main,
		},
		{
			icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.analytics.title'),
			description: t('landing.features.analytics.description'),
			color: theme.palette.warning.main,
		},
		{
			icon: <GroupWorkIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.team_collaboration.title'),
			description: t('landing.features.team_collaboration.description'),
			color: theme.palette.error.main,
		},
	];

	const pricingPlans = [
		{
			name: t('landing.pricing.free.name'),
			price: t('landing.pricing.free.price'),
			description: t('landing.pricing.free.description'),
			features: [
				t('landing.pricing.free.features.positions'),
				t('landing.pricing.free.features.candidates'),
				t('landing.pricing.free.features.basic_analytics'),
				t('landing.pricing.free.features.email_support'),
			],
			recommended: false,
			color: theme.palette.grey[400],
		},
		{
			name: t('landing.pricing.professional.name'),
			price: t('landing.pricing.professional.price'),
			description: t('landing.pricing.professional.description'),
			features: [
				t('landing.pricing.professional.features.unlimited_positions'),
				t('landing.pricing.professional.features.unlimited_candidates'),
				t('landing.pricing.professional.features.ai_screening'),
				t('landing.pricing.professional.features.advanced_analytics'),
				t('landing.pricing.professional.features.priority_support'),
				t('landing.pricing.professional.features.custom_branding'),
			],
			recommended: true,
			color: theme.palette.primary.main,
		},
		{
			name: t('landing.pricing.enterprise.name'),
			price: t('landing.pricing.enterprise.price'),
			description: t('landing.pricing.enterprise.description'),
			features: [
				t('landing.pricing.enterprise.features.everything_professional'),
				t('landing.pricing.enterprise.features.dedicated_support'),
				t('landing.pricing.enterprise.features.sso'),
				t('landing.pricing.enterprise.features.api_access'),
				t('landing.pricing.enterprise.features.custom_integrations'),
				t('landing.pricing.enterprise.features.sla'),
			],
			recommended: false,
			color: theme.palette.secondary.main,
		},
	];

	const testimonials = [
		{
			quote: t('landing.testimonials.testimonial_1.quote'),
			author: t('landing.testimonials.testimonial_1.author'),
			role: t('landing.testimonials.testimonial_1.role'),
			company: t('landing.testimonials.testimonial_1.company'),
		},
		{
			quote: t('landing.testimonials.testimonial_2.quote'),
			author: t('landing.testimonials.testimonial_2.author'),
			role: t('landing.testimonials.testimonial_2.role'),
			company: t('landing.testimonials.testimonial_2.company'),
		},
		{
			quote: t('landing.testimonials.testimonial_3.quote'),
			author: t('landing.testimonials.testimonial_3.author'),
			role: t('landing.testimonials.testimonial_3.role'),
			company: t('landing.testimonials.testimonial_3.company'),
		},
	];

	const stats = [
		{ value: '10,000+', label: t('landing.stats.candidates_processed') },
		{ value: '500+', label: t('landing.stats.companies') },
		{ value: '95%', label: t('landing.stats.satisfaction') },
		{ value: '40%', label: t('landing.stats.time_saved') },
	];

	return (
		<Box>
			{/* Hero Section */}
			<Box
				sx={{
					background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
					color: 'white',
					pt: { xs: 8, md: 12 },
					pb: { xs: 8, md: 12 },
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<Container maxWidth="lg">
					<Grid container spacing={4} alignItems="center">
						<Grid item xs={12} md={6}>
							<Typography
								variant="h2"
								component="h1"
								gutterBottom
								sx={{
									fontWeight: 800,
									fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
								}}
							>
								{t('landing.hero.headline')}
							</Typography>
							<Typography
								variant="h5"
								sx={{
									mb: 4,
									opacity: 0.95,
									fontWeight: 400,
									fontSize: { xs: '1rem', sm: '1.25rem' },
								}}
							>
								{t('landing.hero.subheadline')}
							</Typography>
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								<Button
									variant="contained"
									size="large"
									onClick={() => navigate('/register')}
									sx={{
										bgcolor: 'white',
										color: theme.palette.primary.main,
										px: 4,
										py: 1.5,
										fontSize: '1.1rem',
										'&:hover': {
											bgcolor: alpha(theme.palette.common.white, 0.9),
										},
									}}
								>
									{t('landing.hero.cta_primary')}
								</Button>
								<Button
									variant="outlined"
									size="large"
									startIcon={<PlayArrowIcon />}
									sx={{
										borderColor: 'white',
										color: 'white',
										px: 4,
										py: 1.5,
										fontSize: '1.1rem',
										'&:hover': {
											borderColor: 'white',
											bgcolor: alpha(theme.palette.common.white, 0.1),
										},
									}}
								>
									{t('landing.hero.cta_secondary')}
								</Button>
							</Box>
						</Grid>
						<Grid item xs={12} md={6}>
							<Box
								sx={{
									width: '100%',
									height: { xs: 300, md: 400 },
									bgcolor: alpha(theme.palette.common.white, 0.1),
									borderRadius: 2,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									backdropFilter: 'blur(10px)',
								}}
							>
								<Typography variant="h6" sx={{ opacity: 0.7 }}>
									{t('landing.hero.image_placeholder')}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Container>

				{/* Stats Section */}
				<Container maxWidth="lg" sx={{ mt: 8 }}>
					<Grid container spacing={4}>
						{stats.map((stat, index) => (
							<Grid item xs={6} md={3} key={index}>
								<Box sx={{ textAlign: 'center' }}>
									<Typography
										variant="h3"
										sx={{ fontWeight: 700, mb: 1 }}
									>
										{stat.value}
									</Typography>
									<Typography variant="body1" sx={{ opacity: 0.9 }}>
										{stat.label}
									</Typography>
								</Box>
							</Grid>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Features Section */}
			<Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
				<Box sx={{ textAlign: 'center', mb: 6 }}>
					<Typography
						variant="h3"
						component="h2"
						gutterBottom
						sx={{ fontWeight: 700, mb: 2 }}
					>
						{t('landing.features.section_title')}
					</Typography>
					<Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
						{t('landing.features.section_subtitle')}
					</Typography>
				</Box>

				<Grid container spacing={4}>
					{features.map((feature, index) => (
						<Grid item xs={12} sm={6} md={4} key={index}>
							<Card
								sx={{
									height: '100%',
									transition: 'transform 0.3s, box-shadow 0.3s',
									'&:hover': {
										transform: 'translateY(-8px)',
										boxShadow: theme.shadows[8],
									},
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Box
										sx={{
											color: feature.color,
											mb: 2,
										}}
									>
										{feature.icon}
									</Box>
									<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
										{feature.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>

			{/* Pricing Section */}
			<Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: { xs: 6, md: 10 } }}>
				<Container maxWidth="lg">
					<Box sx={{ textAlign: 'center', mb: 6 }}>
						<Typography
							variant="h3"
							component="h2"
							gutterBottom
							sx={{ fontWeight: 700, mb: 2 }}
						>
							{t('landing.pricing.section_title')}
						</Typography>
						<Typography variant="h6" color="text.secondary">
							{t('landing.pricing.section_subtitle')}
						</Typography>
					</Box>

					<Grid container spacing={4} justifyContent="center">
						{pricingPlans.map((plan, index) => (
							<Grid item xs={12} sm={6} md={4} key={index} sx={{ overflow: 'visible' }}>
								<Card
									sx={{
										height: '100%',
										position: 'relative',
										border: plan.recommended ? `2px solid ${plan.color}` : 'none',
										width: 360,
										maxWidth: '100%',
										mx: 'auto',
										overflow: 'visible',
									}}
								>
									{plan.recommended && (
										<Box
											sx={{
												position: 'absolute',
												top: -12,
												right: 16,
												bgcolor: plan.color,
												color: 'white',
												px: 2,
												py: 0.5,
												borderRadius: 1,
												fontSize: '0.875rem',
												fontWeight: 600,
												display: 'flex',
												alignItems: 'center',
												gap: 0.5,
											}}
										>
											<StarIcon sx={{ fontSize: 16 }} />
											{t('landing.pricing.recommended')}
										</Box>
									)}
									<CardContent sx={{ p: 4 }}>
										<Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
											{plan.name}
										</Typography>
										<Box sx={{ mb: 2 }}>
											<Typography
												variant="h3"
												component="span"
												sx={{ fontWeight: 700, color: plan.color }}
											>
												{plan.price}
											</Typography>
											{plan.price !== t('landing.pricing.enterprise.price') && (
												<Typography
													variant="h6"
													component="span"
													color="text.secondary"
												>
													/{t('landing.pricing.per_month')}
												</Typography>
											)}
										</Box>
										<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
											{plan.description}
										</Typography>
										<Box sx={{ mb: 3 }}>
											{plan.features.map((feature, idx) => (
												<Box
													key={idx}
													sx={{
														display: 'flex',
														alignItems: 'flex-start',
														mb: 1.5,
													}}
												>
													<CheckCircleIcon
														sx={{
															fontSize: 20,
															color: plan.color,
															mr: 1,
															mt: 0.2,
														}}
													/>
													<Typography variant="body2">{feature}</Typography>
												</Box>
											))}
										</Box>
										<Button
											variant={plan.recommended ? 'contained' : 'outlined'}
											fullWidth
											size="large"
											onClick={() => navigate('/register')}
											sx={{
												mt: 'auto',
												...(plan.recommended && {
													bgcolor: plan.color,
													'&:hover': {
														bgcolor: alpha(plan.color, 0.9),
													},
												}),
											}}
										>
											{t('landing.pricing.cta')}
										</Button>
									</CardContent>
								</Card>
							</Grid>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Social Proof Section */}
			<Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
				<Box sx={{ textAlign: 'center', mb: 6 }}>
					<Typography
						variant="h3"
						component="h2"
						gutterBottom
						sx={{ fontWeight: 700, mb: 2 }}
					>
						{t('landing.social_proof.section_title')}
					</Typography>
					<Typography variant="h6" color="text.secondary">
						{t('landing.social_proof.section_subtitle')}
					</Typography>
				</Box>

				<Grid container spacing={4}>
					{testimonials.map((testimonial, index) => (
						<Grid item xs={12} md={4} key={index}>
							<Card sx={{ height: '100%', p: 3 }}>
								<CardContent>
									<Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
										"{testimonial.quote}"
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										<Box
											sx={{
												width: 48,
												height: 48,
												borderRadius: '50%',
												bgcolor: alpha(theme.palette.primary.main, 0.1),
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontWeight: 600,
												color: theme.palette.primary.main,
											}}
										>
											{testimonial.author.charAt(0)}
										</Box>
										<Box>
											<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
												{testimonial.author}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												{testimonial.role}, {testimonial.company}
											</Typography>
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>

				{/* Company Logos Placeholder */}
				<Box sx={{ mt: 8, textAlign: 'center' }}>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						{t('landing.social_proof.trusted_by')}
					</Typography>
					<Grid container spacing={4} sx={{ mt: 2 }}>
						{[1, 2, 3, 4, 5, 6].map((item) => (
							<Grid item xs={6} sm={4} md={2} key={item}>
								<Box
									sx={{
										height: 60,
										bgcolor: alpha(theme.palette.grey[500], 0.1),
										borderRadius: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Typography variant="caption" color="text.secondary">
										{t('landing.social_proof.company_logo')} {item}
									</Typography>
								</Box>
							</Grid>
						))}
					</Grid>
				</Box>
			</Container>

			{/* Footer */}
			<Box
				sx={{
					bgcolor: theme.palette.grey[900],
					color: 'white',
					py: 6,
				}}
			>
				<Container maxWidth="lg">
					<Grid container spacing={4}>
						<Grid item xs={12} md={4}>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
								{t('landing.footer.brand_name')}
							</Typography>
							<Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
								{t('landing.footer.brand_description')}
							</Typography>
							<Box sx={{ display: 'flex', gap: 1 }}>
								<IconButton size="small" sx={{ color: 'white' }}>
									<TwitterIcon />
								</IconButton>
								<IconButton size="small" sx={{ color: 'white' }}>
									<LinkedInIcon />
								</IconButton>
								<IconButton size="small" sx={{ color: 'white' }}>
									<GitHubIcon />
								</IconButton>
							</Box>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
								{t('landing.footer.product')}
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.features')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.pricing')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.careers')}
								</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
								{t('landing.footer.company')}
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.about')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.contact')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.blog')}
								</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
								{t('landing.footer.resources')}
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.documentation')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.support')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.api')}
								</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
								{t('landing.footer.legal')}
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.privacy')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.terms')}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.8, cursor: 'pointer' }}>
									{t('landing.footer.security')}
								</Typography>
							</Box>
						</Grid>
					</Grid>
					<Box
						sx={{
							mt: 4,
							pt: 4,
							borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
							textAlign: 'center',
						}}
					>
						<Typography variant="body2" sx={{ opacity: 0.7 }}>
							{t('landing.footer.copyright', { year: new Date().getFullYear() })}
						</Typography>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};

export default LandingPage;
