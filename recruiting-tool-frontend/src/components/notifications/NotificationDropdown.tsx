import React from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

interface NotificationDropdownProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type: NotificationType): JSX.Element => {
  switch (type) {
    case NotificationType.INTERVIEW_SCHEDULED:
    case NotificationType.INTERVIEW_UPDATED:
    case NotificationType.INTERVIEW_CANCELLED:
      return <EventIcon />;
    case NotificationType.APPLICATION_RECEIVED:
    case NotificationType.APPLICATION_STATUS:
      return <DescriptionIcon />;
    case NotificationType.SYSTEM:
    default:
      return <InfoIcon />;
  }
};

/**
 * Get color for notification type
 */
const getNotificationColor = (type: NotificationType): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
  switch (type) {
    case NotificationType.INTERVIEW_SCHEDULED:
      return 'success';
    case NotificationType.INTERVIEW_UPDATED:
      return 'info';
    case NotificationType.INTERVIEW_CANCELLED:
      return 'error';
    case NotificationType.APPLICATION_RECEIVED:
      return 'primary';
    case NotificationType.APPLICATION_STATUS:
      return 'secondary';
    case NotificationType.SYSTEM:
    default:
      return 'info';
  }
};

/**
 * NotificationDropdown component displays list of notifications in a dropdown menu
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ anchorEl, open, onClose }) => {
  const { t, i18n } = useTranslation();
  const { data: notifications = [], isLoading, isError } = useNotifications({ limit: 10 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const locale = i18n.language === 'es' ? es : enUS;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.uid);
    }

    // Navigate based on notification metadata if needed
    // if (notification.metadata?.hiringProcessUid) {
    //   navigate(`/hiring-process/${notification.metadata.hiringProcessUid}`);
    // }

    onClose();
  };

  const handleDelete = (event: React.MouseEvent, uid: string) => {
    event.stopPropagation();
    deleteNotification(uid);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Menu
      id="notification-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 500,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{t('notifications.title')}</Typography>
        {notifications.length > 0 && !notifications.every((n) => n.isRead) && (
          <Button
            size="small"
            startIcon={isMarkingAll ? <CircularProgress size={16} /> : <DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            {t('notifications.mark_all_read')}
          </Button>
        )}
      </Box>

      <Divider />

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
          <Typography color="error">{t('notifications.errors.load_failed')}</Typography>
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && !isError && notifications.length === 0 && (
        <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="textSecondary">{t('notifications.empty')}</Typography>
        </Box>
      )}

      {/* Notifications list */}
      {!isLoading && !isError && notifications.length > 0 && (
        <Box sx={{ maxHeight: 380, overflow: 'auto' }}>
          {notifications.map((notification) => (
            <MenuItem
              key={notification.uid}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                alignItems: 'flex-start',
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    fontWeight={notification.isRead ? 'normal' : 'bold'}
                    sx={{ mb: 0.5 }}
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 0.5,
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale,
                      })}
                    </Typography>
                  </>
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={(e) => handleDelete(e, notification.uid)}
                sx={{ ml: 1 }}
                aria-label={t('notifications.delete')}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))}
        </Box>
      )}
    </Menu>
  );
};

export default NotificationDropdown;
