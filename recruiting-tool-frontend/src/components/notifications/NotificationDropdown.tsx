import React from "react";
import {
  Menu,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Badge,
  Link,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../../hooks/useNotifications";
import { Notification } from "../../types/notification";
import NotificationItem from "./NotificationItem";
import { getNotificationNavigationPath } from "../../utils/notificationUtils";

interface NotificationDropdownProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

/**
 * NotificationDropdown component displays list of notifications in a dropdown menu
 * Enhanced with actionable links and better UX
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: rawNotifications,
    isLoading,
    isError,
  } = useNotifications({ limit: 10 });
  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.uid);
    }

    // Navigate to the relevant page if path is available, otherwise go to notifications page
    const navigationPath = getNotificationNavigationPath(notification);
    navigate(navigationPath || "/notifications");
    onClose();
  };

  const handleDelete = (uid: string) => {
    deleteNotification(uid);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
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
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">{t("notifications.title")}</Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Box sx={{ width: 0 }} />
            </Badge>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={
              isMarkingAll ? <CircularProgress size={16} /> : <DoneAllIcon />
            }
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            {t("notifications.mark_all_read")}
          </Button>
        )}
      </Box>

      <Divider />

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {isError && (
        <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
          <Typography color="error">
            {t("notifications.errors.load_failed")}
          </Typography>
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && !isError && notifications.length === 0 && (
        <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
          <NotificationsIcon
            sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
          />
          <Typography color="textSecondary">
            {t("notifications.empty")}
          </Typography>
        </Box>
      )}

      {/* Notifications list */}
      {!isLoading && !isError && notifications.length > 0 && (
        <>
          <Box sx={{ maxHeight: 380, overflow: "auto" }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.uid}
                notification={notification}
                onClick={handleNotificationClick}
                onDelete={handleDelete}
              />
            ))}
          </Box>

          {/* Footer with "View all" link */}
          <Divider />
          <Box
            sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "center" }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={handleViewAll}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {t("notifications.view_all")}
              <OpenInNewIcon fontSize="small" />
            </Link>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationDropdown;
