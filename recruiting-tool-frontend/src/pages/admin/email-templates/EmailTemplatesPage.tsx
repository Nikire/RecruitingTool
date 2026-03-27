import { useState } from "react";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { useUserAtom } from "../../../hooks/api/state/useUserAtom";
import {
  useEmailTemplates,
  useDeleteEmailTemplate,
} from "../../../hooks/api/useEmailTemplates";
import { canManageResources } from "../../../utils/permissions";
import EmailTemplateDialog from "../../../components/email-templates/EmailTemplateDialog";
import {
  EmailTemplate,
  EmailTemplateType,
} from "../../../types/emailTemplate.types";
import { format } from "date-fns";
import AccessDeniedMessage from "../../../components/common/AccessDeniedMessage";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import EmptyState from "../../../components/common/EmptyState";
import { TableHeaderCell } from "../../../components/common";
import { useTranslation } from "react-i18next";

const EmailTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const hasAccess = canManageResources(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
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
    if (
      window.confirm(t("email_templates_page.delete_confirmation", { name }))
    ) {
      deleteTemplate(uid);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">{t("email_templates_page.title")}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          {t("email_templates_page.create_template")}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("email_templates_page.search_placeholder")}
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

      {isLoading && <LoadingSpinner />}

      {error && <ErrorMessage message="errors.fetch_failed" />}

      {!isLoading &&
        !error &&
        filteredTemplates &&
        filteredTemplates.length === 0 && (
          <EmptyState
            message={
              searchTerm ? "empty.no_results" : "email_templates.no_templates"
            }
          />
        )}

      {!isLoading &&
        !error &&
        filteredTemplates &&
        filteredTemplates.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell
                    label="email_templates_page.table_name"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_subject"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_type"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_default"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_created_by"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_created_at"
                    translate
                  />
                  <TableHeaderCell
                    label="email_templates_page.table_actions"
                    align="right"
                    translate
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.uid} hover>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight={template.isDefault ? 600 : 400}
                      >
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ maxWidth: 300 }}
                      >
                        {template.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {template.type && (
                        <Chip
                          label={t(
                            `email_template.type_${template.type.toLowerCase()}`,
                          )}
                          size="small"
                          variant="filled"
                          color={
                            template.type ===
                            EmailTemplateType.APPLICATION_RECEIVED
                              ? "success"
                              : template.type ===
                                  EmailTemplateType.APPLICATION_REJECTED
                                ? "error"
                                : template.type ===
                                    EmailTemplateType.APPLICATION_SHORTLISTED
                                  ? "info"
                                  : template.type ===
                                      EmailTemplateType.INTERVIEW_INVITATION
                                    ? "primary"
                                    : template.type ===
                                        EmailTemplateType.INTERVIEW_REMINDER
                                      ? "warning"
                                      : template.type ===
                                          EmailTemplateType.OFFER_LETTER
                                        ? "success"
                                        : "default"
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {template.isDefault && (
                        <Chip
                          label={t("email_templates_page.default_label")}
                          color="primary"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.createdByName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(template.createdAt), "MMM dd, yyyy")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(template)}
                        title={t("email_templates_page.edit_tooltip")}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDelete(template.uid, template.name)
                        }
                        title={t("email_templates_page.delete_tooltip")}
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

      <EmailTemplateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        template={selectedTemplate}
      />
    </Box>
  );
};

export default EmailTemplatesPage;
