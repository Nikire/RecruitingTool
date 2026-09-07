import React, { useState } from "react";
import { Box, ButtonBase, Fab, IconButton, Tooltip, Zoom } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import FeedbackModal from "./FeedbackModal";

const STORAGE_KEY = "feedbackButtonHidden";

const FeedbackButton: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true",
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
    setHidden(true);
    setHovered(false);
  };

  const handleRestore = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHidden(false);
  };

  if (hidden) {
    return (
      <Tooltip title={t("feedback.restore_label")} placement="left">
        <ButtonBase
          onClick={handleRestore}
          aria-label={t("feedback.restore_label")}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 0,
            zIndex: 1000,
            width: 12,
            height: 36,
            minWidth: 0,
            p: 0,
            bgcolor: "primary.main",
            borderRadius: "4px 0 0 4px",
            opacity: 0.35,
            transition: "opacity 0.2s",
            "&:hover, &:focus-visible": { opacity: 0.75 },
          }}
        />
      </Tooltip>
    );
  }

  return (
    <>
      <Box
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Tooltip title={t("feedback.button_label")} placement="left">
          <Zoom in={true} timeout={300}>
            <Fab
              color="primary"
              aria-label={t("feedback.button_label")}
              onClick={handleOpen}
            >
              <FeedbackIcon />
            </Fab>
          </Zoom>
        </Tooltip>

        <Tooltip title={t("feedback.hide_label")} placement="top">
          <IconButton
            onClick={handleHide}
            aria-label={t("feedback.hide_label")}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 20,
              height: 20,
              p: 0,
              bgcolor: "grey.700",
              borderRadius: "50%",
              color: "common.white",
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? "auto" : "none",
              "&:hover, &:focus-visible": {
                bgcolor: "error.main",
                opacity: 1,
                pointerEvents: "auto",
              },
              transition: "background-color 0.15s, opacity 0.15s",
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <FeedbackModal open={open} onClose={handleClose} />
    </>
  );
};

export default FeedbackButton;
