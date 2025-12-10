import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface SubscriptionExpiredModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

/**
 * Modal shown when trying to access blocked features
 * after subscription has expired
 */
const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  open,
  onClose,
  featureName,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoToBilling = () => {
    onClose();
    navigate('/billing');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BlockIcon color="error" />
          <Typography variant="h6" component="span">
            {t('subscription.expired_modal.title')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {featureName
            ? t('subscription.expired_modal.feature_blocked', { feature: featureName })
            : t('subscription.expired_modal.access_blocked')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t('subscription.expired_modal.update_prompt')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleGoToBilling} variant="contained" color="primary">
          {t('subscription.expired_modal.go_to_billing')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionExpiredModal;
