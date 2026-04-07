import { GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Paper,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EmailIcon from "@mui/icons-material/Email";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DataTable, DataTableColumn } from "../../components/shared/DataTable";
import { DateCell } from "../../components/tables";
import { ContactMessage } from "../../types/contact-message.types";
import {
  useContactMessages,
  useMarkContactMessageAsRead,
} from "../../hooks/api/useContactMessages";
import ContactMessageDetailDialog from "../../components/dialogs/ContactMessageDetailDialog";

const ContactMessagesPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError } = useContactMessages(page, limit);
  const { mutate: markAsRead, isPending: isMarkingAsRead } =
    useMarkContactMessageAsRead();

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const messages = data?.data ?? [];
  const totalRows = data?.total ?? 0;

  const handleMarkAsRead = (uid: string) => {
    markAsRead(uid);
  };

  const handleViewMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
  };

  const columns: DataTableColumn<ContactMessage>[] = [
    {
      field: "name",
      headerName: t("admin_contact.table_name"),
      flex: 1,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
      mobileRender: (msg: ContactMessage) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {msg.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {msg.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "company",
      headerName: t("admin_contact.table_company"),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.company || t("common.n_a")}
        </Typography>
      ),
    },
    {
      field: "message",
      headerName: t("admin_contact.table_message"),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 300,
          }}
        >
          {params.row.message.length > 80
            ? `${params.row.message.substring(0, 80)}...`
            : params.row.message}
        </Typography>
      ),
      mobileRender: (msg: ContactMessage) => (
        <Typography variant="body2" color="text.secondary">
          {msg.message.length > 100
            ? `${msg.message.substring(0, 100)}...`
            : msg.message}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: t("admin_contact.table_date"),
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <DateCell value={params.row.createdAt} />
      ),
    },
    {
      field: "isRead",
      headerName: t("admin_contact.table_status"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.row.isRead
              ? t("admin_contact.status_read")
              : t("admin_contact.status_unread")
          }
          size="small"
          color={params.row.isRead ? "default" : "primary"}
          variant={params.row.isRead ? "outlined" : "filled"}
          sx={{ fontSize: "0.75rem" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: t("admin_contact.table_actions"),
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={t("common.view")}>
            <IconButton
              size="small"
              onClick={() => handleViewMessage(params.row as ContactMessage)}
              aria-label={t("common.view")}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {!params.row.isRead && (
            <Tooltip title={t("admin_contact.mark_as_read")}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={isMarkingAsRead}
                  onClick={() => handleMarkAsRead(params.row.uid)}
                  aria-label={t("admin_contact.mark_as_read")}
                >
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      ),
      mobileRender: (msg: ContactMessage) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            onClick={() => handleViewMessage(msg)}
            aria-label={t("common.view")}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
          {!msg.isRead && (
            <IconButton
              size="small"
              color="primary"
              disabled={isMarkingAsRead}
              onClick={() => handleMarkAsRead(msg.uid)}
            >
              <MarkEmailReadIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 0.5 }}
          >
            <EmailIcon color="primary" />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              {t("admin_contact.page_title")}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={t("admin_contact.unread_count", { count: unreadCount })}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {t("admin_contact.page_subtitle")}
          </Typography>
        </Box>
      </Stack>

      {/* Messages Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <DataTable
          data={messages}
          columns={columns}
          getRowId={(row) => row.uid}
          loading={isLoading}
          error={isError}
          emptyMessage="admin_contact.no_messages"
          errorMessage="admin_contact.loading_error"
          onboardingKey="contact-messages-list"
          page={page}
          limit={limit}
          totalRows={totalRows}
          onPageChange={setPage}
          onLimitChange={setLimit}
          serverPagination={true}
          dataGridProps={{
            getRowClassName: (params) =>
              !params.row.isRead ? "unread-row" : "",
            sx: {
              "& .unread-row": {
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              },
            },
          }}
        />
      </Paper>

      <ContactMessageDetailDialog
        open={detailOpen}
        onClose={handleDetailClose}
        message={selectedMessage}
      />
    </Box>
  );
};

export default ContactMessagesPage;
