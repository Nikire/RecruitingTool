import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { Notification, GetNotificationsQuery, CreateNotificationDto } from '../types/notification';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';
export const UNREAD_COUNT_QUERY_KEY = 'notifications-unread-count';

/**
 * Hook to fetch notifications with pagination and filters
 */
export function useNotifications(query?: GetNotificationsQuery) {
  return useQuery<Notification[], Error>({
    queryKey: [NOTIFICATIONS_QUERY_KEY, query],
    queryFn: () => notificationService.getNotifications(query),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  return useQuery<number, Error>({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => notificationService.markAsRead(uid),
    onSuccess: () => {
      // Invalidate both notifications and unread count
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
      toast.error(t('notifications.errors.mark_read_failed'));
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
      toast.success(t('notifications.messages.all_marked_read', { count: data.count }));
    },
    onError: (error: any) => {
      console.error('Failed to mark all as read:', error);
      toast.error(t('notifications.errors.mark_all_read_failed'));
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (uid: string) => notificationService.deleteNotification(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
      toast.success(t('notifications.messages.deleted'));
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
      toast.error(t('notifications.errors.delete_failed'));
    },
  });
}

/**
 * Hook to create notification (admin use)
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: CreateNotificationDto) => notificationService.createNotification(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
      toast.success(t('notifications.messages.created'));
    },
    onError: (error: any) => {
      console.error('Failed to create notification:', error);
      toast.error(t('notifications.errors.create_failed'));
    },
  });
}
