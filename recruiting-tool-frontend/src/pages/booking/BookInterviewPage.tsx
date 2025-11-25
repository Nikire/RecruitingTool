import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { useAvailableSlots, useSelectTimeSlot } from '../../hooks/api/useTimeSlots';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const BookInterviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedSlotUid, setSelectedSlotUid] = useState<string | null>(null);

  const {
    data: availableSlots,
    isLoading,
    isError,
    error,
  } = useAvailableSlots(token || null);

  const { mutate: selectSlot, isPending: isSelecting } = useSelectTimeSlot();

  const handleSelectSlot = () => {
    if (!selectedSlotUid || !token) return;

    selectSlot(
      { token, data: { slotUid: selectedSlotUid } },
      {
        onSuccess: () => {
          // Redirect to success page or show success message
          navigate(`/booking-confirmed/${token}`);
        },
      }
    );
  };

  const formatSlotDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatSlotTime = (startStr: string, endStr: string) => {
    try {
      const start = format(parseISO(startStr), 'h:mm a');
      const end = format(parseISO(endStr), 'h:mm a');
      return `${start} - ${end}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('booking.loading_slots')}
        </Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{t('booking.error_title')}</Typography>
          <Typography>
            {error?.message || t('booking.error_invalid_token')}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="info">
          <Typography variant="h6">{t('booking.no_slots_title')}</Typography>
          <Typography>{t('booking.no_slots_message')}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <EventAvailableIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          {t('booking.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {t('booking.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {availableSlots.map((slot) => (
          <Grid item xs={12} sm={6} md={4} key={slot.uid}>
            <Paper
              elevation={selectedSlotUid === slot.uid ? 8 : 2}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: selectedSlotUid === slot.uid ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.3s',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => setSelectedSlotUid(slot.uid)}
            >
              <Box sx={{ textAlign: 'center' }}>
                {selectedSlotUid === slot.uid && (
                  <CheckCircleIcon
                    sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                  />
                )}
                <AccessTimeIcon
                  sx={{
                    fontSize: 40,
                    color: selectedSlotUid === slot.uid ? 'primary.main' : 'text.secondary',
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {formatSlotDate(slot.startTime)}
                </Typography>
                <Chip
                  label={formatSlotTime(slot.startTime, slot.endTime)}
                  color={selectedSlotUid === slot.uid ? 'primary' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSelectSlot}
          disabled={!selectedSlotUid || isSelecting}
          sx={{ px: 6, py: 2 }}
        >
          {isSelecting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {t('booking.confirming')}
            </>
          ) : (
            t('booking.confirm_selection')
          )}
        </Button>
      </Box>
    </Container>
  );
};

export default BookInterviewPage;
