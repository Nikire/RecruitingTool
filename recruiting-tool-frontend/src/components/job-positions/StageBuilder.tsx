import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import StageItem from "./StageItem";
import AddStageDialog, { StageFormData } from "./AddStageDialog";
import ConfirmDeleteDialog from "../dialogs/ConfirmDeleteDialog";
import { Stage, StageType } from "../../types/stage.types";

interface StageBuilderProps {
  stages: Omit<Stage, "uid" | "status">[];
  onChange: (stages: Omit<Stage, "uid" | "status">[]) => void;
  minStages?: number;
  maxStages?: number;
  error?: string;
}

interface StageTemplate {
  name: string;
  icon: React.ReactNode;
  stages: Omit<Stage, "uid" | "status">[];
}

// Stage templates will be created dynamically with i18n in the component

/**
 * Reusable component for building and managing stages in a job position.
 * Supports adding, editing, deleting, and reordering stages.
 * Includes templates for quick setup.
 */
const StageBuilder: React.FC<StageBuilderProps> = ({
  stages,
  onChange,
  minStages = 1,
  maxStages,
  error,
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [pendingTemplate, setPendingTemplate] = useState<StageTemplate | null>(
    null,
  );
  const [confirmTemplateOpen, setConfirmTemplateOpen] = useState(false);

  // Create stage templates with i18n
  const STAGE_TEMPLATES: StageTemplate[] = [
    {
      name: t("stages.template_data.basic.name"),
      icon: <PersonSearchIcon />,
      stages: [
        {
          title: t("stages.template_data.basic.screening.title"),
          type: "INTERVIEW" as StageType,
          description: t("stages.template_data.basic.screening.description"),
          position: 0,
          estimatedTime: 30,
        },
        {
          title: t("stages.template_data.basic.interview.title"),
          type: "INTERVIEW" as StageType,
          description: t("stages.template_data.basic.interview.description"),
          position: 1,
          estimatedTime: 60,
        },
        {
          title: t("stages.template_data.basic.offer.title"),
          type: "OFFER" as StageType,
          description: t("stages.template_data.basic.offer.description"),
          position: 2,
          estimatedTime: 15,
        },
      ],
    },
    {
      name: t("stages.template_data.technical.name"),
      icon: <EngineeringIcon />,
      stages: [
        {
          title: t("stages.template_data.technical.review.title"),
          type: "INTERVIEW" as StageType,
          description: t("stages.template_data.technical.review.description"),
          position: 0,
          estimatedTime: 20,
        },
        {
          title: t("stages.template_data.technical.technical.title"),
          type: "TECHNICAL_INTERVIEW" as StageType,
          description: t(
            "stages.template_data.technical.technical.description",
          ),
          position: 1,
          estimatedTime: 90,
        },
        {
          title: t("stages.template_data.technical.final.title"),
          type: "FINAL_INTERVIEW" as StageType,
          description: t("stages.template_data.technical.final.description"),
          position: 2,
          estimatedTime: 60,
        },
        {
          title: t("stages.template_data.technical.offer.title"),
          type: "OFFER" as StageType,
          description: t("stages.template_data.technical.offer.description"),
          position: 3,
          estimatedTime: 15,
        },
      ],
    },
    {
      name: t("stages.template_data.comprehensive.name"),
      icon: <BusinessCenterIcon />,
      stages: [
        {
          title: t("stages.template_data.comprehensive.review.title"),
          type: "INTERVIEW" as StageType,
          description: t(
            "stages.template_data.comprehensive.review.description",
          ),
          position: 0,
          estimatedTime: 15,
        },
        {
          title: t("stages.template_data.comprehensive.phone.title"),
          type: "INTERVIEW" as StageType,
          description: t(
            "stages.template_data.comprehensive.phone.description",
          ),
          position: 1,
          estimatedTime: 30,
        },
        {
          title: t("stages.template_data.comprehensive.assessment.title"),
          type: "TECHNICAL_INTERVIEW" as StageType,
          description: t(
            "stages.template_data.comprehensive.assessment.description",
          ),
          position: 2,
          estimatedTime: 120,
        },
        {
          title: t("stages.template_data.comprehensive.onsite.title"),
          type: "FINAL_INTERVIEW" as StageType,
          description: t(
            "stages.template_data.comprehensive.onsite.description",
          ),
          position: 3,
          estimatedTime: 240,
        },
        {
          title: t("stages.template_data.comprehensive.offer.title"),
          type: "OFFER" as StageType,
          description: t(
            "stages.template_data.comprehensive.offer.description",
          ),
          position: 4,
          estimatedTime: 30,
        },
      ],
    },
  ];

  const handleAddStage = (stageData: StageFormData) => {
    const newStage: Omit<Stage, "uid" | "status"> = {
      ...stageData,
      position: stages.length,
    };
    onChange([...stages, newStage]);
  };

  const handleEditStage = (stageData: StageFormData) => {
    if (editingIndex === null) return;

    const updatedStages = [...stages];
    updatedStages[editingIndex] = {
      ...updatedStages[editingIndex],
      ...stageData,
    };
    onChange(updatedStages);
    setEditingIndex(null);
  };

  const handleDeleteStage = () => {
    if (deleteIndex === null) return;

    const updatedStages = stages
      .filter((_, index) => index !== deleteIndex)
      .map((stage, index) => ({ ...stage, position: index }));

    onChange(updatedStages);
    setDeleteIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updatedStages = [...stages];
    [updatedStages[index - 1], updatedStages[index]] = [
      updatedStages[index],
      updatedStages[index - 1],
    ];

    onChange(updatedStages.map((stage, i) => ({ ...stage, position: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === stages.length - 1) return;

    const updatedStages = [...stages];
    [updatedStages[index], updatedStages[index + 1]] = [
      updatedStages[index + 1],
      updatedStages[index],
    ];

    onChange(updatedStages.map((stage, i) => ({ ...stage, position: i })));
  };

  const handleLoadTemplate = (template: StageTemplate) => {
    setTemplateMenuAnchor(null);
    if (stages.length > 0) {
      setPendingTemplate(template);
      setConfirmTemplateOpen(true);
    } else {
      onChange(template.stages);
    }
  };

  const handleConfirmTemplateSwitch = () => {
    if (pendingTemplate) {
      onChange(pendingTemplate.stages);
    }
    setPendingTemplate(null);
    setConfirmTemplateOpen(false);
  };

  const handleCancelTemplateSwitch = () => {
    setPendingTemplate(null);
    setConfirmTemplateOpen(false);
  };

  const getTotalEstimatedTime = () => {
    return stages.reduce(
      (total, stage) => total + (stage.estimatedTime || 0),
      0,
    );
  };

  const canAddMore = !maxStages || stages.length < maxStages;
  // Delete button is always available; form-level validation enforces minimum at submission
  const canDeleteMore = stages.length > 0;

  return (
    <Box>
      {/* Header with Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="div" gutterBottom>
            {t("stages.builder_title")}{" "}
            {minStages > 0 && (
              <Typography component="span" color="error">
                *
              </Typography>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t(
              stages.length === 1
                ? "stages.stages_configured"
                : "stages.stages_configured_plural",
              { count: stages.length },
            )}
            {stages.length > 0 &&
              ` • ${t("stages.total_time_minutes", { time: getTotalEstimatedTime() })}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
          >
            {t("stages.templates")}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingIndex(null);
              setDialogOpen(true);
            }}
            disabled={!canAddMore}
          >
            {t("stages.add_stage")}
          </Button>
        </Stack>
      </Box>

      {/* Template Menu */}
      <Menu
        anchorEl={templateMenuAnchor}
        open={Boolean(templateMenuAnchor)}
        onClose={() => setTemplateMenuAnchor(null)}
      >
        {STAGE_TEMPLATES.map((template, index) => (
          <MenuItem
            key={template.name}
            onClick={() => handleLoadTemplate(template)}
          >
            <ListItemIcon>{template.icon}</ListItemIcon>
            <ListItemText>
              {t(
                `stages.template_${index === 0 ? "basic" : index === 1 ? "technical" : "comprehensive"}`,
              )}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Divider sx={{ mb: 2 }} />

      {/* Validation Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {stages.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            minStages === 1
              ? "stages.no_stages_message"
              : "stages.no_stages_message_plural",
            { count: minStages },
          )}
        </Alert>
      )}

      {/* Stages List */}
      <Box>
        {stages.map((stage, index) => (
          <Box key={index} sx={{ position: "relative" }}>
            <StageItem
              stage={stage}
              index={index}
              onEdit={() => {
                setEditingIndex(index);
                setDialogOpen(true);
              }}
              onDelete={canDeleteMore ? () => setDeleteIndex(index) : undefined}
              showActions={true}
            />

            {/* Reorder Buttons */}
            {stages.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  right: -60,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  sx={{ minWidth: 40, px: 0 }}
                >
                  ↑
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === stages.length - 1}
                  sx={{ minWidth: 40, px: 0 }}
                >
                  ↓
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Info about minimum stages */}
      {stages.length < minStages && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t(
            minStages - stages.length === 1
              ? "stages.add_more_stages"
              : "stages.add_more_stages_plural",
            { count: minStages - stages.length },
          )}
        </Alert>
      )}

      {/* Add/Edit Stage Dialog */}
      <AddStageDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingIndex(null);
        }}
        onSave={editingIndex !== null ? handleEditStage : handleAddStage}
        initialData={editingIndex !== null ? stages[editingIndex] : undefined}
        isEdit={editingIndex !== null}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onClose={() => setDeleteIndex(null)}
        onConfirm={handleDeleteStage}
        title={t("stages.delete_stage_title")}
        message={
          deleteIndex !== null
            ? t("stages.delete_stage_message", {
                title: stages[deleteIndex]?.title,
              })
            : ""
        }
      />

      {/* Template Switch Confirmation Dialog */}
      <Dialog
        open={confirmTemplateOpen}
        onClose={handleCancelTemplateSwitch}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("stage_builder.switch_template_title")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("stage_builder.switch_template_message")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTemplateSwitch}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirmTemplateSwitch}
            variant="contained"
            color="warning"
          >
            {t("common.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StageBuilder;
