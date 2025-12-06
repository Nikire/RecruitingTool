import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';
import { useAcceptInvitation } from '../../hooks/useInvitations';
import { useUserAtom } from '../../hooks/api/state/useUserAtom';

const AcceptInvitationPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [user] = useUserAtom();

  const [hasAccepted, setHasAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: acceptInvitation, isPending, isSuccess, data } = useAcceptInvitation();

  useEffect(() => {
    // If user is not logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = `/invitations/accept/${token}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, token, navigate]);

  const handleAcceptInvitation = () => {
    if (!token) {
      setError(t('team.invalid_invitation_token'));
      return;
    }

    acceptInvitation(token, {
      onSuccess: () => {
        setHasAccepted(true);
        // Redirect to HR dashboard after 3 seconds
        setTimeout(() => {
          navigate('/hr/dashboard');
        }, 3000);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || t('errors.operation_failed'));
      },
    });
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (isPending) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">{t('team.accepting_invitation')}</Typography>
        </Paper>
      </Box>
    );
  }

  if (isSuccess && hasAccepted && data) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
          />
          <Typography variant="h4" gutterBottom>
            {t('team.invitation_accepted_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('team.invitation_accepted_message', {
              company: data.companyName,
              role: t(`roles.${data.role.toLowerCase()}`),
            })}
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('team.redirecting_to_dashboard')}
          </Alert>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
          }}
        >
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('team.invitation_error_title')}
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/hr/dashboard')}
          >
            {t('common.go_to_dashboard')}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Fetch invitation details from token (this would need to be implemented)
  // For now, show a simple acceptance UI
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          mx: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <BusinessIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t('team.join_team_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('team.join_team_description')}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {t('team.logged_in_as')}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="bold">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          {t('team.invitation_acceptance_info')}
        </Alert>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleAcceptInvitation}
          disabled={isPending}
        >
          {t('team.accept_invitation_button')}
        </Button>

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          {t('common.cancel')}
        </Button>
      </Paper>
    </Box>
  );
};

export default AcceptInvitationPage;
