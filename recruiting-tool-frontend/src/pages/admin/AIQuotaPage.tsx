import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Psychology as PsychologyIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAdminSubscriptions } from "../../hooks/api/useAdminSubscriptions";
import {
  useCompanyAIQuotas,
  useSetAIQuotaLimit,
} from "../../hooks/api/useAIQuota";
import type { AIQuotaResponseDto } from "../../types/ai-quota.types";
import type { AdminSubscriptionItem } from "../../types/subscription.types";

interface CompanyOption {
  companyUid: string;
  companyName: string;
}

interface EditDialogState {
  open: boolean;
  quota: AIQuotaResponseDto | null;
}

const AIQuotaPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    quota: null,
  });
  const [newLimit, setNewLimit] = useState<string>("");

  const { data: subscriptionsData, isLoading: isLoadingCompanies } =
    useAdminSubscriptions();

  const {
    data: quotas,
    isLoading: isLoadingQuotas,
    isError: isQuotasError,
  } = useCompanyAIQuotas(selectedCompany?.companyUid ?? null);

  const setQuotaLimit = useSetAIQuotaLimit();

  // Build unique company list from subscriptions
  const companyOptions: CompanyOption[] = subscriptionsData
    ? subscriptionsData.subscriptions
        .reduce<CompanyOption[]>((acc, sub: AdminSubscriptionItem) => {
          if (!acc.some((c) => c.companyUid === sub.companyUid)) {
            acc.push({
              companyUid: sub.companyUid,
              companyName: sub.companyName,
            });
          }
          return acc;
        }, [])
        .sort((a, b) => a.companyName.localeCompare(b.companyName))
    : [];

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
  };

  const getRemainingColor = (
    quota: AIQuotaResponseDto,
  ): "success" | "warning" | "error" => {
    if (quota.limit <= 0) return "success"; // unlimited
    const pct = (quota.remaining / quota.limit) * 100;
    if (pct > 50) return "success";
    if (pct >= 10) return "warning";
    return "error";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const openEditDialog = (quota: AIQuotaResponseDto) => {
    setEditDialog({ open: true, quota });
    setNewLimit(String(quota.limit));
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, quota: null });
    setNewLimit("");
  };

  const handleSaveLimit = async () => {
    if (!editDialog.quota || !selectedCompany) return;

    const limitValue = parseInt(newLimit, 10);
    if (isNaN(limitValue)) return;

    try {
      await setQuotaLimit.mutateAsync({
        companyUid: selectedCompany.companyUid,
        data: {
          quotaType: editDialog.quota.quotaType,
          limit: limitValue,
        },
      });
      toast.success(t("admin.ai_quota.updated_success"));
      closeEditDialog();
    } catch {
      toast.error(t("admin.ai_quota.load_error"));
    }
  };

  const columns: GridColDef<AIQuotaResponseDto>[] = [
    {
      field: "uid",
      headerName: t("admin.ai_quota.columns.quota_type"),
      flex: 0,
      width: 0,
      // Hidden — we show quotaType instead
    },
    {
      field: "quotaType",
      headerName: t("admin.ai_quota.columns.quota_type"),
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          variant="filled"
          icon={<PsychologyIcon />}
        />
      ),
    },
    {
      field: "companyUid",
      headerName: "Company UID",
      width: 170,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" noWrap sx={{ maxWidth: 110 }}>
              {params.value}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopyUid(params.value)}
              aria-label={t("common.actions")}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "used",
      headerName: t("admin.ai_quota.columns.used"),
      width: 130,
      renderCell: (params) => {
        const quota = params.row;
        const limitLabel = quota.limit <= 0 ? "∞" : String(quota.limit);
        return (
          <Typography variant="body2">
            {t("admin.ai_quota.usage_label", {
              used: quota.used,
              limit: limitLabel,
            })}
          </Typography>
        );
      },
    },
    {
      field: "remaining",
      headerName: t("admin.ai_quota.columns.remaining"),
      width: 140,
      renderCell: (params) => {
        const quota = params.row;
        const label = quota.limit <= 0 ? "∞" : String(quota.remaining);
        return (
          <Chip label={label} color={getRemainingColor(quota)} size="small" />
        );
      },
    },
    {
      field: "resetDate",
      headerName: t("admin.ai_quota.columns.reset_date"),
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.value)}</Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("admin.ai_quota.columns.actions"),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title={t("common.edit")}>
          <IconButton
            size="small"
            onClick={() => openEditDialog(params.row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  // Remove the hidden uid column
  const visibleColumns = columns.filter((c) => c.field !== "uid");

  return (
    <Box sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("admin.ai_quota.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("admin.ai_quota.description")}
        </Typography>
      </Box>

      {/* Company Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {isLoadingCompanies ? (
            <Skeleton variant="rectangular" height={56} />
          ) : (
            <Autocomplete<CompanyOption>
              options={companyOptions}
              getOptionLabel={(option) => option.companyName}
              value={selectedCompany}
              onChange={(_event, value) => setSelectedCompany(value)}
              isOptionEqualToValue={(option, value) =>
                option.companyUid === value.companyUid
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("admin.ai_quota.select_company")}
                  placeholder={t("admin.ai_quota.search_company")}
                  fullWidth
                />
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Quota Table */}
      <Card>
        <CardContent>
          {!selectedCompany ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                gap: 2,
                color: "text.secondary",
              }}
            >
              <PsychologyIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <Typography variant="body1">
                {t("admin.ai_quota.no_company_selected")}
              </Typography>
            </Box>
          ) : isQuotasError ? (
            <Alert severity="error">{t("admin.ai_quota.load_error")}</Alert>
          ) : isLoadingQuotas ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : quotas && quotas.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
                gap: 2,
                color: "text.secondary",
              }}
            >
              <PsychologyIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <Typography variant="body1">
                {t("admin.ai_quota.no_quotas")}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={quotas ?? []}
                columns={visibleColumns}
                getRowId={(row) => row.uid}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                disableRowSelectionOnClick
                sx={{
                  "& .MuiDataGrid-cell": { padding: "8px" },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "background.default",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("admin.ai_quota.edit_dialog.title")}</DialogTitle>
        <DialogContent>
          {editDialog.quota && (
            <Box
              sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("admin.ai_quota.edit_dialog.description", {
                  quotaType: editDialog.quota.quotaType,
                })}
              </Typography>
              <TextField
                label={t("admin.ai_quota.edit_dialog.new_limit")}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                type="number"
                fullWidth
                helperText={t("admin.ai_quota.edit_dialog.unlimited_hint")}
                inputProps={{ min: -1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>{t("common.cancel")}</Button>
          <Button
            onClick={handleSaveLimit}
            variant="contained"
            disabled={setQuotaLimit.isPending || newLimit === ""}
          >
            {setQuotaLimit.isPending
              ? t("common.saving")
              : t("admin.ai_quota.edit_dialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIQuotaPage;
