import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import {
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  PersonOff as PersonOffIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common";
import {
  DemoBookingAdminItem,
  DemoOutcome,
  useAdminDemos,
  useSetDemoOutcome,
} from "../../api/adminDemos";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const truncate = (str: string | null, len: number): string => {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  count,
  icon,
  color,
  bgColor,
  isLoading,
}) => (
  <Card
    variant="outlined"
    sx={{
      flex: 1,
      minWidth: 140,
      borderLeft: `4px solid ${color}`,
      borderRadius: 2,
    }}
  >
    <CardContent
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        "&:last-child": { pb: 2 },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        {isLoading ? (
          <>
            <Skeleton width={40} height={28} />
            <Skeleton width={80} height={18} />
          </>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
              {count}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {label}
            </Typography>
          </>
        )}
      </Box>
    </CardContent>
  </Card>
);

// ─── Outcome Chip ─────────────────────────────────────────────────────────────

const OutcomeChip: React.FC<{ outcome: DemoOutcome; label: string }> = ({
  outcome,
  label,
}) => {
  switch (outcome) {
    case "COMPLETED":
      return (
        <Chip label={label} color="success" variant="filled" size="small" />
      );
    case "NO_SHOW":
      return <Chip label={label} color="error" variant="filled" size="small" />;
    case "RESCHEDULED":
      return (
        <Chip label={label} color="warning" variant="filled" size="small" />
      );
    case "CANCELED":
      return (
        <Chip label={label} color="default" variant="filled" size="small" />
      );
    default:
      return <Chip label={label} color="info" variant="filled" size="small" />;
  }
};

// ─── Set Outcome Dialog ───────────────────────────────────────────────────────

interface SetOutcomeDialogProps {
  open: boolean;
  item: DemoBookingAdminItem | null;
  onClose: () => void;
}

