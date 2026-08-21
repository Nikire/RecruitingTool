import { useState } from "react";
import { Button, Box, FormControlLabel, Switch, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import { useAuthMe } from "../../hooks/api/useAuth";
import { useHiringProcessesSearch } from "../../hooks/api/state/useSearchState";
import { useSearchPaginationHandlers } from "../../hooks/useSearchPaginationHandlers";
import { useDialog } from "../../hooks/useDialog";
import CreateHiringProcessDialog from "../../components/dialogs/CreateHiringProcessDialog";
import { canManageResources } from "../../utils/permissions";
import {
  ClientFilterSelect,
  FilterBar,
  FilterBarFilters,
} from "../../components/filters";
import HiringProcessesList from "../../components/hiring-processes/HiringProcessesList";
import HiringProcessesGroupedList from "../../components/hiring-processes/HiringProcessesGroupedList";
import {
  AccessDeniedMessage,
  PageHeader,
  CenteredLoadingSpinner,
  QuotaBanner,
} from "../../components/common";

const HiringProcessesPage: React.FC = () => {
  const { t } = useTranslation();
  const createDialog = useDialog<never>();
  const { user, isLoading: userLoading } = useAuthMe();
  const [searchState, setSearchState] = useHiringProcessesSearch();
  const { page, limit, search, status } = searchState;
  const [groupByPosition, setGroupByPosition] = useState(true);
  // End-client filter. Kept in local state rather than the shared search atom so it does
  // not change the shape of a store other pages read.
  const [clientUid, setClientUid] = useState("");
  const [searchParams] = useSearchParams();
  const highlightUid = searchParams.get("highlight") ?? undefined;

  const canManage = canManageResources(user);

  // Call hooks before any early returns
  const { handlePageChange, handleLimitChange } =
    useSearchPaginationHandlers(setSearchState);

  // Wait for user data to load before checking permissions (fixes race condition)
  if (userLoading) {
    return <CenteredLoadingSpinner />;
  }

  // Check if user has access (HR, ADMIN, or SUPER_ADMIN)
  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  // Handle filter changes from FilterBar
  const handleFilterChange = (filters: FilterBarFilters) => {
    setSearchState({
      ...searchState,
      search: filters.search,
      status: filters.status as typeof searchState.status,
    });
  };

  // Resets every filter so the "no results" empty state has a way out
  const handleClearFilters = () => {
    setSearchState({
      ...searchState,
      search: "",
      status: "all",
      page: 1,
    });
    setClientUid("");
  };

  // Changing the client changes the result set, so go back to the first page.
  const handleClientChange = (nextClientUid: string) => {
    setClientUid(nextClientUid);
    setSearchState({ ...searchState, page: 1 });
  };

  const statusOptions = [
    { value: "OPEN", labelKey: "status.open" },
    { value: "IN_PROGRESS", labelKey: "status.in_progress" },
    { value: "CLOSED", labelKey: "status.closed" },
    { value: "CANCELLED", labelKey: "status.cancelled" },
    { value: "REJECTED", labelKey: "status.rejected" },
  ];

  return (
    <Box>
      <PageHeader
        title="hiring_processes.title"
        secondaryActions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createDialog.open}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minHeight: "44px",
              }}
              aria-label={t("hiring_processes.create_title")}
            >
              {t("hiring_processes.create_title")}
            </Button>
          ) : undefined
        }
      />

      <QuotaBanner
        resource="aiScoringCredits"
        labelKey="subscription.quota.ai_scoring_credits"
      />

      <FilterBar
        filters={{ search, status }}
        onChange={handleFilterChange}
        searchPlaceholder={t("hiring_processes.search_placeholder")}
        statusOptions={statusOptions}
        showStatusFilter
      />

      {/* Client filter + group-by toggle */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
          mt: 1,
          mb: 0.5,
          px: 0.5,
        }}
      >
        <ClientFilterSelect
          value={clientUid}
          onChange={handleClientChange}
          size="small"
        />
        <Tooltip title={t("hiring_processes.group.toggle_tooltip")}>
          <FormControlLabel
            control={
              <Switch
                checked={groupByPosition}
                onChange={(e) => setGroupByPosition(e.target.checked)}
                size="small"
                color="primary"
                inputProps={{
                  "aria-label": t("hiring_processes.group.toggle_aria"),
                }}
              />
            }
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: groupByPosition ? "primary.main" : "text.secondary",
                }}
              >
                <ViewAgendaOutlinedIcon sx={{ fontSize: 16 }} />
                {t("hiring_processes.group.toggle_label")}
              </Box>
            }
            labelPlacement="start"
            sx={{ mr: 0 }}
          />
        </Tooltip>
      </Box>

      {groupByPosition ? (
        <HiringProcessesGroupedList
          search={search}
          status={status}
          clientUid={clientUid}
          highlightUid={highlightUid}
        />
      ) : (
        <HiringProcessesList
          page={page}
          limit={limit}
          search={search}
          status={status}
          clientUid={clientUid}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onCreate={createDialog.open}
          onClearFilters={handleClearFilters}
        />
      )}

      <CreateHiringProcessDialog
        open={createDialog.isOpen}
        onClose={createDialog.close}
      />
    </Box>
  );
};

export default HiringProcessesPage;
