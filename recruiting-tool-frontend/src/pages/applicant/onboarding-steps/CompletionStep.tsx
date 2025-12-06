import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from '../../../api/axios';
import { OnboardingData } from '../ApplicantOnboarding';

interface CompletionStepProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ data, onComplete, onBack }) => {
  const { t } = useTranslation();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      // Call backend to mark onboarding as complete
      await axios.post('/auth/complete-onboarding');

      // TODO: Save profile data to backend
      // This could be implemented as a separate endpoint for updating user profile
      console.log('Onboarding data:', data);

      // Navigate to careers page
      onComplete();
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.response?.data?.message || t('onboarding.completion.error'));
      setIsCompleting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 3,
        py: 4,
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />

      <Typography variant="h4" component="h1" gutterBottom>
        {t('onboarding.completion.title')}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
        {t('onboarding.completion.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2, textAlign: 'left', maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          {t('onboarding.completion.summary')}
        </Typography>

        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t('onboarding.completion.profile')}:</strong> {data.fullName || t('common.n_a')}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t('onboarding.completion.location')}:</strong> {data.location || t('common.n_a')}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>{t('onboarding.completion.resume')}:</strong>{' '}
            {data.resumeFile ? data.resumeFile.name : data.resumeSkipped ? t('onboarding.completion.skipped') : t('common.n_a')}
          </Typography>
          <Typography component="li" variant="body2">
            <strong>{t('onboarding.completion.preferences')}:</strong>{' '}
            {data.desiredJobTypes && data.desiredJobTypes.length > 0
              ? data.desiredJobTypes.map((type) => t(`job_type.${type.toLowerCase()}`)).join(', ')
              : t('common.n_a')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 4 }}>
        <Button onClick={onBack} disabled={isCompleting}>
          {t('common.back')}
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleComplete}
          disabled={isCompleting}
          startIcon={isCompleting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {isCompleting ? t('onboarding.completion.completing') : t('onboarding.completion.finish')}
        </Button>
      </Box>
    </Box>
  );
};

export default CompletionStep;