const SetOutcomeDialog: React.FC<SetOutcomeDialogProps> = ({
  open,
  item,
  onClose,
}) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useSetDemoOutcome();

  const [outcome, setOutcome] = useState<DemoOutcome>("PENDING");
  const [notes, setNotes] = useState("");

  const outcomeOptions: DemoOutcome[] = [
    "PENDING",
    "COMPLETED",
    "NO_SHOW",
    "RESCHEDULED",
    "CANCELED",
  ];

  const outcomeLabel = (o: DemoOutcome): string => {
    switch (o) {
      case "PENDING":
        return t("demo_manager.pending");
      case "COMPLETED":
        return t("demo_manager.completed");
      case "NO_SHOW":
        return t("demo_manager.no_show");
      case "RESCHEDULED":
        return t("demo_manager.rescheduled");
      case "CANCELED":
        return t("demo_manager.canceled");
    }
  };

  const handleOpen = () => {
    if (item) {
      setOutcome(item.outcome);
      setNotes(item.outcomeNotes ?? "");
    }
  };

  const handleSave = () => {
    if (!item) return;
    mutate(
      { uid: item.uid, outcome, notes: notes || undefined },
      {
        onSuccess: () => {
          toast.success(t("demo_manager.outcome_updated"));
          onClose();
        },
        onError: () => {
          toast.error(t("demo_manager.outcome_update_error"));
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
    >
      <DialogTitle>{t("demo_manager.set_outcome_title")}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        {item && (
          <Typography variant="body2" color="text.secondary">
            {item.prospectName ?? item.prospectEmail}
            {item.prospectCompany ? ` · ${item.prospectCompany}` : ""}
          </Typography>
        )}
        <FormControl fullWidth size="small">
          <InputLabel>{t("demo_manager.outcome")}</InputLabel>
          <Select
            value={outcome}
            label={t("demo_manager.outcome")}
            onChange={(e) => setOutcome(e.target.value as DemoOutcome)}
          >
            {outcomeOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {outcomeLabel(o)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={t("demo_manager.notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          size="small"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const DemoBookingManagerPage: React.FC = () => {
  const { t } = useTranslation();

  const [outcomeFilter, setOutcomeFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DemoBookingAdminItem | null>(
    null,
  );

  const { data, isLoading, isFetching } = useAdminDemos({
    page: page + 1,
    limit: pageSize,
    outcome: outcomeFilter || undefined,
  });

  const handleOutcomeFilterChange = (e: SelectChangeEvent<string>) => {
    setOutcomeFilter(e.target.value);
    setPage(0);
  };

  const handleSetOutcome = (item: DemoBookingAdminItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const outcomeLabel = (o: DemoOutcome): string => {
    switch (o) {
      case "PENDING":
        return t("demo_manager.pending");
      case "COMPLETED":
        return t("demo_manager.completed");
      case "NO_SHOW":
        return t("demo_manager.no_show");
      case "RESCHEDULED":
        return t("demo_manager.rescheduled");
      case "CANCELED":
        return t("demo_manager.canceled");
    }
  };

  const columns: GridColDef[] = [
    {
      field: "prospect",
      headerName: t("demo_manager.prospect"),
      flex: 1.4,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" fontWeight={600} lineHeight={1.4}>
            {params.row.prospectName ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary" lineHeight={1.4}>
            {params.row.prospectEmail}
          </Typography>
        </Box>
      ),
    },
    {
      field: "prospectCompany",
      headerName: t("demo_manager.company"),
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Typography variant="body2">
          {params.row.prospectCompany ?? "—"}
        </Typography>
      ),
    },
    {
      field: "scheduledAt",
      headerName: t("demo_manager.scheduled"),
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Typography variant="body2">
          {params.row.scheduledAt
            ? formatDate(params.row.scheduledAt)
            : t("demo_manager.not_scheduled")}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: t("demo_manager.created_at"),
      flex: 0.9,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Typography variant="body2">
          {formatDateShort(params.row.createdAt)}
        </Typography>
      ),
    },
    {
      field: "outcome",
      headerName: t("demo_manager.outcome"),
      flex: 0.9,
      minWidth: 130,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <OutcomeChip
          outcome={params.row.outcome}
          label={outcomeLabel(params.row.outcome)}
        />
      ),
    },
    {
      field: "outcomeNotes",
      headerName: t("demo_manager.notes"),
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Typography variant="body2" color="text.secondary">
          {truncate(params.row.outcomeNotes, 50)}
        </Typography>
      ),
    },
    {
      field: "linkedProspectUid",
      headerName: "CRM",
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) =>
        params.row.linkedProspectUid ? (
          <Chip
            label={t("demo_manager.in_crm")}
            color="success"
            variant="filled"
            size="small"
          />
        ) : (
          <Chip
            label={t("demo_manager.no_crm")}
            color="default"
            variant="filled"
            size="small"
          />
        ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DemoBookingAdminItem>) => (
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleSetOutcome(params.row)}
        >
          {t("demo_manager.set_outcome")}
        </Button>
      ),
    },
  ];

  const summary = data?.summary;
  const summaryCards = [
    {
      label: t("demo_manager.pending"),
      count: summary?.pending ?? 0,
      icon: <HourglassEmptyIcon fontSize="small" />,
      color: "#1565c0",
      bgColor: "#e3f2fd",
    },
    {
      label: t("demo_manager.completed"),
      count: summary?.completed ?? 0,
      icon: <CheckCircleIcon fontSize="small" />,
      color: "#2e7d32",
      bgColor: "#e8f5e9",
    },
    {
      label: t("demo_manager.no_show"),
      count: summary?.noShow ?? 0,
      icon: <PersonOffIcon fontSize="small" />,
      color: "#c62828",
      bgColor: "#ffebee",
    },
    {
      label: t("demo_manager.rescheduled"),
      count: summary?.rescheduled ?? 0,
      icon: <EventIcon fontSize="small" />,
      color: "#f57c00",
      bgColor: "#fff3e0",
    },
    {
      label: t("demo_manager.canceled"),
      count: summary?.canceled ?? 0,
      icon: <CancelIcon fontSize="small" />,
      color: "#546e7a",
      bgColor: "#eceff1",
    },
  ];

  return (
    <Box sx={{ width: "100%", py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 } }}>
      <PageHeader title="demo_manager.title" subtitle="demo_manager.subtitle" />

      {/* Summary Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            count={card.count}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            isLoading={isLoading}
          />
        ))}
      </Box>

      {/* Filter Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t("demo_manager.filter_outcome")}</InputLabel>
          <Select
            value={outcomeFilter}
            label={t("demo_manager.filter_outcome")}
            onChange={handleOutcomeFilterChange}
          >
            <MenuItem value="">
              {t("common.filter")} — {t("common.select")}
            </MenuItem>
            <MenuItem value="PENDING">{t("demo_manager.pending")}</MenuItem>
            <MenuItem value="COMPLETED">{t("demo_manager.completed")}</MenuItem>
            <MenuItem value="NO_SHOW">{t("demo_manager.no_show")}</MenuItem>
            <MenuItem value="RESCHEDULED">
              {t("demo_manager.rescheduled")}
            </MenuItem>
            <MenuItem value="CANCELED">{t("demo_manager.canceled")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={data?.demos ?? []}
          columns={columns}
          getRowId={(row) => row.uid}
          rowCount={data?.total ?? 0}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 20, 50]}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          autoHeight
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Set Outcome Dialog */}
      <SetOutcomeDialog
        open={dialogOpen}
        item={selectedItem}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
};

export default DemoBookingManagerPage;
