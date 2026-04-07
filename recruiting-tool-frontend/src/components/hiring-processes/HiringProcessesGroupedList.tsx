import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Divider,
  Skeleton,
  Alert,
  CircularProgress,
  Tooltip,
  TablePagination,
  keyframes,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import { useTranslation } from "react-i18next";
import {
  useListHiringProcessesGrouped,
  useDeleteHiringProcess,
} from "../../hooks/api/useHiringProcess";
import { useRankings, useScoreCandidate } from "../../hooks/api/useAi";
import {
  HiringProcess,
  HiringProcessGroup,
} from "../../types/hiringProcess.types";
import {
  RankedCandidateDto,
  getScoreTier,
  getScoreTierColor,
} from "../../types/ai-ranking";
import { useNavigate } from "react-router-dom";
import UpdateHiringProcessDialog from "../dialogs/UpdateHiringProcessDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { canManageResources, hasAnyRole } from "../../utils/permissions";
import { getHiringProcessStatusColor } from "../../utils/statusColors";
import { useDialog } from "../../hooks/useDialog";
import { useConfirmDelete } from "../../hooks/useConfirmDelete";
import { ActionsCell } from "../tables";
import { UserRoles } from "../../types/user.types";

const AI_SCORING_ROLES = [
  UserRoles.HR_MANAGER,
  UserRoles.COMPANY_OWNER,
  UserRoles.ADMIN,
  UserRoles.SUPER_ADMIN,
];

interface HiringProcessesGroupedListProps {
  search: string;
  status?: string;
  highlightUid?: string;
}

