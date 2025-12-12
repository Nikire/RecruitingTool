import React, { useState } from "react";
import { IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslation } from "react-i18next";
import { useUnreadCount } from "../../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

/**
 * NotificationBell component displays notification icon with unread count badge
 */
const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: unreadCount = 0 } = useUnreadCount();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={t("notifications.bell.aria_label")}
        aria-controls={open ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <NotificationDropdown
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      />
    </>
  );
};

export default NotificationBell;
