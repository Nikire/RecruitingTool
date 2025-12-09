import React from 'react';
import {
  MenuItem,
  Typography,
  IconButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { Notification } from '../../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { getNotificationIcon, getNotificationColor } from '../../utils/notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onDelete: (uid: string) => void;
}

/**
 * NotificationItem component displays a single notification with read/unread status
 * and actionable navigation
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick, onDelete }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(notification.uid);
  };

  return (
    <MenuItem
      onClick={() => onClick(notification)}
      sx={{
        py: 1.5,
        px: 2,
        alignItems: 'flex-start',
        backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
        borderLeft: notification.isRead ? 'none' : '3px solid',
        borderLeftColor: notification.isRead ? 'transparent' : 'primary.main',
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight={notification.isRead ? 'normal' : 'bold'}
              sx={{ flex: 1 }}
            >
              {notification.title}
            </Typography>
            {!notification.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  ml: 1,
                }}
                aria-label={t('notifications.unread_indicator')}
              />
            )}
          </Box>
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
        onClick={handleDelete}
        sx={{ ml: 1 }}
        aria-label={t('notifications.delete')}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </MenuItem>
  );
};

export default NotificationItem;
