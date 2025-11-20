import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Schedule as DurationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Interview, InterviewStatus } from '../../types/interview.types';
import { useState } from 'react';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import { useCancelInterview, useDeleteInterview, useUpdateInterview } from '../../hooks/api/useInterview';

interface InterviewCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, onEdit }) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const cancelMutation = useCancelInterview();
  const deleteMutation = useDeleteInterview();
  const updateMutation = useUpdateInterview();

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.PENDING:
        return 'default';
      case InterviewStatus.SCHEDULED:
        return 'primary';
      case InterviewStatus.COMPLETED:
        return 'success';
      case InterviewStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getCardBorderColor = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        return '#1976d2';
      case InterviewStatus.COMPLETED:
        return '#2e7d32';
      case InterviewStatus.CANCELLED:
        return '#d32f2f';
      default:
        return '#e0e0e0';
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await updateMutation.mutateAsync({
        uid: interview.uid,
        data: { status: InterviewStatus.COMPLETED },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(interview.uid);
      setConfirmCancelOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ uid: interview.uid, stageUid: interview.stageUid });
      setConfirmDeleteOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Not set';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          borderLeft: 4,
          borderColor: getCardBorderColor(interview.status),
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" component="div">
                  Interview
                </Typography>
                <Chip
                  label={interview.status}
                  color={getStatusColor(interview.status)}
                  size="small"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {interview.status === InterviewStatus.SCHEDULED && (
                <Tooltip title="Mark as Completed">
                  <IconButton
                    size="small"
                    color="success"
                    onClick={handleMarkCompleted}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              {interview.status !== InterviewStatus.CANCELLED && interview.status !== InterviewStatus.COMPLETED && (
                <>
                  <Tooltip title="Edit Interview">
                    <IconButton size="small" color="primary" onClick={() => onEdit(interview)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel Interview">
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => setConfirmCancelOpen(true)}
                      disabled={cancelMutation.isPending}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Delete Interview">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {formatDate(interview.scheduledDate)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>Time:</strong> {interview.scheduledTime || 'Not set'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DurationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {formatDuration(interview.duration)}
              </Typography>
            </Box>

            {interview.meetingLink && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<LinkIcon />}
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Join Meeting
                  </Button>
                </Box>
              </>
            )}

            {interview.notes && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {interview.notes}
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Scheduled by: {interview.scheduledByName}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Interview"
        message="Are you sure you want to delete this interview? This action cannot be undone."
      />

      <ConfirmDeleteDialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Interview"
        message="Are you sure you want to cancel this interview? An email notification will be sent to the candidate."
      />
    </>
  );
};

export default InterviewCard;
