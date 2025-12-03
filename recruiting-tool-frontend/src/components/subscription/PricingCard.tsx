import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlan } from '../../types/subscription.types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  price: string;
  features: string[];
  isCurrentPlan: boolean;
  onUpgrade?: () => void;
  upgradeDisabled?: boolean;
  highlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  price,
  features,
  isCurrentPlan,
  onUpgrade,
  upgradeDisabled = false,
  highlighted = false,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: highlighted ? 2 : 1,
        borderColor: highlighted ? 'primary.main' : 'divider',
        boxShadow: highlighted ? 4 : 1,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
        },
      }}
    >
      {highlighted && (
        <Chip
          label={t('subscription.recommended')}
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
          {t(`subscription.plans.${plan.toLowerCase()}.name`)}
        </Typography>

        <Typography variant="h3" component="div" color="primary" gutterBottom>
          {price}
          <Typography variant="subtitle1" component="span" color="text.secondary">
            {plan !== SubscriptionPlan.FREE && `/${t('subscription.per_month')}`}
          </Typography>
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t(`subscription.plans.${plan.toLowerCase()}.description`)}
        </Typography>

        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  variant: 'body2',
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ width: '100%' }}>
          {isCurrentPlan ? (
            <Chip
              label={t('subscription.current_plan')}
              color="primary"
              sx={{ width: '100%' }}
            />
          ) : (
            <Button
              variant={highlighted ? 'contained' : 'outlined'}
              fullWidth
              onClick={onUpgrade}
              disabled={upgradeDisabled}
            >
              {t('subscription.upgrade_to_plan')}
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default PricingCard;
