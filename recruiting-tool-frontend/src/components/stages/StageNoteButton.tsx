import React, { useState } from "react";
import {
  Box,
  Popover,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { StageEvalNote } from "../../types/stage.types";
import StageNotePanel from "./StageNotePanel";

interface StageNoteButtonProps {
  hiringProcessUid: string;
  stageUid: string;
  stageTitle?: string;
  existingNote?: StageEvalNote | null;
}

const StageNoteButton: React.FC<StageNoteButtonProps> = ({
  hiringProcessUid,
  stageUid,
  stageTitle,
  existingNote,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const hasNote = !!existingNote;
  const tooltipTitle = hasNote
    ? t("stage_note.edit_note")
    : t("stage_note.add_note");

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return (
    <Box onClick={(e) => e.stopPropagation()}>
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
            onClick={handleOpen}
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

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: { width: 420, maxWidth: "calc(100vw - 32px)", p: 0 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {t("stage_note.dialog_title")}
              </Typography>
              {stageTitle && (
                <Typography variant="body2" color="text.secondary">
                  {stageTitle}
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={handleClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <StageNotePanel
            hiringProcessUid={hiringProcessUid}
            stageUid={stageUid}
            existingNote={existingNote}
            onClose={handleClose}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default StageNoteButton;
