import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import KeyIcon from "@mui/icons-material/Key";
import { DataTable, DataTableColumn } from "../../components/shared/DataTable";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useRevokeApiKey,
} from "../../hooks/api/useApiKeys";
import { ApiKey, ApiKeyCreated } from "../../api/apiKeys";
import { useForm } from "react-hook-form";

interface CreateApiKeyFormData {
  name: string;
  expiresAt: string;
}

interface RenameApiKeyFormData {
  name: string;
}

const ApiKeysPage = () => {
  const { t } = useTranslation();

  const { data: apiKeys, isLoading, isError } = useApiKeys();
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey();
  const { mutate: updateApiKey, isPending: isUpdating } = useUpdateApiKey();
  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey();

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Created key dialog state (shows raw key after creation)
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [createdKeyDialogOpen, setCreatedKeyDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Revoke confirmation dialog state
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);

  // Rename dialog state
  const [renameTarget, setRenameTarget] = useState<ApiKey | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const createForm = useForm<CreateApiKeyFormData>({
    defaultValues: { name: "", expiresAt: "" },
  });

  const renameForm = useForm<RenameApiKeyFormData>({
    defaultValues: { name: "" },
  });

  // --- Create dialog handlers ---
  const handleOpenCreateDialog = () => {
    createForm.reset({ name: "", expiresAt: "" });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    createForm.reset();
  };

  const handleCreateSubmit = (data: CreateApiKeyFormData) => {
    createApiKey(
      {
        name: data.name.trim(),
        expiresAt: data.expiresAt ? data.expiresAt : undefined,
      },
      {
        onSuccess: (created) => {
          setCreateDialogOpen(false);
          createForm.reset();
          setCreatedKey(created);
          setCreatedKeyDialogOpen(true);
        },
      },
    );
  };

  // --- Created key dialog handlers ---
  const handleCopyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey.rawKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCloseCreatedKeyDialog = () => {
    setCreatedKeyDialogOpen(false);
    setCreatedKey(null);
    setCopied(false);
  };

  // --- Revoke handlers ---
  const handleOpenRevokeDialog = (key: ApiKey) => {
    setRevokeTarget(key);
    setRevokeDialogOpen(true);
  };

  const handleCloseRevokeDialog = () => {
    setRevokeDialogOpen(false);
    setRevokeTarget(null);
  };

  const handleConfirmRevoke = () => {
    if (!revokeTarget) return;
    revokeApiKey(revokeTarget.uid, {
      onSuccess: () => {
        setRevokeDialogOpen(false);
        setRevokeTarget(null);
      },
    });
  };

  // --- Rename handlers ---
  const handleOpenRenameDialog = (key: ApiKey) => {
    setRenameTarget(key);
    renameForm.reset({ name: key.name });
    setRenameDialogOpen(true);
  };

  const handleCloseRenameDialog = () => {
    setRenameDialogOpen(false);
    setRenameTarget(null);
    renameForm.reset();
  };

  const handleRenameSubmit = (data: RenameApiKeyFormData) => {
    if (!renameTarget) return;
    updateApiKey(
      { uid: renameTarget.uid, data: { name: data.name.trim() } },
      {
        onSuccess: () => {
          setRenameDialogOpen(false);
          setRenameTarget(null);
          renameForm.reset();
        },
      },
    );
  };

  // --- Toggle active/inactive ---
  const handleToggleActive = (key: ApiKey) => {
    updateApiKey({ uid: key.uid, data: { isActive: !key.isActive } });
  };

  // --- Format helpers ---
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("apiKeys.never");
    return new Date(dateStr).toLocaleDateString();
  };

  // --- Table columns ---
  const columns: DataTableColumn<ApiKey>[] = [
    {
      field: "name",
      headerName: t("apiKeys.columns.name"),
      flex: 1,
      minWidth: 150,
      mobileRender: (key) => (
        <Typography variant="subtitle2" fontWeight={600}>
          {key.name}
        </Typography>
      ),
    },
    {
      field: "keyPrefix",
      headerName: t("apiKeys.columns.prefix"),
      width: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
        >
          {params.value}
        </Typography>
      ),
      mobileRender: (key) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: "text.secondary",
          }}
        >
          {key.keyPrefix}
        </Typography>
      ),
    },
    {
      field: "isActive",
      headerName: t("apiKeys.columns.status"),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.value
              ? t("apiKeys.status.active")
              : t("apiKeys.status.revoked")
          }
          color={params.value ? "success" : "default"}
          variant="filled"
          size="small"
        />
      ),
      mobileRender: (key) => (
        <Chip
          label={
            key.isActive
              ? t("apiKeys.status.active")
              : t("apiKeys.status.revoked")
          }
          color={key.isActive ? "success" : "default"}
          variant="filled"
          size="small"
        />
      ),
    },
    {
      field: "lastUsedAt",
      headerName: t("apiKeys.columns.lastUsed"),
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value as string | null)}
        </Typography>
      ),
    },
    {
      field: "expiresAt",
      headerName: t("apiKeys.columns.expires"),
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value as string | null)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("apiKeys.columns.actions"),
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const key = params.row as ApiKey;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip
              title={
                key.isActive
                  ? t("apiKeys.actions.deactivate")
                  : t("apiKeys.actions.activate")
              }
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleToggleActive(key)}
                  disabled={isUpdating}
                  sx={{ fontSize: "0.7rem", px: 1 }}
                >
                  {key.isActive
                    ? t("apiKeys.actions.deactivate")
                    : t("apiKeys.actions.activate")}
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={t("apiKeys.actions.rename")}>
              <IconButton
                size="small"
                onClick={() => handleOpenRenameDialog(key)}
              >
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600 }}>
                  {t("apiKeys.actions.rename")}
                </Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title={t("apiKeys.actions.revoke")}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleOpenRevokeDialog(key)}
                  disabled={isRevoking}
                  sx={{ fontSize: "0.7rem", px: 1 }}
                >
                  {t("apiKeys.actions.revoke")}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        );
      },
      mobileRender: (key) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenRenameDialog(key)}
          >
            {t("apiKeys.actions.rename")}
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => handleOpenRevokeDialog(key)}
          >
            {t("apiKeys.actions.revoke")}
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {t("apiKeys.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("apiKeys.description")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{ flexShrink: 0 }}
        >
          {t("apiKeys.createKey")}
        </Button>
      </Box>

      {/* Table */}
      <DataTable
        data={apiKeys || []}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={isError}
        emptyMessage="apiKeys.noKeys"
        onboardingKey="api-keys-list"
        dataGridProps={{
          sx: {
            "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
          },
        }}
      />

      {/* Create API Key Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon color="primary" />
          {t("apiKeys.createDialog.title")}
        </DialogTitle>
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
          <DialogContent>
            <TextField
              label={t("apiKeys.createDialog.nameLabel")}
              placeholder={t("apiKeys.createDialog.namePlaceholder")}
              fullWidth
              margin="normal"
              autoFocus
              {...createForm.register("name", {
                required: t("validation.required"),
                minLength: {
                  value: 1,
                  message: t("validation.min_length", { min: 1 }),
                },
              })}
              error={!!createForm.formState.errors.name}
              helperText={createForm.formState.errors.name?.message}
            />
            <TextField
              label={t("apiKeys.createDialog.expiresLabel")}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...createForm.register("expiresAt")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              startIcon={
                isCreating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : undefined
              }
            >
              {isCreating
                ? t("common.creating")
                : t("apiKeys.createDialog.submit")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Created Key Dialog - shows rawKey once */}
      <Dialog
        open={createdKeyDialogOpen}
        onClose={handleCloseCreatedKeyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon color="success" />
          {t("apiKeys.createdDialog.title")}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("apiKeys.createdDialog.warning")}
          </Alert>
          {createdKey && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  flexGrow: 1,
                  fontSize: "0.8rem",
                }}
              >
                {createdKey.rawKey}
              </Typography>
              <Tooltip
                title={
                  copied
                    ? t("apiKeys.createdDialog.copied")
                    : t("apiKeys.createdDialog.copy")
                }
              >
                <IconButton
                  onClick={handleCopyKey}
                  size="small"
                  color={copied ? "success" : "default"}
                >
                  {copied ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleCloseCreatedKeyDialog}>
            {t("apiKeys.createdDialog.done")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={revokeDialogOpen}
        onClose={handleCloseRevokeDialog}
        onConfirm={handleConfirmRevoke}
        title={t("apiKeys.revokeDialog.title")}
        message={t("apiKeys.revokeDialog.message", {
          name: revokeTarget?.name ?? "",
        })}
        isDeleting={isRevoking}
        confirmText={t("apiKeys.revokeDialog.confirm")}
        cancelText={t("apiKeys.revokeDialog.cancel")}
      />

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={handleCloseRenameDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("apiKeys.renameDialog.title")}</DialogTitle>
        <form onSubmit={renameForm.handleSubmit(handleRenameSubmit)}>
          <DialogContent>
            <TextField
              label={t("apiKeys.createDialog.nameLabel")}
              fullWidth
              margin="normal"
              autoFocus
              {...renameForm.register("name", {
                required: t("validation.required"),
              })}
              error={!!renameForm.formState.errors.name}
              helperText={renameForm.formState.errors.name?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRenameDialog} disabled={isUpdating}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isUpdating}
              startIcon={
                isUpdating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : undefined
              }
            >
              {isUpdating ? t("common.saving") : t("common.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ApiKeysPage;
