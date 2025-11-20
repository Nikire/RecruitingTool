import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useUserAtom } from '../../../hooks/api/state/useUserAtom';
import { useEmailTemplates, useDeleteEmailTemplate } from '../../../hooks/api/useEmailTemplates';
import { canManageResources } from '../../../utils/permissions';
import EmailTemplateDialog from '../../../components/email-templates/EmailTemplateDialog';
import { EmailTemplate } from '../../../types/emailTemplate.types';
import { format } from 'date-fns';

const EmailTemplatesPage: React.FC = () => {
  const { user } = useUserAtom();
  const hasAccess = canManageResources(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const companyUid = user?.company?.uid;
  const { data: templates, isLoading, error } = useEmailTemplates(companyUid);
  const { mutate: deleteTemplate } = useDeleteEmailTemplate();

  // Filter templates based on search
  const filteredTemplates = templates?.filter((template) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.subject.toLowerCase().includes(searchLower) ||
      template.body.toLowerCase().includes(searchLower)
    );
  });

  // Check if user has access (HR, ADMIN, or SUPER_ADMIN)
  if (!hasAccess) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied: You need HR, ADMIN or SUPER_ADMIN role to view email templates.
        </Alert>
        <Typography variant="body1">
          Please contact your administrator if you believe you should have access to this page.
        </Typography>
      </Box>
    );
  }

  const handleOpenDialog = (template?: EmailTemplate) => {
    setSelectedTemplate(template || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDelete = (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTemplate(uid);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 8 }}>
        <Typography variant="h4">Email Templates</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Create Template
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search templates by name, subject, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading email templates. Please try again later.
        </Alert>
      )}

      {!isLoading && !error && filteredTemplates && filteredTemplates.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {searchTerm
            ? 'No templates found matching your search.'
            : 'No email templates yet. Click "Create Template" to add your first one!'}
        </Alert>
      )}

      {!isLoading && !error && filteredTemplates && filteredTemplates.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Default</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.uid} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight={template.isDefault ? 600 : 400}>
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                      {template.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {template.isDefault && <Chip label="Default" color="primary" size="small" />}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{template.createdByName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(template.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(template)}
                      title="Edit template"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(template.uid, template.name)}
                      title="Delete template"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <EmailTemplateDialog open={dialogOpen} onClose={handleCloseDialog} template={selectedTemplate} />
    </Box>
  );
};

export default EmailTemplatesPage;
