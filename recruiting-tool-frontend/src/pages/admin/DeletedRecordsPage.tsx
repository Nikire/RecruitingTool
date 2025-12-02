import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTranslation } from 'react-i18next';
import {
  useDeletedCandidates,
  useDeletedJobPositions,
  useDeletedApplications,
  useDeletedInterviews,
  useRestoreCandidate,
  usePurgeCandidate,
  useRestoreJobPosition,
  usePurgeJobPosition,
  useRestoreApplication,
  usePurgeApplication,
  useRestoreInterview,
  usePurgeInterview,
} from '../../hooks/api/useDeletedRecords';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deleted-records-tabpanel-${index}`}
      aria-labelledby={`deleted-records-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DeletedRecordsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'restore' | 'purge' | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<
    'candidates' | 'job-positions' | 'applications' | 'interviews' | null
  >(null);

  // Fetch deleted records
  const { data: deletedCandidates, isLoading: loadingCandidates } = useDeletedCandidates();
  const { data: deletedJobPositions, isLoading: loadingJobPositions } = useDeletedJobPositions();
  const { data: deletedApplications, isLoading: loadingApplications } = useDeletedApplications();
  const { data: deletedInterviews, isLoading: loadingInterviews } = useDeletedInterviews();

  // Mutations
  const restoreCandidate = useRestoreCandidate();
  const purgeCandidate = usePurgeCandidate();
  const restoreJobPosition = useRestoreJobPosition();
  const purgeJobPosition = usePurgeJobPosition();
  const restoreApplication = useRestoreApplication();
  const purgeApplication = usePurgeApplication();
  const restoreInterview = useRestoreInterview();
  const purgeInterview = usePurgeInterview();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openConfirmDialog = (
    action: 'restore' | 'purge',
    uid: string,
    entityType: 'candidates' | 'job-positions' | 'applications' | 'interviews',
  ) => {
    setConfirmAction(action);
    setSelectedUid(uid);
    setSelectedEntityType(entityType);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setSelectedUid(null);
    setSelectedEntityType(null);
  };

  const handleConfirmAction = () => {
    if (!selectedUid || !selectedEntityType || !confirmAction) return;

    if (confirmAction === 'restore') {
      switch (selectedEntityType) {
        case 'candidates':
          restoreCandidate.mutate(selectedUid);
          break;
        case 'job-positions':
          restoreJobPosition.mutate(selectedUid);
          break;
        case 'applications':
          restoreApplication.mutate(selectedUid);
          break;
        case 'interviews':
          restoreInterview.mutate(selectedUid);
          break;
      }
    } else if (confirmAction === 'purge') {
      switch (selectedEntityType) {
        case 'candidates':
          purgeCandidate.mutate(selectedUid);
          break;
        case 'job-positions':
          purgeJobPosition.mutate(selectedUid);
          break;
        case 'applications':
          purgeApplication.mutate(selectedUid);
          break;
        case 'interviews':
          purgeInterview.mutate(selectedUid);
          break;
      }
    }

    closeConfirmDialog();
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPp');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('deleted_records.page_title')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('deleted_records.page_description')}
      </Alert>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="deleted records tabs">
          <Tab label={t('deleted_records.tabs.candidates')} />
          <Tab label={t('deleted_records.tabs.job_positions')} />
          <Tab label={t('deleted_records.tabs.applications')} />
          <Tab label={t('deleted_records.tabs.interviews')} />
        </Tabs>

        {/* Candidates Tab */}
        <TabPanel value={tabValue} index={0}>
          {loadingCandidates ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : deletedCandidates && deletedCandidates.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('deleted_records.table.name')}</TableCell>
                    <TableCell>{t('deleted_records.table.email')}</TableCell>
                    <TableCell>{t('deleted_records.table.source')}</TableCell>
                    <TableCell>{t('deleted_records.table.deleted_at')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedCandidates.map((candidate) => (
                    <TableRow key={candidate.uid}>
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>
                        {candidate.source ? (
                          <Chip label={candidate.source} size="small" />
                        ) : (
                          t('common.n_a')
                        )}
                      </TableCell>
                      <TableCell>{formatDate(candidate.deletedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => openConfirmDialog('restore', candidate.uid, 'candidates')}
                          title={t('deleted_records.actions.restore')}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openConfirmDialog('purge', candidate.uid, 'candidates')}
                          title={t('deleted_records.actions.purge')}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ p: 4, textAlign: 'center' }}>
              {t('deleted_records.no_records')}
            </Typography>
          )}
        </TabPanel>

        {/* Job Positions Tab */}
        <TabPanel value={tabValue} index={1}>
          {loadingJobPositions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : deletedJobPositions && deletedJobPositions.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('deleted_records.table.title')}</TableCell>
                    <TableCell>{t('deleted_records.table.status')}</TableCell>
                    <TableCell>{t('deleted_records.table.deleted_at')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedJobPositions.map((jobPosition) => (
                    <TableRow key={jobPosition.uid}>
                      <TableCell>{jobPosition.title}</TableCell>
                      <TableCell>
                        <Chip label={jobPosition.status} size="small" color="default" />
                      </TableCell>
                      <TableCell>{formatDate(jobPosition.deletedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            openConfirmDialog('restore', jobPosition.uid, 'job-positions')
                          }
                          title={t('deleted_records.actions.restore')}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            openConfirmDialog('purge', jobPosition.uid, 'job-positions')
                          }
                          title={t('deleted_records.actions.purge')}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ p: 4, textAlign: 'center' }}>
              {t('deleted_records.no_records')}
            </Typography>
          )}
        </TabPanel>

        {/* Applications Tab */}
        <TabPanel value={tabValue} index={2}>
          {loadingApplications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : deletedApplications && deletedApplications.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('deleted_records.table.applicant_name')}</TableCell>
                    <TableCell>{t('deleted_records.table.email')}</TableCell>
                    <TableCell>{t('deleted_records.table.status')}</TableCell>
                    <TableCell>{t('deleted_records.table.deleted_at')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedApplications.map((application) => (
                    <TableRow key={application.uid}>
                      <TableCell>{application.applicantName}</TableCell>
                      <TableCell>{application.applicantEmail}</TableCell>
                      <TableCell>
                        <Chip label={application.status} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(application.deletedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            openConfirmDialog('restore', application.uid, 'applications')
                          }
                          title={t('deleted_records.actions.restore')}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            openConfirmDialog('purge', application.uid, 'applications')
                          }
                          title={t('deleted_records.actions.purge')}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ p: 4, textAlign: 'center' }}>
              {t('deleted_records.no_records')}
            </Typography>
          )}
        </TabPanel>

        {/* Interviews Tab */}
        <TabPanel value={tabValue} index={3}>
          {loadingInterviews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : deletedInterviews && deletedInterviews.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('deleted_records.table.scheduled_date')}</TableCell>
                    <TableCell>{t('deleted_records.table.status')}</TableCell>
                    <TableCell>{t('deleted_records.table.deleted_at')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedInterviews.map((interview) => (
                    <TableRow key={interview.uid}>
                      <TableCell>
                        {interview.scheduledDate
                          ? formatDate(interview.scheduledDate)
                          : t('common.n_a')}
                      </TableCell>
                      <TableCell>
                        <Chip label={interview.status} size="small" />
                      </TableCell>
                      <TableCell>{formatDate(interview.deletedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            openConfirmDialog('restore', interview.uid, 'interviews')
                          }
                          title={t('deleted_records.actions.restore')}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openConfirmDialog('purge', interview.uid, 'interviews')}
                          title={t('deleted_records.actions.purge')}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ p: 4, textAlign: 'center' }}>
              {t('deleted_records.no_records')}
            </Typography>
          )}
        </TabPanel>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmAction === 'restore'
            ? t('deleted_records.confirm_restore_title')
            : t('deleted_records.confirm_purge_title')}
        </DialogTitle>
        <DialogContent>
          {confirmAction === 'restore' ? (
            <Typography>{t('deleted_records.confirm_restore_message')}</Typography>
          ) : (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                {t('deleted_records.confirm_purge_warning')}
              </Alert>
              <Typography>{t('deleted_records.confirm_purge_message')}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>{t('common.cancel')}</Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmAction === 'purge' ? 'error' : 'primary'}
          >
            {confirmAction === 'restore' ? t('common.confirm') : t('deleted_records.actions.purge')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeletedRecordsPage;
