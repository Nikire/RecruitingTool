import React, { useState } from 'react';
import { Box, Button, Typography, Alert, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { OnboardingData } from '../ApplicantOnboarding';

interface ResumeStepProps {
  data: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const ResumeStep: React.FC<ResumeStepProps> = ({ data, onNext, onBack }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(data.resumeFile || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError(t('onboarding.resume.invalid_file_type'));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(t('onboarding.resume.file_too_large'));
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleNext = () => {
    onNext({ resumeFile: selectedFile || undefined, resumeSkipped: !selectedFile });
  };

  const handleSkip = () => {
    onNext({ resumeSkipped: true });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('onboarding.resume.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('onboarding.resume.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!selectedFile ? (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.default',
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => document.getElementById('resume-upload')?.click()}
        >
          <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            {t('onboarding.resume.upload_prompt')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('onboarding.resume.file_formats')}
          </Typography>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1">{selectedFile.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </Typography>
          </Box>
          <Button startIcon={<DeleteIcon />} onClick={handleRemoveFile} color="error">
            {t('common.remove')}
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onBack}>{t('common.back')}</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleSkip}>{t('onboarding.resume.skip')}</Button>
          <Button variant="contained" onClick={handleNext} disabled={!selectedFile}>
            {t('common.next')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResumeStep;
