import React, { useState } from "react";
import { Box, Collapse, IconButton, Tooltip, Typography } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useTranslation } from "react-i18next";
import { StageEvalNote } from "../../types/stage.types";
import StageNotePanel from "./StageNotePanel";

interface StageNoteButtonProps {
  hiringProcessUid: string;
  stageUid: string;
  existingNote?: StageEvalNote | null;
}

const StageNoteButton: React.FC<StageNoteButtonProps> = ({
  hiringProcessUid,
  stageUid,
  existingNote,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const hasNote = !!existingNote;
  const tooltipTitle = hasNote
    ? t("stage_note.edit_note")
    : t("stage_note.add_note");

  const handleToggle = (e: React.MouseEvent) => {
    // Stop propagation so clicking the button doesn't expand/collapse the accordion
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}
    >
      {/* Trigger button row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {hasNote && existingNote.rating > 0 && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ fontWeight: 600, lineHeight: 1 }}
          >
            {"★ " + existingNote.rating}
          </Typography>
        )}
        <Tooltip title={tooltipTitle}>
          <IconButton
            size="small"
            onClick={handleToggle}
            color={hasNote ? "primary" : "default"}
            aria-label={tooltipTitle}
          >
            <EditNoteIcon
              fontSize="small"
              sx={{ opacity: hasNote ? 1 : 0.5 }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Inline panel */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, minWidth: 320, maxWidth: 480 }}>
          <StageNotePanel
            hiringProcessUid={hiringProcessUid}
            stageUid={stageUid}
            existingNote={existingNote}
            onClose={() => setOpen(false)}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default StageNoteButton;
