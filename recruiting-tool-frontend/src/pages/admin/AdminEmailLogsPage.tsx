import { useState, useEffect } from "react";
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/common/PageHeader";
import { useEmailLogs } from "../../hooks/api/useSystemSettings";

const AdminEmailLogsPage: React.FC = () => {
  const { t } = useTranslation();

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [emailType, setEmailType] = useState("");

  // Pagination state
  const [page, setPage] = useState(0); // MUI TablePagination is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page on filter changes
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(0);
  };

  const handleEmailTypeChange = (value: string) => {
    setEmailType(value);
    setPage(0);
  };

  const { data, isLoading } = useEmailLogs({
    page: page + 1, // API is 1-based
    limit: rowsPerPage,
    status: status || undefined,
    emailType: emailType || undefined,
    search: search || undefined,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader
        title={t("admin_email_logs.title")}
        subtitle={t("admin_email_logs.subtitle")}
        translate={false}
      />

      {/* Filters */}
      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mt: 3, mb: 2 }}>
        <TextField
          size="small"
          placeholder={t("admin_email_logs.filter_search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: 260 }}
        />

        <Select
          size="small"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          displayEmpty
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">{t("admin_email_logs.status_all")}</MenuItem>
          <MenuItem value="SENT">SENT</MenuItem>
          <MenuItem value="FAILED">FAILED</MenuItem>
        </Select>

        <TextField
          size="small"
          placeholder={t("admin_email_logs.filter_type")}
          value={emailType}
          onChange={(e) => handleEmailTypeChange(e.target.value)}
          sx={{ minWidth: 180 }}
        />
      </Stack>

      {/* Table */}
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("admin_email_logs.col_status")}</TableCell>
                <TableCell>{t("admin_email_logs.col_type")}</TableCell>
                <TableCell>{t("admin_email_logs.col_recipient")}</TableCell>
                <TableCell>{t("admin_email_logs.col_subject")}</TableCell>
                <TableCell>{t("admin_email_logs.col_sent_at")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton variant="rounded" width={56} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={120} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={160} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={200} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={140} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("admin_email_logs.no_logs")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.uid} hover>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === "SENT" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.emailType}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={row.recipientEmail}
                      >
                        {row.recipientEmail}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap title={row.subject}>
                        {row.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {new Date(row.sentAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage={t("admin_email_logs.rows_per_page")}
        />
      </Paper>
    </Box>
  );
};

export default AdminEmailLogsPage;
