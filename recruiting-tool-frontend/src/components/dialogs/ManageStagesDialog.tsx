import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useBulkCreateStages,
  useUpdateStage,
  useDeleteStage,
} from "../../hooks/api/useStages";
import {
  Stage,
  StageType,
  STAGE_TYPE_COLORS,
  STAGE_TYPE_LABELS,
} from "../../types/stage.types";
import StageBuilder from "../job-positions/StageBuilder";
import AddStageDialog, { StageFormData } from "../job-positions/AddStageDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PersonIcon from "@mui/icons-material/Person";
import CodeIcon from "@mui/icons-material/Code";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface ManageStagesDialogProps {
  open: boolean;
  onClose: () => void;
  jobPositionUid: string;
  jobPositionTitle: string;
  existingStages?: Stage[];
}

const StageTypeIcon: React.FC<{ type: StageType }> = ({ type }) => {
  const iconProps = { sx: { fontSize: 20 } };
  switch (type) {
    case "INTERVIEW":
      return <PersonIcon {...iconProps} />;
    case "TECHNICAL_INTERVIEW":
      return <CodeIcon {...iconProps} />;
    case "FINAL_INTERVIEW":
      return <GroupIcon {...iconProps} />;
    case "OFFER":
      return <CheckCircleIcon {...iconProps} />;
    default:
      return <PersonIcon {...iconProps} />;
  }
};

/**
 * Enhanced dialog for managing stages of an existing job position.
 * Supports editing, deleting, and reordering existing stages,
 * as well as adding new stages.
 */