// Score chip shown on each process row
const ScoreChip: React.FC<{
  score: RankedCandidateDto | undefined;
  isScoring: boolean;
  canScore: boolean;
  jobPositionUid: string | null;
  candidateUid: string | undefined;
  onScore: (candidateUid: string, jobPositionUid: string) => void;
}> = ({
  score,
  isScoring,
  canScore,
  jobPositionUid,
  candidateUid,
  onScore,
}) => {
  const { t } = useTranslation();

  if (!jobPositionUid || !candidateUid) return null;

  const handleScore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onScore(candidateUid, jobPositionUid);
  };

  if (isScoring) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (score) {
    const tier = getScoreTier(score.overallScore);
    const color = getScoreTierColor(tier);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip
          title={`${t("ai_scoring.skills")}: ${score.skillsScore} | ${t("ai_scoring.experience")}: ${score.experienceScore} | ${t("ai_scoring.education")}: ${score.educationScore}`}
        >
          <Chip
            label={score.overallScore}
            color={color}
            size="small"
            sx={{ fontWeight: 600, minWidth: 40, cursor: "default" }}
          />
        </Tooltip>
        {canScore && (
          <Tooltip title={t("ai_scoring.re_analyze")}>
            <IconButton
              size="small"
              onClick={handleScore}
              sx={{ p: 0.25 }}
              aria-label={t("ai_scoring.re_analyze")}
            >
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  if (canScore) {
    return (
      <Tooltip title={t("ai_scoring.analyze")}>
        <IconButton
          size="small"
          onClick={handleScore}
          color="primary"
          aria-label={t("ai_scoring.analyze")}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Typography variant="caption" color="text.disabled">
      {t("ai_scoring.not_scored")}
    </Typography>
  );
};

const GroupHeader: React.FC<{
  group: HiringProcessGroup;
  scoreMap: Map<string, RankedCandidateDto>;
  isSortedByScore: boolean;
  onToggleSortByScore: () => void;
}> = ({ group, scoreMap, isSortedByScore, onToggleSortByScore }) => {
  const { t } = useTranslation();

  const scoredCount = group.processes.filter(
    (p) => p.candidate?.uid && scoreMap.has(p.candidate.uid),
  ).length;
  const totalCount = group.processes.length;

  const avgScore = useMemo(() => {
    if (scoredCount === 0) return null;
    const scores = group.processes
      .map((p) =>
        p.candidate?.uid ? scoreMap.get(p.candidate.uid) : undefined,
      )
      .filter((s): s is RankedCandidateDto => !!s)
      .map((s) => s.overallScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [group.processes, scoreMap, scoredCount]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
      }}
    >
      <WorkOutlineIcon sx={{ color: "primary.main", fontSize: 20 }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
        {group.jobPositionTitle}
      </Typography>

      {/* Scored count chip */}
      {group.jobPositionUid && (
        <Chip
          label={t("ai_scoring.scored_count", {
            scored: scoredCount,
            total: totalCount,
          })}
          size="small"
          variant="filled"
          sx={{ fontWeight: 500, fontSize: "0.7rem" }}
        />
      )}

      {/* Average score chip */}
      {avgScore !== null && (
        <Chip
          label={`${t("ai_scoring.avg_score")}: ${avgScore}`}
          size="small"
          color={getScoreTierColor(getScoreTier(avgScore))}
          sx={{ fontWeight: 600 }}
        />
      )}

      <Chip
        label={t("hiring_processes.group.count", {
          count: group.processes.length,
        })}
        size="small"
        color="primary"
        variant="filled"
        sx={{ fontWeight: 500 }}
      />

      {/* Sort by score toggle */}
      {group.jobPositionUid && scoredCount > 0 && (
        <Tooltip title={t("ai_scoring.sort_by_score")}>
          <IconButton
            size="small"
            color={isSortedByScore ? "primary" : "default"}
            onClick={onToggleSortByScore}
            aria-label={t("ai_scoring.sort_by_score")}
            aria-pressed={isSortedByScore}
          >
            <SortIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const highlightPulse = keyframes`
  0%   { box-shadow: inset 0 0 0 2px #1976d2, background-color: rgba(25, 118, 210, 0.12); }
  60%  { box-shadow: inset 0 0 0 2px #1976d2, background-color: rgba(25, 118, 210, 0.12); }
  100% { box-shadow: inset 0 0 0 0px transparent, background-color: transparent; }
`;

const ProcessRow: React.FC<{
  process: HiringProcess;
  canManage: boolean;
  canScore: boolean;
  score: RankedCandidateDto | undefined;
  jobPositionUid: string | null;
  isScoringThisCandidate: boolean;
  isHighlighted: boolean;
  rowRef?: React.Ref<HTMLDivElement>;
  onView: (process: HiringProcess) => void;
  onEdit: (process: HiringProcess) => void;
  onDelete: (process: HiringProcess) => void;
  onScore: (candidateUid: string, jobPositionUid: string) => void;
}> = ({
  process,
  canManage,
  canScore,
  score,
  jobPositionUid,
  isScoringThisCandidate,
  isHighlighted,
  rowRef,
  onView,
  onEdit,
  onDelete,
  onScore,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      ref={rowRef}
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
        ...(isHighlighted && {
          animation: `${highlightPulse} 2s ease-out forwards`,
        }),
      }}
    >
      {/* Title */}
      <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          title={process.title}
        >
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

      {/* Status */}
      <Box sx={{ flex: "0 0 110px" }}>
        <Chip
          label={t(`status.${process.status.toLowerCase()}`)}
          color={getHiringProcessStatusColor(process.status)}
          size="small"
        />
      </Box>

      {/* AI Score */}
      <Box sx={{ flex: "0 0 80px", display: "flex", alignItems: "center" }}>
        <ScoreChip
          score={score}
          isScoring={isScoringThisCandidate}
          canScore={canScore}
          jobPositionUid={jobPositionUid}
          candidateUid={process.candidate?.uid}
          onScore={onScore}
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
          variant="contained"
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
  group: HiringProcessGroup;
  canManage: boolean;
  canScore: boolean;
  scoringCandidateUids: Set<string>;
  highlightUid?: string;
  onHighlightRef: (uid: string, el: HTMLDivElement | null) => void;
  onView: (process: HiringProcess) => void;
  onEdit: (process: HiringProcess) => void;
  onDelete: (process: HiringProcess) => void;
  onScore: (candidateUid: string, jobPositionUid: string) => void;
}> = ({
  group,
  canManage,
  canScore,
  scoringCandidateUids,
  highlightUid,
  onHighlightRef,
  onView,
  onEdit,
  onDelete,
  onScore,
}) => {
  const [isSortedByScore, setIsSortedByScore] = useState(false);

  const { data: rankings } = useRankings(group.jobPositionUid ?? undefined);

  const scoreMap = useMemo<Map<string, RankedCandidateDto>>(() => {
    const map = new Map<string, RankedCandidateDto>();
    if (rankings) {
      for (const r of rankings) {
        map.set(r.candidateUid, r);
      }
    }
    return map;
  }, [rankings]);

  const sortedProcesses = useMemo(() => {
    if (!isSortedByScore) return group.processes;
    return [...group.processes].sort((a, b) => {
      const scoreA = a.candidate?.uid
        ? (scoreMap.get(a.candidate.uid)?.overallScore ?? -1)
        : -1;
      const scoreB = b.candidate?.uid
        ? (scoreMap.get(b.candidate.uid)?.overallScore ?? -1)
        : -1;
      return scoreB - scoreA;
    });
  }, [group.processes, isSortedByScore, scoreMap]);

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
        scoreMap={scoreMap}
        isSortedByScore={isSortedByScore}
        onToggleSortByScore={() => setIsSortedByScore((prev) => !prev)}
      />
      <Divider />
      <Box>
        {sortedProcesses.map((process) => (
          <ProcessRow
            key={process.uid}
            process={process}
            canManage={canManage}
            canScore={canScore}
            score={
              process.candidate?.uid
                ? scoreMap.get(process.candidate.uid)
                : undefined
            }
            jobPositionUid={group.jobPositionUid}
            isScoringThisCandidate={
              !!process.candidate?.uid &&
              scoringCandidateUids.has(process.candidate.uid)
            }
            isHighlighted={process.uid === highlightUid}
            rowRef={
              process.uid === highlightUid
                ? (el) => onHighlightRef(process.uid, el)
                : undefined
            }
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onScore={onScore}
          />
        ))}
      </Box>
    </Paper>
  );
};

const HiringProcessesGroupedList: React.FC<HiringProcessesGroupedListProps> = ({
  search,
  status,
  highlightUid,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const canManage = canManageResources(user);
  const canScore = hasAnyRole(user, AI_SCORING_ROLES);

  // Ref callback map for highlighted rows — scroll once data arrives
  const highlightElRef = useRef<HTMLDivElement | null>(null);

  const handleHighlightRef = useCallback(
    (_uid: string, el: HTMLDivElement | null) => {
      if (el && highlightUid) {
        highlightElRef.current = el;
      }
    },
    [highlightUid],
  );

  const [page, setPage] = useState(0); // TablePagination is 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to page 1 when search or status filters change
  useEffect(() => {
    setPage(0);
  }, [search, status]);

  const updateDialog = useDialog<HiringProcess>();
  const deleteMutation = useDeleteHiringProcess();
  const deleteConfirm = useConfirmDelete<HiringProcess>(deleteMutation);

  const scoreCandidate = useScoreCandidate();
  const [scoringCandidateUids, setScoringCandidateUids] = useState<Set<string>>(
    new Set(),
  );

  const { data, isLoading, error } = useListHiringProcessesGrouped({
    page: page + 1, // backend is 1-indexed
    limit: rowsPerPage,
    search,
    status,
  });

  // Scroll to highlighted row once data loads and the ref is set
  useEffect(() => {
    if (!highlightUid || isLoading) return;
    // Use a short timeout to allow the DOM to paint after data arrives
    const timer = setTimeout(() => {
      if (highlightElRef.current) {
        highlightElRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightUid, isLoading, data]);

  const handleViewClick = (process: HiringProcess) => {
    navigate(`/hiring-process/${process.uid}`);
  };

  const handleScore = (candidateUid: string, jobPositionUid: string) => {
    setScoringCandidateUids((prev) => new Set(prev).add(candidateUid));
    scoreCandidate.mutate(
      { candidateUid, jobPositionUid },
      {
        onSettled: () =>
          setScoringCandidateUids((prev) => {
            const next = new Set(prev);
            next.delete(candidateUid);
            return next;
          }),
      },
    );
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        {[1, 2, 3].map((i) => (
          <Paper key={i} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
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

  const groups = data?.data ?? [];
  const total = data?.total ?? 0;

  if (total === 0 && !isLoading) {
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
            sx={{ flex: "0 0 110px", textTransform: "uppercase" }}
          >
            {t("hiring_processes.group.column_status")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: "0 0 80px", textTransform: "uppercase" }}
          >
            {t("ai_scoring.score")}
          </Typography>
          <Box sx={{ flex: "0 0 auto", minWidth: 110 }} />
        </Box>

        {groups.map((group) => (
          <GroupSection
            key={group.jobPositionUid ?? "__no_position__"}
            group={group}
            canManage={canManage}
            canScore={canScore}
            scoringCandidateUids={scoringCandidateUids}
            highlightUid={highlightUid}
            onHighlightRef={handleHighlightRef}
            onView={handleViewClick}
            onEdit={(process) => updateDialog.openWith(process)}
            onDelete={(process) => deleteConfirm.confirmDelete(process)}
            onScore={handleScore}
          />
        ))}
      </Box>

      {/* Pagination */}
      {total > 0 && (
        <Paper variant="outlined" sx={{ mt: 1 }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t("hiring_processes.group.positions_per_page")}
            labelDisplayedRows={({ from, to, count }) =>
              t("pagination.showing", { start: from, end: to, total: count })
            }
            aria-label={t("aria.pagination_controls")}
          />
        </Paper>
      )}

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
