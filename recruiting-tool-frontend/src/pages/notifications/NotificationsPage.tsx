import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  List,
  ListItemButton,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../../hooks/useNotifications";
import { useAcceptInvitation } from "../../hooks/useInvitations";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import { Notification } from "../../types/notification";
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationNavigationPath,
  isInvitationNotification,
} from "../../utils/notificationUtils";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const ITEMS_PER_PAGE = 20;

/**
 * NotificationsPage - Full notification inbox with filtering, pagination, and bulk actions
 */
const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language === "es" ? es : enUS;

  // State
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [invitationToDismiss, setInvitationToDismiss] =
    useState<Notification | null>(null);

  // Build query based on filter.
  // One extra row is requested so we can tell whether a next page exists —
  // the endpoint returns a plain array with no total count.
  const query =
    filter === "all"
      ? { limit: ITEMS_PER_PAGE + 1, skip: (page - 1) * ITEMS_PER_PAGE }
      : {
          isRead: filter === "read",
          limit: ITEMS_PER_PAGE + 1,
          skip: (page - 1) * ITEMS_PER_PAGE,
        };

  // Hooks
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useNotifications(query);
  // Server-side count, so the chip and the "mark all as read" button agree with
  // the bell badge instead of only reflecting the visible page.
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: acceptInvitation, isPending: isAcceptingInvitation } =
    useAcceptInvitation();

  // The extra row is only a "has more" probe, never rendered
  const pageItems = notifications.slice(0, ITEMS_PER_PAGE);
  const hasNextPage = notifications.length > ITEMS_PER_PAGE;
  const pageCount = hasNextPage ? page + 1 : page;

  // Handlers
  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: "all" | "unread" | "read" | null,
  ) => {
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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAcceptInvitation = (
    notification: Notification,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();

    const invitationToken = notification.metadata?.invitationToken as string;
    if (!invitationToken) {
      return;
    }

    acceptInvitation(invitationToken, {
      onSuccess: () => {
        // Delete the notification after successful acceptance
        deleteNotification(notification.uid);
        // The user's company/role just changed — take them to the workspace,
        // like AcceptInvitationPage does.
        navigate("/hr/dashboard");
      },
    });
  };

  const handleDismissInvitation = (
    notification: Notification,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    // There is no invitee-facing decline endpoint, so this only removes the
    // notification — hence the confirmation and the "dismiss" wording.
    setInvitationToDismiss(notification);
  };

  const handleConfirmDismissInvitation = () => {
    if (invitationToDismiss) {
      deleteNotification(invitationToDismiss.uid);
    }
    setInvitationToDismiss(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <NotificationsIcon fontSize="large" />
          {t("notifications.page.title")}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {t("notifications.page.subtitle")}
        </Typography>
      </Box>

      {/* Toolbar - Filters and Actions */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          {/* Filter Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FilterListIcon color="action" />
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilterChange}
              size="small"
              aria-label={t("notifications.page.filter_aria")}
            >
              <ToggleButton
                value="all"
                aria-label={t("notifications.page.filter_all")}
              >
                {t("notifications.page.all")}
              </ToggleButton>
              <ToggleButton
                value="unread"
                aria-label={t("notifications.page.filter_unread")}
              >
                {t("notifications.page.unread")}
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    size="small"
                    color="error"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </ToggleButton>
              <ToggleButton
                value="read"
                aria-label={t("notifications.page.filter_read")}
              >
                {t("notifications.page.read")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={
                isMarkingAll ? <CircularProgress size={16} /> : <DoneAllIcon />
              }
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {t("notifications.mark_all_read")}
            </Button>
          )}
        </Stack>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error" variant="h6">
            {t("notifications.errors.load_failed")}
          </Typography>
          <Typography color="textSecondary" sx={{ mt: 1 }}>
            {t("errors.try_again")}
          </Typography>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && pageItems.length === 0 && (
        <Card sx={{ p: 8, textAlign: "center" }}>
          <NotificationsIcon
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {filter === "all" && t("notifications.page.empty_all")}
            {filter === "unread" && t("notifications.page.empty_unread")}
            {filter === "read" && t("notifications.page.empty_read")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("notifications.page.empty_subtitle")}
          </Typography>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && !isError && pageItems.length > 0 && (
        <>
          <Card>
            <List sx={{ p: 0 }}>
              {pageItems.map((notification, index) => (
                <React.Fragment key={notification.uid}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 3,
                      alignItems: "flex-start",
                      backgroundColor: notification.isRead
                        ? "transparent"
                        : "action.hover",
                      borderLeft: notification.isRead ? "none" : "4px solid",
                      borderLeftColor: notification.isRead
                        ? "transparent"
                        : "primary.main",
                      "&:hover": {
                        backgroundColor: "action.selected",
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
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={notification.isRead ? "normal" : "bold"}
                            sx={{ flex: 1 }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                ml: 1,
                              }}
                              aria-label={t("notifications.unread_indicator")}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {/* Full Message (not truncated) */}
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            sx={{ mb: 1, whiteSpace: "pre-wrap" }}
                          >
                            {notification.message}
                          </Typography>

                          {/* Timestamp */}
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(notification.createdAt), "PPpp", {
                              locale,
                            })}
                          </Typography>
                        </>
                      }
                      sx={{ flex: 1, pr: 2 }}
                    />

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {/* Invitation Actions */}
                      {isInvitationNotification(notification) && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={(e) =>
                              handleAcceptInvitation(notification, e)
                            }
                            disabled={isAcceptingInvitation}
                          >
                            {t("notifications.invitation.accept")}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<CloseIcon />}
                            onClick={(e) =>
                              handleDismissInvitation(notification, e)
                            }
                          >
                            {t("notifications.invitation.dismiss")}
                          </Button>
                        </Box>
                      )}

                      {/* Delete Button */}
                      {!isInvitationNotification(notification) && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(notification.uid, e)}
                          aria-label={t("notifications.delete")}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItemButton>

                  {/* Divider between items */}
                  {index < pageItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </>
      )}

      {/* Pagination. The API returns no total count, so the last page is only
          known once it is reached — hence no "last page" button. */}
      {!isLoading && !isError && pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            aria-label={t("notifications.page.pagination_aria")}
          />
        </Box>
      )}

      {/* Dismissing an invitation only removes the notification, so confirm it */}
      <ConfirmDeleteDialog
        open={Boolean(invitationToDismiss)}
        onClose={() => setInvitationToDismiss(null)}
        onConfirm={handleConfirmDismissInvitation}
        title={t("notifications.invitation.dismiss_confirm_title")}
        message={t("notifications.invitation.dismiss_confirm_message")}
        itemName={invitationToDismiss?.title}
        confirmText={t("notifications.invitation.dismiss")}
      />
    </Container>
  );
};

export default NotificationsPage;
