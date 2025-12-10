import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import { Notification } from '../../types/notification';
import { getNotificationIcon, getNotificationColor, getNotificationNavigationPath } from '../../utils/notificationUtils';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

/**
 * NotificationsPage - Full notification inbox with filtering, pagination, and bulk actions
 */
const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language === 'es' ? es : enUS;

  // State
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);

  // Build query based on filter
  const query =
    filter === 'all'
      ? { limit: ITEMS_PER_PAGE, skip: (page - 1) * ITEMS_PER_PAGE }
      : { isRead: filter === 'read', limit: ITEMS_PER_PAGE, skip: (page - 1) * ITEMS_PER_PAGE };

  // Hooks
  const { data: notifications = [], isLoading, isError } = useNotifications(query);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handlers
  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: 'all' | 'unread' | 'read' | null) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1); // Reset to first page when filter changes
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.uid);
    }

    // Navigate to the relevant page if path is available
    const navigationPath = getNotificationNavigationPath(notification);
    if (navigationPath) {
      navigate(navigationPath);
    }
  };

  const handleDelete = (uid: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteNotification(uid);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total pages (mock for now - ideally backend should return total count)
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon fontSize="large" />
          {t('notifications.page.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t('notifications.page.subtitle')}
        </Typography>
      </Box>

      {/* Toolbar - Filters and Actions */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          {/* Filter Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterListIcon color="action" />
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              size="small"
              aria-label={t('notifications.page.filter_aria')}
            >
              <ToggleButton value="all" aria-label={t('notifications.page.filter_all')}>
                {t('notifications.page.all')}
              </ToggleButton>
              <ToggleButton value="unread" aria-label={t('notifications.page.filter_unread')}>
                {t('notifications.page.unread')}
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" color="error" sx={{ ml: 1, height: 20 }} />
                )}
              </ToggleButton>
              <ToggleButton value="read" aria-label={t('notifications.page.filter_read')}>
                {t('notifications.page.read')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={isMarkingAll ? <CircularProgress size={16} /> : <DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {t('notifications.mark_all_read')}
            </Button>
          )}
        </Stack>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {t('notifications.errors.load_failed')}
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            {t('errors.try_again')}
          </Typography>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && notifications.length === 0 && (
        <Card sx={{ p: 8, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {filter === 'all' && t('notifications.page.empty_all')}
            {filter === 'unread' && t('notifications.page.empty_unread')}
            {filter === 'read' && t('notifications.page.empty_read')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('notifications.page.empty_subtitle')}
          </Typography>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <>
          <Card>
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.uid}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 3,
                      alignItems: 'flex-start',
                      backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                      borderLeft: notification.isRead ? 'none' : '4px solid',
                      borderLeftColor: notification.isRead ? 'transparent' : 'primary.main',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    {/* Avatar with Icon */}
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getNotificationColor(notification.type)}.main`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>

                    {/* Notification Content */}
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={notification.isRead ? 'normal' : 'bold'}
                            sx={{ flex: 1 }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
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
                          {/* Full Message (not truncated) */}
                          <Typography variant="body2" color="textPrimary" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                            {notification.message}
                          </Typography>

                          {/* Timestamp */}
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(notification.createdAt), 'PPpp', { locale })}
                          </Typography>
                        </>
                      }
                      sx={{ flex: 1, pr: 2 }}
                    />

                    {/* Delete Button */}
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(notification.uid, e)}
                      aria-label={t('notifications.delete')}
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>

                  {/* Divider between items */}
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage;
