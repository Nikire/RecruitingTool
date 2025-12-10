import React, { useState } from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useTranslation } from 'react-i18next';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Tooltip title={t('feedback.button_label')} placement="left">
        <Zoom in={true} timeout={300}>
          <Fab
            color="primary"
            aria-label={t('feedback.button_label')}
            onClick={handleOpen}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
          >
            <FeedbackIcon />
          </Fab>
        </Zoom>
      </Tooltip>

      <FeedbackModal open={open} onClose={handleClose} />
    </>
  );
};

export default FeedbackButton;
