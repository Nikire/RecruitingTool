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
	Chip,
	Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/material/styles';

// Icons
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';
import CloudIcon from '@mui/icons-material/Cloud';
import SpeedIcon from '@mui/icons-material/Speed';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Keyframe animations - More dynamic
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const LandingPage = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const navigate = useNavigate();

	const features = [
		{
			icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.ai_screening.title'),
			description: t('landing.features.ai_screening.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
		},
		{
			icon: <CalendarTodayIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.interview_scheduling.title'),
			description: t('landing.features.interview_scheduling.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
		},
		{
			icon: <EmailIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.email_templates.title'),
			description: t('landing.features.email_templates.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
		},
		{
			icon: <PeopleIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.candidate_tracking.title'),
			description: t('landing.features.candidate_tracking.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
		},
		{
			icon: <GroupWorkIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.team_collaboration.title'),
			description: t('landing.features.team_collaboration.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.success.main} 100%)`,
		},
		{
			icon: <CloudIcon sx={{ fontSize: 48 }} />,
			title: t('landing.features.self_hosted.title'),
			description: t('landing.features.self_hosted.description'),
			gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
		},
	];

	const howItWorksSteps = [
		{
			icon: <LooksOneIcon sx={{ fontSize: 60 }} />,
			title: t('landing.how_it_works.step1.title'),
			description: t('landing.how_it_works.step1.description'),
		},
		{
			icon: <LooksTwoIcon sx={{ fontSize: 60 }} />,
			title: t('landing.how_it_works.step2.title'),
			description: t('landing.how_it_works.step2.description'),
		},
		{
			icon: <Looks3Icon sx={{ fontSize: 60 }} />,
			title: t('landing.how_it_works.step3.title'),
			description: t('landing.how_it_works.step3.description'),
		},
	];

	const pricingPlans = [
		{
			name: t('landing.pricing.free.name'),
			price: '$0',
			period: t('landing.pricing.per_month'),
			description: 'Perfect for small teams',
			features: [
				'1 job position',
				'25 applications/month',
				'Basic tracking',
				'Email support',
			],
			recommended: false,
			color: theme.palette.grey[600],
			buttonVariant: 'outlined' as const,
		},
		{
			name: t('landing.pricing.professional.name'),
			price: '$79',
			period: t('landing.pricing.per_month'),
			description: 'For growing teams',
			features: [
				'Unlimited job positions',
				'Unlimited applications',
				'AI resume screening',
				'Interview scheduling',
				'Advanced analytics',
				'Priority support',
			],
			recommended: true,
			color: theme.palette.primary.main,
			buttonVariant: 'contained' as const,
		},
		{
			name: t('landing.pricing.enterprise.name'),
			price: '$299',
			period: t('landing.pricing.per_month'),
			description: 'For large organizations',
			features: [
				'Everything in Professional',
				'White-label branding',
				'Unlimited AI screening',
				'Dedicated support',
				'SSO & API access',
				'SLA guarantee',
			],
			recommended: false,
			color: theme.palette.secondary.main,
			buttonVariant: 'outlined' as const,
		},
	];

	// Smooth scroll helper
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<Box sx={{ overflow: 'hidden' }}>
			{/* Hero Section */}
			<Box
				sx={{
					position: 'relative',
					background: `linear-gradient(135deg,
						${theme.palette.primary.main} 0%,
						${theme.palette.primary.dark} 50%,
						${theme.palette.secondary.main} 100%)`,
					backgroundSize: '200% 200%',
					animation: `${gradientShift} 5s ease infinite`,
					color: 'white',
					pt: { xs: 12, md: 14 },
					pb: { xs: 12, md: 14 },
					overflow: 'hidden',
					minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
					display: 'flex',
					alignItems: 'center',
				}}
			>
				{/* Decorative floating elements - more subtle */}
				<Box
					sx={{
						position: 'absolute',
						top: '12%',
						right: '8%',
						width: { xs: 60, md: 100 },
						height: { xs: 60, md: 100 },
						borderRadius: '50%',
						background: alpha(theme.palette.common.white, 0.08),
						animation: `${float} 8s ease-in-out infinite`,
						filter: 'blur(40px)',
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						bottom: '15%',
						left: '10%',
						width: { xs: 50, md: 80 },
						height: { xs: 50, md: 80 },
						borderRadius: '50%',
						background: alpha(theme.palette.common.white, 0.06),
						animation: `${float} 10s ease-in-out infinite`,
						filter: 'blur(30px)',
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						top: '40%',
						left: '5%',
						width: { xs: 40, md: 60 },
						height: { xs: 40, md: 60 },
						borderRadius: '50%',
						background: alpha(theme.palette.common.white, 0.05),
						animation: `${float} 12s ease-in-out infinite`,
						filter: 'blur(25px)',
					}}
				/>

				<Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
					<Grid container spacing={8} alignItems="center">
						<Grid item xs={12} md={7}>
							<Box
								sx={{
									animation: `${fadeInUp} 0.8s ease-out`,
								}}
							>
								<Typography
									variant="h1"
									component="h1"
									gutterBottom
									sx={{
										fontWeight: 900,
										fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem' },
										lineHeight: 1.15,
										mb: 3,
										color: 'white',
										textShadow: '0 2px 20px rgba(0,0,0,0.1)',
										letterSpacing: '-0.02em',
									}}
								>
									{t('landing.hero.new_headline')}
								</Typography>
								<Typography
									variant="h5"
									sx={{
										mb: 6,
										opacity: 0.92,
										fontWeight: 400,
										fontSize: { xs: '1.15rem', sm: '1.4rem' },
										lineHeight: 1.65,
										maxWidth: 580,
										color: alpha(theme.palette.common.white, 0.95),
									}}
								>
									{t('landing.hero.new_subheadline')}
								</Typography>
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
									<Button
										variant="contained"
										size="large"
										onClick={() => scrollToSection('pricing')}
										endIcon={<ArrowForwardIcon />}
										sx={{
											bgcolor: 'white',
											color: theme.palette.primary.main,
											px: 5,
											py: 2,
											fontSize: '1.125rem',
											fontWeight: 700,
											borderRadius: 2.5,
											textTransform: 'none',
											boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
											'&:hover': {
												bgcolor: alpha(theme.palette.common.white, 0.95),
												transform: 'translateY(-3px)',
												boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
											},
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										}}
									>
										{t('landing.hero.cta_start_now')}
									</Button>
									<Button
										variant="outlined"
										size="large"
										onClick={() => scrollToSection('features')}
										sx={{
											borderColor: alpha(theme.palette.common.white, 0.8),
											color: 'white',
											px: 5,
											py: 2,
											fontSize: '1.125rem',
											fontWeight: 700,
											borderRadius: 2.5,
											textTransform: 'none',
											borderWidth: 2,
											'&:hover': {
												borderColor: 'white',
												bgcolor: alpha(theme.palette.common.white, 0.12),
												borderWidth: 2,
												transform: 'translateY(-3px)',
											},
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										}}
									>
										{t('landing.hero.cta_learn_more')}
									</Button>
								</Stack>
							</Box>
						</Grid>
						<Grid item xs={12} md={5}>
							<Box
								sx={{
									animation: `${scaleIn} 0.8s ease-out 0.3s both`,
								}}
							>
								<Box
									sx={{
										width: '100%',
										height: { xs: 320, md: 420 },
										bgcolor: alpha(theme.palette.common.white, 0.08),
										borderRadius: 5,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										backdropFilter: 'blur(30px)',
										border: `2px solid ${alpha(theme.palette.common.white, 0.15)}`,
										boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
										position: 'relative',
										overflow: 'hidden',
										'&::before': {
											content: '""',
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											background: `linear-gradient(135deg, ${alpha(
												theme.palette.primary.light,
												0.15
											)} 0%, transparent 100%)`,
											pointerEvents: 'none',
										},
									}}
								>
									<Stack spacing={3} alignItems="center">
										<AutoAwesomeIcon sx={{ fontSize: 100, opacity: 0.6 }} />
										<Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 500 }}>
											{t('landing.hero.image_placeholder')}
										</Typography>
									</Stack>
								</Box>
							</Box>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* Social Proof Bar - Hidden (no real data yet)
			<Box
				sx={{
					py: 3,
					bgcolor: alpha(theme.palette.primary.main, 0.02),
					borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
				}}
			>
				<Container maxWidth="lg">
					<Typography
						variant="body1"
						align="center"
						color="text.secondary"
						sx={{ fontWeight: 600, fontSize: '1rem', letterSpacing: 0.5 }}
					>
						{t('landing.social_proof.trusted_bar')}
					</Typography>
				</Container>
			</Box>
			*/}

			{/* Features Section */}
			<Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
				<Box sx={{ textAlign: 'center', mb: 8 }}>
					<Typography
						variant="overline"
						sx={{
							color: theme.palette.primary.main,
							fontWeight: 800,
							fontSize: '0.875rem',
							letterSpacing: 2,
						}}
					>
						{t('landing.features.section_label')}
					</Typography>
					<Typography
						variant="h2"
						component="h2"
						gutterBottom
						sx={{
							fontWeight: 900,
							mb: 3,
							fontSize: { xs: '2.25rem', md: '3rem' },
							mt: 2,
							letterSpacing: '-0.02em',
						}}
					>
						{t('landing.features.section_new_title')}
					</Typography>
					<Typography
						variant="h6"
						color="text.secondary"
						sx={{
							maxWidth: 680,
							mx: 'auto',
							fontSize: '1.2rem',
							lineHeight: 1.6,
							fontWeight: 400,
						}}
					>
						{t('landing.features.section_new_subtitle')}
					</Typography>
				</Box>

				<Grid container spacing={4} justifyContent="center">
					{features.map((feature, index) => (
						<Grid item xs={12} sm={6} md={4} key={index} sx={{ overflow: 'visible' }}>
							<Card
								sx={{
									height: '100%',
									width: 320,
									maxWidth: '100%',
									mx: 'auto',
									borderRadius: 4,
									border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
									transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
									bgcolor: 'background.paper',
									overflow: 'visible',
									animation: `${fadeInUp} 0.6s ease-out forwards`,
									animationDelay: `${index * 0.15}s`,
									opacity: 0,
									'&:hover': {
										transform: 'translateY(-8px) scale(1.02)',
										boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
										borderColor: alpha(theme.palette.primary.main, 0.2),
									},
								}}
							>
								<CardContent sx={{ p: 4.5 }}>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: 2.5,
											background: feature.gradient,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											mb: 3.5,
											color: 'white',
											boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
										}}
									>
										{feature.icon}
									</Box>
									<Typography
										variant="h6"
										gutterBottom
										sx={{
											fontWeight: 800,
											mb: 1.5,
											fontSize: '1.25rem',
											letterSpacing: '-0.01em',
										}}
									>
										{feature.title}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}
									>
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>

			{/* How It Works Section */}
			<Box
				id="how-it-works"
				sx={{
					bgcolor: alpha(theme.palette.primary.main, 0.015),
					py: { xs: 8, md: 10 },
				}}
			>
				<Container maxWidth="lg">
					<Box sx={{ textAlign: 'center', mb: 8 }}>
						<Typography
							variant="overline"
							sx={{
								color: theme.palette.primary.main,
								fontWeight: 800,
								fontSize: '0.875rem',
								letterSpacing: 2,
							}}
						>
							{t('landing.how_it_works.section_label')}
						</Typography>
						<Typography
							variant="h2"
							component="h2"
							gutterBottom
							sx={{
								fontWeight: 900,
								mb: 2,
								fontSize: { xs: '2.25rem', md: '3rem' },
								mt: 2,
								letterSpacing: '-0.02em',
							}}
						>
							{t('landing.how_it_works.section_title')}
						</Typography>
					</Box>

					<Grid container spacing={6} justifyContent="center">
						{howItWorksSteps.map((step, index) => (
							<Grid item xs={12} md={4} key={index} sx={{ overflow: 'visible' }}>
								<Card
									sx={{
										height: '100%',
										width: 320,
										maxWidth: '100%',
										mx: 'auto',
										borderRadius: 4,
										border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
										bgcolor: 'background.paper',
										p: 4,
										textAlign: 'center',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										overflow: 'visible',
										animation: `${scaleIn} 0.6s ease-out forwards`,
										animationDelay: `${index * 0.2}s`,
										opacity: 0,
										'&:hover': {
											transform: 'translateY(-8px) scale(1.03)',
											boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
											borderColor: alpha(theme.palette.primary.main, 0.2),
										},
									}}
								>
									<Box
										sx={{
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: 110,
											height: 110,
											borderRadius: '50%',
											background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
											color: 'white',
											mb: 4,
											boxShadow: `0 12px 36px ${alpha(theme.palette.primary.main, 0.3)}`,
											position: 'relative',
											'&::after': {
												content: '""',
												position: 'absolute',
												inset: -4,
												borderRadius: '50%',
												padding: '4px',
												background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
												WebkitMask:
													'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
												WebkitMaskComposite: 'xor',
												maskComposite: 'exclude',
												opacity: 0.3,
											},
										}}
									>
										{step.icon}
									</Box>
									<Typography
										variant="h5"
										gutterBottom
										sx={{
											fontWeight: 800,
											mb: 2,
											fontSize: '1.4rem',
											letterSpacing: '-0.01em',
										}}
									>
										{step.title}
									</Typography>
									<Typography
										variant="body1"
										color="text.secondary"
										sx={{ lineHeight: 1.7, fontSize: '1rem' }}
									>
										{step.description}
									</Typography>
								</Card>
							</Grid>
						))}
					</Grid>
				</Container>
			</Box>

			{/* Pricing Section */}
			<Container id="pricing" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
				<Box sx={{ textAlign: 'center', mb: 8 }}>
					<Typography
						variant="overline"
						sx={{
							color: theme.palette.primary.main,
							fontWeight: 800,
							fontSize: '0.875rem',
							letterSpacing: 2,
						}}
					>
						{t('landing.pricing.section_label')}
					</Typography>
					<Typography
						variant="h2"
						component="h2"
						gutterBottom
						sx={{
							fontWeight: 900,
							mb: 3,
							fontSize: { xs: '2.25rem', md: '3rem' },
							mt: 2,
							letterSpacing: '-0.02em',
						}}
					>
						{t('landing.pricing.section_title')}
					</Typography>
					<Typography
						variant="h6"
						color="text.secondary"
						sx={{
							fontSize: '1.2rem',
							fontWeight: 400,
							lineHeight: 1.6,
							maxWidth: 680,
							mx: 'auto',
						}}
					>
						{t('landing.pricing.section_subtitle')}
					</Typography>
				</Box>

				<Grid container spacing={4} justifyContent="center">
					{pricingPlans.map((plan, index) => (
						<Grid
							item
							xs={12}
							sm={6}
							md={4}
							key={index}
							sx={{ display: 'flex', overflow: 'visible' }}
						>
							<Card
								sx={{
									height: '100%',
									width: 360,
									maxWidth: '100%',
									mx: 'auto',
									position: 'relative',
									borderRadius: 4,
									border: plan.recommended
										? `2px solid ${plan.color}`
										: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
									overflow: 'visible',
									transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
									bgcolor: 'background.paper',
									display: 'flex',
									flexDirection: 'column',
									animation: `${slideInLeft} 0.6s ease-out forwards`,
									animationDelay: `${index * 0.15}s`,
									opacity: 0,
									...(plan.recommended && {
										boxShadow: `0 20px 60px ${alpha(plan.color, 0.15)}`,
									}),
									'&:hover': {
										transform: 'translateY(-8px) scale(1.02)',
										boxShadow: plan.recommended
											? `0 30px 80px ${alpha(plan.color, 0.25)}`
											: `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
									},
								}}
							>
								{plan.recommended && (
									<Chip
										icon={<StarIcon sx={{ fontSize: 18 }} />}
										label={t('landing.pricing.recommended')}
										sx={{
											position: 'absolute',
											top: -16,
											left: '50%',
											transform: 'translateX(-50%)',
											bgcolor: plan.color,
											color: 'white',
											fontWeight: 800,
											fontSize: '0.875rem',
											height: 32,
											px: 2,
											boxShadow: `0 4px 12px ${alpha(plan.color, 0.4)}`,
											'& .MuiChip-icon': {
												color: 'white',
											},
										}}
									/>
								)}
								<CardContent sx={{ p: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
									<Typography
										variant="h5"
										gutterBottom
										sx={{
											fontWeight: 800,
											mb: 1,
											fontSize: '1.5rem',
											letterSpacing: '-0.01em',
										}}
									>
										{plan.name}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 4, minHeight: 44, lineHeight: 1.6 }}
									>
										{plan.description}
									</Typography>
									<Box sx={{ mb: 5 }}>
										<Typography
											variant="h3"
											component="span"
											sx={{
												fontWeight: 900,
												color: plan.color,
												fontSize: '3.5rem',
												letterSpacing: '-0.02em',
											}}
										>
											{plan.price}
										</Typography>
										<Typography
											variant="h6"
											component="span"
											color="text.secondary"
											sx={{ ml: 1.5, fontWeight: 500 }}
										>
											/{plan.period}
										</Typography>
									</Box>
									<Box sx={{ mb: 5, flexGrow: 1 }}>
										{plan.features.map((feature, idx) => (
											<Box
												key={idx}
												sx={{
													display: 'flex',
													alignItems: 'flex-start',
													mb: 2,
												}}
											>
												<CheckCircleIcon
													sx={{
														fontSize: 22,
														color: plan.color,
														mr: 2,
														mt: 0.2,
														flexShrink: 0,
													}}
												/>
												<Typography
													variant="body2"
													sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}
												>
													{feature}
												</Typography>
											</Box>
										))}
									</Box>
								</CardContent>
								<Box sx={{ p: 5, pt: 0 }}>
									<Button
										variant={plan.buttonVariant}
										fullWidth
										size="large"
										onClick={() => navigate('/register')}
										sx={{
											py: 2,
											fontSize: '1.05rem',
											fontWeight: 700,
											borderRadius: 2.5,
											textTransform: 'none',
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
											...(plan.recommended && {
												bgcolor: plan.color,
												boxShadow: `0 4px 16px ${alpha(plan.color, 0.3)}`,
												'&:hover': {
													bgcolor: alpha(plan.color, 0.9),
													transform: 'translateY(-2px)',
													boxShadow: `0 8px 24px ${alpha(plan.color, 0.4)}`,
												},
											}),
											...(!plan.recommended && {
												borderColor: plan.color,
												borderWidth: 2,
												color: plan.color,
												'&:hover': {
													borderColor: plan.color,
													borderWidth: 2,
													bgcolor: alpha(plan.color, 0.06),
													transform: 'translateY(-2px)',
												},
											}),
										}}
									>
										{t('landing.pricing.cta')}
									</Button>
								</Box>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>

			{/* Testimonials Section - COMMENTED OUT (no real testimonials yet) */}
			{/*
			<Box
				sx={{
					bgcolor: alpha(theme.palette.primary.main, 0.015),
					py: { xs: 8, md: 10 },
				}}
			>
				<Container maxWidth="lg">
					<Box sx={{ textAlign: 'center', mb: 8 }}>
						<Typography
							variant="overline"
							sx={{
								color: theme.palette.primary.main,
								fontWeight: 800,
								fontSize: '0.875rem',
								letterSpacing: 2,
							}}
						>
							{t('landing.social_proof.section_label')}
						</Typography>
						<Typography
							variant="h2"
							component="h2"
							gutterBottom
							sx={{
								fontWeight: 900,
								mb: 2,
								fontSize: { xs: '2.25rem', md: '3rem' },
								mt: 2,
								letterSpacing: '-0.02em',
							}}
						>
							{t('landing.social_proof.section_title')}
						</Typography>
					</Box>

					<Grid container spacing={4} justifyContent="center">
						{[
							{
								quote: t('landing.social_proof.testimonial_1.quote'),
								author: t('landing.social_proof.testimonial_1.author'),
								role: t('landing.social_proof.testimonial_1.role'),
								company: t('landing.social_proof.testimonial_1.company'),
							},
							{
								quote: t('landing.social_proof.testimonial_2.quote'),
								author: t('landing.social_proof.testimonial_2.author'),
								role: t('landing.social_proof.testimonial_2.role'),
								company: t('landing.social_proof.testimonial_2.company'),
							},
							{
								quote: t('landing.social_proof.testimonial_3.quote'),
								author: t('landing.social_proof.testimonial_3.author'),
								role: t('landing.social_proof.testimonial_3.role'),
								company: t('landing.social_proof.testimonial_3.company'),
							},
						].map((testimonial, index) => (
							<Grid item xs={12} md={4} key={index} sx={{ overflow: 'visible' }}>
								<Card
									sx={{
										height: '100%',
										width: 360,
										maxWidth: '100%',
										mx: 'auto',
										borderRadius: 4,
										border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
										p: 4.5,
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										overflow: 'visible',
										animation: `${fadeInUp} 0.6s ease-out forwards`,
										animationDelay: `${index * 0.15}s`,
										opacity: 0,
										'&:hover': {
											transform: 'translateY(-6px)',
											boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.08)}`,
											borderColor: alpha(theme.palette.primary.main, 0.15),
										},
									}}
								>
									<Typography
										variant="body1"
										sx={{
											mb: 4,
											fontStyle: 'italic',
											color: 'text.secondary',
											lineHeight: 1.8,
											fontSize: '1rem',
										}}
									>
										"{testimonial.quote}"
									</Typography>
									<Box>
										<Typography
											variant="subtitle2"
											sx={{ fontWeight: 800, mb: 0.5, fontSize: '1rem' }}
										>
											{testimonial.author}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 0.5 }}
										>
											{testimonial.role}
										</Typography>
										<Typography
											variant="caption"
											color="primary"
											sx={{ fontWeight: 700, fontSize: '0.85rem' }}
										>
											{testimonial.company}
										</Typography>
									</Box>
								</Card>
							</Grid>
						))}
					</Grid>
				</Container>
			</Box>
			*/}

			{/* Final CTA Section */}
			<Box
				sx={{
					position: 'relative',
					background: `linear-gradient(135deg,
						${theme.palette.primary.main} 0%,
						${theme.palette.primary.dark} 50%,
						${theme.palette.secondary.main} 100%)`,
					backgroundSize: '200% 200%',
					animation: `${gradientShift} 5s ease infinite`,
					color: 'white',
					py: { xs: 10, md: 12 },
					textAlign: 'center',
					overflow: 'hidden',
				}}
			>
				{/* Decorative elements */}
				<Box
					sx={{
						position: 'absolute',
						top: '20%',
						right: '10%',
						width: { xs: 80, md: 120 },
						height: { xs: 80, md: 120 },
						borderRadius: '50%',
						background: alpha(theme.palette.common.white, 0.06),
						filter: 'blur(40px)',
						animation: `${float} 8s ease-in-out infinite`,
					}}
				/>
				<Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
					<Typography
						variant="h2"
						component="h2"
						gutterBottom
						sx={{
							fontWeight: 900,
							mb: 3,
							fontSize: { xs: '2.25rem', md: '3.25rem' },
							letterSpacing: '-0.02em',
							textShadow: '0 2px 20px rgba(0,0,0,0.1)',
						}}
					>
						{t('landing.final_cta.title')}
					</Typography>
					<Typography
						variant="h6"
						sx={{
							mb: 6,
							opacity: 0.93,
							fontSize: '1.25rem',
							lineHeight: 1.6,
							maxWidth: 560,
							mx: 'auto',
						}}
					>
						{t('landing.final_cta.subtitle')}
					</Typography>
					<Button
						variant="contained"
						size="large"
						onClick={() => navigate('/register')}
						endIcon={<ArrowForwardIcon />}
						sx={{
							bgcolor: 'white',
							color: theme.palette.primary.main,
							px: 7,
							py: 2.5,
							fontSize: '1.25rem',
							fontWeight: 800,
							borderRadius: 3,
							textTransform: 'none',
							boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
							'&:hover': {
								bgcolor: alpha(theme.palette.common.white, 0.95),
								transform: 'translateY(-3px)',
								boxShadow: '0 16px 50px rgba(0,0,0,0.3)',
							},
							transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					>
						{t('landing.final_cta.button')}
					</Button>
				</Container>
			</Box>

			{/* Footer */}
			<Box
				sx={{
					bgcolor: theme.palette.grey[900],
					color: 'white',
					py: 8,
				}}
			>
				<Container maxWidth="lg">
					<Grid container spacing={5}>
						<Grid item xs={12} md={4}>
							<Typography
								variant="h5"
								gutterBottom
								sx={{ fontWeight: 900, mb: 2.5, letterSpacing: '-0.01em' }}
							>
								{t('landing.footer.brand_name')}
							</Typography>
							<Typography
								variant="body2"
								sx={{ mb: 4, opacity: 0.75, lineHeight: 1.8, fontSize: '0.95rem' }}
							>
								{t('landing.footer.brand_description')}
							</Typography>
							<Stack direction="row" spacing={1.5}>
								<IconButton
									size="small"
									sx={{
										color: 'white',
										'&:hover': {
											bgcolor: alpha(theme.palette.common.white, 0.1),
										},
									}}
								>
									<TwitterIcon />
								</IconButton>
								<IconButton
									size="small"
									sx={{
										color: 'white',
										'&:hover': {
											bgcolor: alpha(theme.palette.common.white, 0.1),
										},
									}}
								>
									<LinkedInIcon />
								</IconButton>
								<IconButton
									size="small"
									sx={{
										color: 'white',
										'&:hover': {
											bgcolor: alpha(theme.palette.common.white, 0.1),
										},
									}}
								>
									<GitHubIcon />
								</IconButton>
							</Stack>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography
								variant="subtitle2"
								gutterBottom
								sx={{ fontWeight: 800, mb: 2.5, fontSize: '0.9rem' }}
							>
								{t('landing.footer.product')}
							</Typography>
							<Stack spacing={2}>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.features')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.pricing')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.careers')}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography
								variant="subtitle2"
								gutterBottom
								sx={{ fontWeight: 800, mb: 2.5, fontSize: '0.9rem' }}
							>
								{t('landing.footer.company')}
							</Typography>
							<Stack spacing={2}>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.about')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.contact')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.blog')}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography
								variant="subtitle2"
								gutterBottom
								sx={{ fontWeight: 800, mb: 2.5, fontSize: '0.9rem' }}
							>
								{t('landing.footer.resources')}
							</Typography>
							<Stack spacing={2}>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.documentation')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.support')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.api')}
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={6} md={2}>
							<Typography
								variant="subtitle2"
								gutterBottom
								sx={{ fontWeight: 800, mb: 2.5, fontSize: '0.9rem' }}
							>
								{t('landing.footer.legal')}
							</Typography>
							<Stack spacing={2}>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.privacy')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.terms')}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.7,
										cursor: 'pointer',
										transition: 'all 0.2s ease',
										'&:hover': { opacity: 1, pl: 0.5 },
									}}
								>
									{t('landing.footer.security')}
								</Typography>
							</Stack>
						</Grid>
					</Grid>
					<Box
						sx={{
							mt: 8,
							pt: 5,
							borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
							textAlign: 'center',
						}}
					>
						<Typography variant="body2" sx={{ opacity: 0.65, fontSize: '0.9rem' }}>
							{t('landing.footer.copyright', { year: new Date().getFullYear() })}
						</Typography>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};

export default LandingPage;
