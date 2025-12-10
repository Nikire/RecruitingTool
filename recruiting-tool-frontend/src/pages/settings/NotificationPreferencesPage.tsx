import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../../hooks/useNotificationPreferences';
import { UpdateNotificationPreferencesDto } from '../../types/notification-preferences.types';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationPreferencesPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: preferences, isLoading, isError } = useNotificationPreferences();
  const { mutate: updatePreferences, isPending } = useUpdateNotificationPreferences();

  // Local state for immediate UI feedback
  const [localPreferences, setLocalPreferences] = useState<UpdateNotificationPreferencesDto>({});

  // Update local state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        emailApplicationStatus: preferences.emailApplicationStatus,
        emailInterviewScheduled: preferences.emailInterviewScheduled,
        emailNewCandidate: preferences.emailNewCandidate,
        emailSystemAnnouncement: preferences.emailSystemAnnouncement,
        inAppApplicationStatus: preferences.inAppApplicationStatus,
        inAppInterviewScheduled: preferences.inAppInterviewScheduled,
        inAppNewCandidate: preferences.inAppNewCandidate,
        inAppSystemAnnouncement: preferences.inAppSystemAnnouncement,
      });
    }
  }, [preferences]);

  const handleToggle = (field: keyof UpdateNotificationPreferencesDto) => {
    const newValue = !localPreferences[field];
    const updatedPreferences = {
      ...localPreferences,
      [field]: newValue,
    };

    // Update local state immediately for responsive UI
    setLocalPreferences(updatedPreferences);

    // Send update to backend
    updatePreferences({ [field]: newValue });
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {t('notificationPreferences.loadError')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('notificationPreferences.title')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('notificationPreferences.description')}
      </Typography>

      {/* Email Notifications Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              {t('notificationPreferences.emailNotifications')}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t('notificationPreferences.emailDescription')}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.emailApplicationStatus ?? true}
                  onChange={() => handleToggle('emailApplicationStatus')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.emailApplicationStatus')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.emailInterviewScheduled ?? true}
                  onChange={() => handleToggle('emailInterviewScheduled')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.emailInterviewScheduled')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.emailNewCandidate ?? true}
                  onChange={() => handleToggle('emailNewCandidate')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.emailNewCandidate')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.emailSystemAnnouncement ?? true}
                  onChange={() => handleToggle('emailSystemAnnouncement')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.emailSystemAnnouncement')}
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* In-App Notifications Section */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <NotificationsIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6">
              {t('notificationPreferences.inAppNotifications')}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t('notificationPreferences.inAppDescription')}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.inAppApplicationStatus ?? true}
                  onChange={() => handleToggle('inAppApplicationStatus')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.inAppApplicationStatus')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.inAppInterviewScheduled ?? true}
                  onChange={() => handleToggle('inAppInterviewScheduled')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.inAppInterviewScheduled')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.inAppNewCandidate ?? true}
                  onChange={() => handleToggle('inAppNewCandidate')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.inAppNewCandidate')}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={localPreferences.inAppSystemAnnouncement ?? true}
                  onChange={() => handleToggle('inAppSystemAnnouncement')}
                  disabled={isPending}
                />
              }
              label={t('notificationPreferences.inAppSystemAnnouncement')}
            />
          </FormGroup>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NotificationPreferencesPage;