const ManageStagesDialog: React.FC<ManageStagesDialogProps> = ({
  open,
  onClose,
  jobPositionUid,
  jobPositionTitle,
  existingStages = [],
}) => {
  const { t } = useTranslation();

  // Local ordered copy of existing stages for reordering
  const [orderedStages, setOrderedStages] = useState<Stage[]>([]);

  // Track which stage UIDs have pending position updates
  const [pendingPositionUpdates, setPendingPositionUpdates] = useState<
    Set<string>
  >(new Set());

  // New stages to add (via StageBuilder)
  const [newStages, setNewStages] = useState<Omit<Stage, "uid" | "status">[]>(
    [],
  );

  // Edit dialog state for existing stages
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete dialog state for existing stages
  const [deletingStage, setDeletingStage] = useState<Stage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    mutate: bulkCreateStages,
    isPending: isCreating,
    isError: isCreateError,
  } = useBulkCreateStages();

  const {
    mutate: updateStage,
    isPending: isUpdating,
    isError: isUpdateError,
  } = useUpdateStage();

  const {
    mutate: deleteStage,
    isPending: isDeleting,
    isError: isDeleteError,
  } = useDeleteStage();

  const isSaving = isCreating || isUpdating || isDeleting;

  // Sync local ordered stages when existingStages prop changes
  useEffect(() => {
    const sorted = [...existingStages].sort((a, b) => a.position - b.position);
    setOrderedStages(sorted);
    setPendingPositionUpdates(new Set());
  }, [existingStages, open]);

  // --- Reorder handlers ---

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updated = [...orderedStages];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reindexed = updated.map((stage, i) => ({ ...stage, position: i }));
    setOrderedStages(reindexed);

    // Mark both swapped stages as having pending position updates
    setPendingPositionUpdates((prev) => {
      const next = new Set(prev);
      next.add(reindexed[index - 1].uid);
      next.add(reindexed[index].uid);
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === orderedStages.length - 1) return;

    const updated = [...orderedStages];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reindexed = updated.map((stage, i) => ({ ...stage, position: i }));
    setOrderedStages(reindexed);

    setPendingPositionUpdates((prev) => {
      const next = new Set(prev);
      next.add(reindexed[index].uid);
      next.add(reindexed[index + 1].uid);
      return next;
    });
  };

  // --- Edit handler for existing stages ---

  const handleEditExisting = (stageData: StageFormData) => {
    if (!editingStage) return;

    updateStage(
      {
        uid: editingStage.uid,
        data: {
          title: stageData.title,
          type: stageData.type,
          description: stageData.description,
          estimatedTime: stageData.estimatedTime,
        },
      },
      {
        onSuccess: () => {
          setEditingStage(null);
          setEditDialogOpen(false);
        },
      },
    );
  };

  // --- Delete handler for existing stages ---

  const handleDeleteExisting = () => {
    if (!deletingStage) return;

    deleteStage(deletingStage.uid, {
      onSuccess: () => {
        setDeletingStage(null);
        setDeleteDialogOpen(false);
      },
    });
  };

  // --- Save positions after reordering ---

  const handleSavePositions = () => {
    if (pendingPositionUpdates.size === 0) return;

    const stagesToUpdate = orderedStages.filter((s) =>
      pendingPositionUpdates.has(s.uid),
    );

    let remaining = stagesToUpdate.length;

    stagesToUpdate.forEach((stage) => {
      updateStage(
        { uid: stage.uid, data: { position: stage.position } },
        {
          onSuccess: () => {
            remaining -= 1;
            if (remaining === 0) {
              setPendingPositionUpdates(new Set());
            }
          },
        },
      );
    });
  };

  // --- Add new stages ---

  const handleAddNewStages = () => {
    if (newStages.length === 0) return;

    const stagesToCreate = newStages.map((stage, index) => ({
      ...stage,
      jobPositionUid,
      position: orderedStages.length + index,
    }));

    bulkCreateStages(stagesToCreate, {
      onSuccess: () => {
        setNewStages([]);
      },
    });
  };

  const handleClose = () => {
    setNewStages([]);
    setEditingStage(null);
    setEditDialogOpen(false);
    setDeletingStage(null);
    setDeleteDialogOpen(false);
    onClose();
  };

  const hasPendingPositions = pendingPositionUpdates.size > 0;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {t("manage_stages.title", { jobTitle: jobPositionTitle })}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Existing Stages Section */}
          {orderedStages.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t("manage_stages.current_stages", {
                  count: orderedStages.length,
                })}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2 }}
              >
                {t("manage_stages.current_stages_help")}
              </Typography>

              {/* Error alerts */}
              {isUpdateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t("manage_stages.failed_to_update")}
                </Alert>
              )}
              {isDeleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t("manage_stages.failed_to_delete")}
                </Alert>
              )}

              <Box>
                {orderedStages.map((stage, index) => {
                  const stageColor = STAGE_TYPE_COLORS[stage.type];
                  return (
                    <Paper
                      key={stage.uid}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderLeft: 4,
                        borderLeftColor: stageColor,
                        transition: "all 0.2s",
                        "&:hover": { boxShadow: 3 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        {/* Up/Down arrows */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0 || isSaving}
                            aria-label={t("manage_stages.move_up")}
                            sx={{ p: 0.5 }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveDown(index)}
                            disabled={
                              index === orderedStages.length - 1 || isSaving
                            }
                            aria-label={t("manage_stages.move_down")}
                            sx={{ p: 0.5 }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Stage content */}
                        <Box sx={{ flex: 1 }}>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{ fontWeight: 600 }}
                              >
                                {index + 1}. {stage.title}
                              </Typography>

                              {/* Edit / Delete buttons */}
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingStage(stage);
                                    setEditDialogOpen(true);
                                  }}
                                  disabled={isSaving}
                                  aria-label={t("stage_item.edit_aria")}
                                  sx={{ color: "primary.main" }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setDeletingStage(stage);
                                    setDeleteDialogOpen(true);
                                  }}
                                  disabled={isSaving}
                                  aria-label={t("stage_item.delete_aria")}
                                  sx={{ color: "error.main" }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            <Box>
                              <Chip
                                icon={<StageTypeIcon type={stage.type} />}
                                label={STAGE_TYPE_LABELS[stage.type]}
                                size="small"
                                sx={{
                                  bgcolor: `${stageColor}20`,
                                  color: stageColor,
                                  fontWeight: 500,
                                  "& .MuiChip-icon": { color: stageColor },
                                }}
                              />
                            </Box>

                            {stage.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {stage.description}
                              </Typography>
                            )}

                            {stage.estimatedTime && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {t("stage_item.estimated_time", {
                                    time: stage.estimatedTime,
                                  })}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              {/* Save reorder button */}
              {hasPendingPositions && (
                <Box
                  sx={{
                    mt: 1,
                    mb: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSavePositions}
                    disabled={isUpdating}
                    startIcon={
                      isUpdating ? <CircularProgress size={14} /> : undefined
                    }
                  >
                    {isUpdating
                      ? t("manage_stages.saving")
                      : t("manage_stages.save_changes")}
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* Add New Stages Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("manage_stages.add_new_stages")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {t("manage_stages.add_new_stages_help")}
            </Typography>

            {newStages.length === 0 && orderedStages.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t("manage_stages.no_stages_warning")}
              </Alert>
            )}

            <StageBuilder
              stages={newStages}
              onChange={setNewStages}
              minStages={0}
            />

            {isCreateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {t("manage_stages.failed_to_create")}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>

          {newStages.length > 0 && (
            <Button
              variant="contained"
              onClick={handleAddNewStages}
              disabled={isSaving}
            >
              {isCreating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {t("manage_stages.adding_stages")}
                </>
              ) : (
                t("manage_stages.add_stages_button", {
                  count: newStages.length,
                }) + (newStages.length !== 1 ? "s" : "")
              )}
            </Button>
          )}

          {newStages.length === 0 && (
            <Button
              variant="contained"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t("manage_stages.done")}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit existing stage dialog */}
      <AddStageDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingStage(null);
        }}
        onSave={handleEditExisting}
        initialData={
          editingStage
            ? {
                title: editingStage.title,
                type: editingStage.type,
                description: editingStage.description,
                estimatedTime: editingStage.estimatedTime,
              }
            : undefined
        }
        isEdit={true}
      />

      {/* Delete existing stage confirmation */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingStage(null);
        }}
        onConfirm={handleDeleteExisting}
        title={t("manage_stages.delete_stage_title")}
        message={
          deletingStage
            ? t("manage_stages.delete_stage_message", {
                title: deletingStage.title,
              })
            : ""
        }
      />
    </>
  );
};

export default ManageStagesDialog;
