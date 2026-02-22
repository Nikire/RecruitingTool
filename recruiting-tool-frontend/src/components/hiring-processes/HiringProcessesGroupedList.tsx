import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Divider,
  Skeleton,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useTranslation } from "react-i18next";
import {
  useListHiringProcesses,
  useDeleteHiringProcess,
} from "../../hooks/api/useHiringProcess";
import { HiringProcess } from "../../types/hiringProcess.types";
import { useNavigate } from "react-router-dom";
import UpdateHiringProcessDialog from "../dialogs/UpdateHiringProcessDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../utils/permissions";
import { getHiringProcessStatusColor } from "../../utils/statusColors";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { ActionsCell } from "../tables";

interface HiringProcessesGroupedListProps {
  page: number;
  limit: number;
  search: string;
  status?: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

interface JobPositionGroup {
  jobPositionUid: string | null;
  jobPositionTitle: string;
  processes: HiringProcess[];
}

const GroupHeader: React.FC<{
  group: JobPositionGroup;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ group, isExpanded, onToggle }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: "pointer",
        userSelect: "none",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
      aria-label={
        isExpanded
          ? t("hiring_processes.group.collapse", {
              title: group.jobPositionTitle,
            })
          : t("hiring_processes.group.expand", {
              title: group.jobPositionTitle,
            })
      }
    >
      <WorkOutlineIcon sx={{ color: "primary.main", fontSize: 20 }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
        {group.jobPositionTitle}
      </Typography>
      <Chip
        label={t("hiring_processes.group.count", {
          count: group.processes.length,
        })}
        size="small"
        color="primary"
        variant="outlined"
        sx={{ fontWeight: 500 }}
      />
      <IconButton
        size="small"
        aria-label={
          isExpanded
            ? t("hiring_processes.group.collapse_icon")
            : t("hiring_processes.group.expand_icon")
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Box>
  );
};

const ProcessRow: React.FC<{
  process: HiringProcess;
  canManage: boolean;
  onView: (process: HiringProcess) => void;
  onEdit: (process: HiringProcess) => void;
  onDelete: (process: HiringProcess) => void;
}> = ({ process, canManage, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 3,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: { xs: "wrap", md: "nowrap" },
        "&:last-child": {
          borderBottom: "none",
        },
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      {/* Title */}
      <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap title={process.title}>
          {process.title}
        </Typography>
      </Box>

      {/* Candidate */}
      <Box sx={{ flex: "1 1 160px", minWidth: 0 }}>
        {process.candidate ? (
          <Box>
            <Typography variant="body2" noWrap title={process.candidate.name}>
              {process.candidate.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              title={process.candidate.email}
            >
              {process.candidate.email}
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{ color: "error.main", fontWeight: 500 }}
          >
            {t("hiring_processes.no_candidate")}
          </Typography>
        )}
      </Box>

      {/* Company */}
      <Box sx={{ flex: "0 1 140px", minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {process.company?.name || t("common.n_a")}
        </Typography>
      </Box>

      {/* Stages */}
      <Box sx={{ flex: "0 0 80px" }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {`${process.stages?.length || 0} ${t("stages.title").toLowerCase()}`}
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ flex: "0 0 110px" }}>
        <Chip
          label={t(`status.${process.status.toLowerCase()}`)}
          color={getHiringProcessStatusColor(process.status)}
          size="small"
        />
      </Box>

      {/* Actions */}
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onView(process);
          }}
        >
          {t("common.view")}
        </Button>
        {canManage && (
          <ActionsCell
            onEdit={() => onEdit(process)}
            onDelete={() => onDelete(process)}
            showView={false}
          />
        )}
      </Box>
    </Box>
  );
};

const GroupSection: React.FC<{
  group: JobPositionGroup;
  canManage: boolean;
  onView: (process: HiringProcess) => void;
  onEdit: (process: HiringProcess) => void;
  onDelete: (process: HiringProcess) => void;
}> = ({ group, canManage, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2,
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      <GroupHeader
        group={group}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />
      <Divider />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit={false}>
        <Box>
          {group.processes.map((process) => (
            <ProcessRow
              key={process.uid}
              process={process}
              canManage={canManage}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

const HiringProcessesGroupedList: React.FC<
  HiringProcessesGroupedListProps
> = ({ page, limit, search, status }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const canManage = canManageResources(user);

  const updateDialog = useDialog<HiringProcess>();
  const deleteMutation = useDeleteHiringProcess();
  const deleteConfirm = useConfirmDelete<HiringProcess>(deleteMutation);

  const { data, isLoading, error } = useListHiringProcesses({
    page,
    limit,
    search,
    status,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const processes = (data?.data as HiringProcess[] | undefined) || [];

  const groups = useMemo<JobPositionGroup[]>(() => {
    const groupMap = new Map<string, JobPositionGroup>();

    for (const process of processes) {
      const key = process.jobPosition?.uid ?? "__no_position__";
      const title =
        process.jobPosition?.title ??
        t("hiring_processes.group.no_position");

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          jobPositionUid: process.jobPosition?.uid ?? null,
          jobPositionTitle: title,
          processes: [],
        });
      }
      groupMap.get(key)!.processes.push(process);
    }

    // Sort groups: named positions first (alphabetically), then the "no position" group
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.jobPositionUid === null) return 1;
      if (b.jobPositionUid === null) return -1;
      return a.jobPositionTitle.localeCompare(b.jobPositionTitle);
    });
  }, [processes, t]);

  const handleViewClick = (process: HiringProcess) => {
    navigate(`/hiring-process/${process.uid}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        {[1, 2, 3].map((i) => (
          <Paper key={i} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={200} height={28} />
              <Box sx={{ flexGrow: 1 }} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
            <Divider />
            {[1, 2].map((j) => (
              <Box
                key={j}
                sx={{
                  px: 3,
                  py: 1.5,
                  display: "flex",
                  gap: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Skeleton variant="text" width="25%" />
                <Skeleton variant="text" width="20%" />
                <Skeleton variant="text" width="15%" />
                <Skeleton variant="text" width="10%" />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            ))}
          </Paper>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t("errors.fetch_failed")}
      </Alert>
    );
  }

  if (processes.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
        }}
      >
        <WorkOutlineIcon sx={{ fontSize: 64, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          {t("hiring_processes.no_processes")}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mt: 2 }}>
        {/* Column headers (desktop only) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "1 1 180px", textTransform: "uppercase" }}
          >
            {t("hiring_processes.group.column_title")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "1 1 160px", textTransform: "uppercase" }}
          >
            {t("candidates.title")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 1 140px", textTransform: "uppercase" }}
          >
            {t("companies.title")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 0 80px", textTransform: "uppercase" }}
          >
            {t("stages.title")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 0 110px", textTransform: "uppercase" }}
          >
            {t("hiring_processes.group.column_status")}
          </Typography>
          <Box sx={{ flex: "0 0 auto", minWidth: 110 }} />
        </Box>

        {groups.map((group) => (
          <GroupSection
            key={group.jobPositionUid ?? "__no_position__"}
            group={group}
            canManage={canManage}
            onView={handleViewClick}
            onEdit={(process) => updateDialog.openWith(process)}
            onDelete={(process) => deleteConfirm.confirmDelete(process)}
          />
        ))}
      </Box>

      <UpdateHiringProcessDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        hiringProcess={updateDialog.selectedItem}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("dialogs.delete_confirmation")}
        message={t("hiring_processes.delete_message")}
        itemName={deleteConfirm.selectedItem?.title}
        isDeleting={deleteConfirm.isDeleting}
      />
    </>
  );
};

export default HiringProcessesGroupedList;
