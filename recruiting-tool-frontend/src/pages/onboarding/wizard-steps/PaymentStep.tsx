import React from 'react';
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	Alert,
	CircularProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SubscriptionPlan } from '../../../types/subscription.types';
import { useCheckout } from '../../../api/subscription';

interface PaymentStepProps {
	selectedPlan: SubscriptionPlan;
	onNext: () => void;
	onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ selectedPlan, onNext, onBack }) => {
	const { t } = useTranslation();
	const { mutate: createCheckout, isPending, isError, error } = useCheckout();

	const getPlanPrice = () => {
		switch (selectedPlan) {
			case SubscriptionPlan.PROFESSIONAL:
				return t('onboarding.plans.professional.price');
			case SubscriptionPlan.ENTERPRISE:
				return t('onboarding.plans.enterprise.price');
			default:
				return t('onboarding.plans.free.price');
		}
	};

	const getPlanName = () => {
		switch (selectedPlan) {
			case SubscriptionPlan.PROFESSIONAL:
				return t('onboarding.plans.professional.name');
			case SubscriptionPlan.ENTERPRISE:
				return t('onboarding.plans.enterprise.name');
			default:
				return t('onboarding.plans.free.name');
		}
	};

	const handleProceedToPayment = () => {
		// Create Stripe Checkout session
		const currentUrl = window.location.origin;
		createCheckout({
			plan: selectedPlan,
			successUrl: `${currentUrl}/onboarding?payment=success&step=2`,
			cancelUrl: `${currentUrl}/onboarding?payment=cancelled&step=1`,
		});
		// The useCheckout hook automatically redirects to Stripe Checkout on success
	};

	return (
		<Box>
			<Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
				{t('onboarding.payment.title')}
			</Typography>

			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						{t('onboarding.payment.plan_summary')}
					</Typography>

					<Box sx={{ my: 2 }}>
						<Typography variant="body2" color="textSecondary">
							{t('onboarding.payment.selected_plan')}
						</Typography>
						<Typography variant="h6">{getPlanName()}</Typography>
					</Box>

					<Box sx={{ my: 2 }}>
						<Typography variant="body2" color="textSecondary">
							{t('onboarding.payment.price')}
						</Typography>
						<Typography variant="h4" color="primary">
							{getPlanPrice()}
						</Typography>
					</Box>

					<Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
						{t('onboarding.payment.billing_info')}
					</Typography>
				</CardContent>
			</Card>

			<Alert severity="info" sx={{ mb: 3 }}>
				{t('onboarding.payment.secure_payment_notice')}
			</Alert>

			<Card sx={{ mb: 3, bgcolor: 'background.default' }}>
				<CardContent>
					<Typography variant="subtitle2" gutterBottom fontWeight="bold">
						{t('onboarding.payment.whats_included')}
					</Typography>
					<List dense>
						<ListItem>
							<ListItemIcon sx={{ minWidth: 36 }}>
								<CheckCircleIcon color="success" fontSize="small" />
							</ListItemIcon>
							<ListItemText
								primary={t('onboarding.payment.features.cancel_anytime')}
								primaryTypographyProps={{ variant: 'body2' }}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon sx={{ minWidth: 36 }}>
								<CheckCircleIcon color="success" fontSize="small" />
							</ListItemIcon>
							<ListItemText
								primary={t('onboarding.payment.features.no_setup_fees')}
								primaryTypographyProps={{ variant: 'body2' }}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon sx={{ minWidth: 36 }}>
								<CheckCircleIcon color="success" fontSize="small" />
							</ListItemIcon>
							<ListItemText
								primary={t('onboarding.payment.features.secure_processing')}
								primaryTypographyProps={{ variant: 'body2' }}
							/>
						</ListItem>
						<ListItem>
							<ListItemIcon sx={{ minWidth: 36 }}>
								<CheckCircleIcon color="success" fontSize="small" />
							</ListItemIcon>
							<ListItemText
								primary={t('onboarding.payment.features.instant_access')}
								primaryTypographyProps={{ variant: 'body2' }}
							/>
						</ListItem>
					</List>
				</CardContent>
			</Card>

			{isError && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{t('onboarding.payment.error_message')}
					{error && `: ${error.message}`}
				</Alert>
			)}

			<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
				<Button onClick={onBack} disabled={isPending}>
					{t('common.back')}
				</Button>
				<Button
					variant="contained"
					size="large"
					onClick={handleProceedToPayment}
					disabled={isPending}
					startIcon={isPending ? <CircularProgress size={20} /> : <CreditCardIcon />}
				>
					{isPending
						? t('onboarding.payment.processing')
						: t('onboarding.payment.proceed_to_payment')}
				</Button>
			</Box>
		</Box>
	);
};

export default PaymentStep;
