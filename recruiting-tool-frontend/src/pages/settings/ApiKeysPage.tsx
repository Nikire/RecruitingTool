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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import KeyIcon from "@mui/icons-material/Key";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
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

const BASE_URL = "https://api.borderlessats.com";

/** Today as YYYY-MM-DD in local time, for the expiry date field's lower bound. */
const todayIso = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const CodeBlock = ({ children }: { children: string }) => (
  <Box
    component="pre"
    sx={{
      bgcolor: "grey.900",
      color: "grey.100",
      borderRadius: 1,
      p: 1.5,
      fontSize: "0.75rem",
      fontFamily: "monospace",
      overflowX: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      m: 0,
      lineHeight: 1.6,
    }}
  >
    <code>{children}</code>
  </Box>
);

const ApiKeysPage = () => {
  const { t } = useTranslation();

  const minExpiryDate = todayIso();

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
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

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
        expiresAt: data.expiresAt || undefined,
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

  // --- Copy snippet handler ---
  const handleCopySnippet = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSnippet(key);
      setTimeout(() => setCopiedSnippet(null), 2000);
    });
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

  // --- Code snippets ---
  const curlSnippet = `curl ${BASE_URL}/api/v1/candidates \\
  -H "X-API-Key: blss_live_YOUR_KEY_HERE"`;

  const jsSnippet = `const res = await fetch(
  '${BASE_URL}/api/v1/candidates',
  { headers: { 'X-API-Key': 'blss_live_YOUR_KEY' } }
);
const { data } = await res.json();`;

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
              : t("apiKeys.status.inactive")
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
              : t("apiKeys.status.inactive")
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
      mobileRender: (key) => (
        <Typography variant="body2" color="text.secondary">
          {t("apiKeys.columns.lastUsed")}: {formatDate(key.lastUsedAt)}
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
      mobileRender: (key) => (
        <Typography variant="body2" color="text.secondary">
          {t("apiKeys.columns.expires")}: {formatDate(key.expiresAt)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("apiKeys.columns.actions"),
      width: 160,
      sortable: false,
      // Icon buttons rather than text buttons: three translated labels
      // ("Desactivar", "Renombrar", "Revocar") overflowed the fixed-width
      // DataGrid cell, which clips its content, hiding the last action.
      renderCell: (params) => {
        const key = params.row as ApiKey;
        const toggleLabel = key.isActive
          ? t("apiKeys.actions.deactivate")
          : t("apiKeys.actions.activate");
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={toggleLabel}>
              <span>
                <IconButton
                  size="small"
                  aria-label={toggleLabel}
                  onClick={() => handleToggleActive(key)}
                  disabled={isUpdating}
                  color={key.isActive ? "default" : "success"}
                >
                  <PowerSettingsNewIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t("apiKeys.actions.rename")}>
              <IconButton
                size="small"
                aria-label={t("apiKeys.actions.rename")}
                onClick={() => handleOpenRenameDialog(key)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Revoking is only meaningful while the key still grants access. */}
            {key.isActive && (
              <Tooltip title={t("apiKeys.actions.revoke")}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={t("apiKeys.actions.revoke")}
                    onClick={() => handleOpenRevokeDialog(key)}
                    disabled={isRevoking}
                  >
                    <DeleteForeverIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      },
      mobileRender: (key) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleToggleActive(key)}
            disabled={isUpdating}
          >
            {key.isActive
              ? t("apiKeys.actions.deactivate")
              : t("apiKeys.actions.activate")}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenRenameDialog(key)}
          >
            {t("apiKeys.actions.rename")}
          </Button>
          {key.isActive && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleOpenRevokeDialog(key)}
              disabled={isRevoking}
            >
              {t("apiKeys.actions.revoke")}
            </Button>
          )}
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
          mb: 3,
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

      {/* Quick Start Docs Accordion */}
      <Accordion
        defaultExpanded={(apiKeys ?? []).length === 0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MenuBookIcon color="primary" fontSize="small" />
            <Typography fontWeight={600}>{t("apiKeys.docs.title")}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            {/* Left column: auth + endpoints */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t("apiKeys.docs.baseUrl")}
              </Typography>
              <CodeBlock>{BASE_URL}</CodeBlock>

              <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                {t("apiKeys.docs.authTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("apiKeys.docs.authDescription")}
              </Typography>
              <CodeBlock>{"X-API-Key: blss_live_..."}</CodeBlock>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 1, fontSize: "0.75rem" }}
              >
                {t("apiKeys.docs.authAlternative")}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                {t("apiKeys.docs.endpointsTitle")}
              </Typography>
              <List dense disablePadding>
                {[
                  { key: "candidates", path: "/api/v1/candidates" },
                  { key: "jobPositions", path: "/api/v1/job-positions" },
                  { key: "applications", path: "/api/v1/applications" },
                  { key: "webhooks", path: "/api/v1/webhooks" },
                ].map((ep) => (
                  <ListItem key={ep.key} disableGutters sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <CircleIcon sx={{ fontSize: 6, color: "primary.main" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              color: "primary.main",
                            }}
                          >
                            {ep.path}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {" — "}
                            {t(`apiKeys.docs.${ep.key}`)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Right column: code examples */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="subtitle2">
                  {t("apiKeys.docs.exampleTitle")} (curl)
                </Typography>
                <Tooltip
                  title={
                    copiedSnippet === "curl"
                      ? t("apiKeys.createdDialog.copied")
                      : t("apiKeys.createdDialog.copy")
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopySnippet(curlSnippet, "curl")}
                  >
                    {copiedSnippet === "curl" ? (
                      <CheckIcon fontSize="small" color="success" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <CodeBlock>{curlSnippet}</CodeBlock>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 0.5,
                  mt: 2,
                }}
              >
                <Typography variant="subtitle2">
                  {t("apiKeys.docs.exampleTitle")} (JavaScript)
                </Typography>
                <Tooltip
                  title={
                    copiedSnippet === "js"
                      ? t("apiKeys.createdDialog.copied")
                      : t("apiKeys.createdDialog.copy")
                  }
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopySnippet(jsSnippet, "js")}
                  >
                    {copiedSnippet === "js" ? (
                      <CheckIcon fontSize="small" color="success" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <CodeBlock>{jsSnippet}</CodeBlock>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  href={`${BASE_URL}/api/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  size="small"
                  variant="outlined"
                >
                  {t("apiKeys.docs.viewDocs")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Table */}
      <DataTable
        data={apiKeys || []}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={isError}
        emptyMessage="apiKeys.noKeys"
        emptyIcon={<KeyIcon sx={{ fontSize: 40, color: "text.secondary" }} />}
        emptyTitle="apiKeys.noKeys"
        emptyDescription="apiKeys.noKeysDescription"
        emptyAction={{
          label: "apiKeys.createKey",
          onClick: () => setCreateDialogOpen(true),
          startIcon: <AddIcon />,
        }}
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
              // A key that expires in the past would be born unusable.
              inputProps={{ min: minExpiryDate }}
              {...createForm.register("expiresAt", {
                validate: (value) =>
                  !value ||
                  value >= minExpiryDate ||
                  t("apiKeys.createDialog.expiresInPast"),
              })}
              error={!!createForm.formState.errors.expiresAt}
              helperText={createForm.formState.errors.expiresAt?.message}
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
