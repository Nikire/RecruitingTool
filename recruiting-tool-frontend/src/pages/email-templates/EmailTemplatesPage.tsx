import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import { GridColDef } from "@mui/x-data-grid";
import {
  EnhancedDataGrid,
  CellRow,
  ActionsCell,
  DateCell,
} from "../../components/tables";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useDialog } from "../../hooks/useDialog";
import {
  useEmailTemplates,
  useDeleteEmailTemplate,
} from "../../hooks/api/useEmailTemplates";
import EmailTemplateDialog from "../../components/email-templates/EmailTemplateDialog";
import EmailTemplatePreviewDialog from "../../components/dialogs/EmailTemplatePreviewDialog";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import { canManageResources } from "../../utils/permissions";
import { AccessDeniedMessage, PageHeader } from "../../components/common";
import {
  EmailTemplate,
  EmailTemplateType,
} from "../../types/emailTemplate.types";
import SearchBar from "../../components/search/SearchBar";

const EmailTemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const createDialog = useDialog<never>();
  const updateDialog = useDialog<EmailTemplate>();
  const previewDialog = useDialog<string>();
  const deleteDialog = useDialog<EmailTemplate>();
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to get chip color based on template type
  const getTypeChipColor = (
    type: EmailTemplateType | null,
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    if (!type) return "default";
    switch (type) {
      case EmailTemplateType.APPLICATION_RECEIVED:
        return "info";
      case EmailTemplateType.APPLICATION_UNDER_REVIEW:
        return "warning";
      case EmailTemplateType.APPLICATION_REJECTED:
        return "error";
      case EmailTemplateType.APPLICATION_SHORTLISTED:
        return "success";
      case EmailTemplateType.INTERVIEW_INVITATION:
        return "primary";
      case EmailTemplateType.INTERVIEW_REMINDER:
        return "warning";
      case EmailTemplateType.OFFER_LETTER:
        return "success";
      case EmailTemplateType.CUSTOM:
        return "default";
      default:
        return "default";
    }
  };

  // Helper function to get display label for template type
  const getTypeLabel = (type: EmailTemplateType | null): string => {
    if (!type) return t("email_template.type_none");
    switch (type) {
      case EmailTemplateType.APPLICATION_RECEIVED:
        return t("email_template.type_application_received");
      case EmailTemplateType.APPLICATION_UNDER_REVIEW:
        return t("email_template.type_application_under_review");
      case EmailTemplateType.APPLICATION_REJECTED:
        return t("email_template.type_application_rejected");
      case EmailTemplateType.APPLICATION_SHORTLISTED:
        return t("email_template.type_application_shortlisted");
      case EmailTemplateType.INTERVIEW_INVITATION:
        return t("email_template.type_interview_invitation");
      case EmailTemplateType.INTERVIEW_REMINDER:
        return t("email_template.type_interview_reminder");
      case EmailTemplateType.OFFER_LETTER:
        return t("email_template.type_offer_letter");
      case EmailTemplateType.CUSTOM:
        return t("email_template.type_custom");
      default:
        return t("email_template.type_none");
    }
  };

  const { data: templates, isLoading } = useEmailTemplates(user?.companyUid);
  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeleteEmailTemplate();

  const canManage = canManageResources(user);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!templates || !searchQuery.trim()) {
      return templates || [];
    }

    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.subject.toLowerCase().includes(query) ||
        (template.createdByName &&
          template.createdByName.toLowerCase().includes(query)),
    );
  }, [templates, searchQuery]);

  const handleDelete = () => {
    if (deleteDialog.selectedItem) {
      deleteTemplate(deleteDialog.selectedItem.uid, {
        onSuccess: () => {
          deleteDialog.close();
        },
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("email_templates.table_name"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "subject",
      headerName: t("email_templates.table_subject"),
      flex: 1,
      minWidth: 250,
    },
    {
      field: "type",
      headerName: t("email_templates.table_type"),
      width: 200,
      renderCell: (params) => (
        <CellRow centered>
          <Chip
            label={getTypeLabel(params.value)}
            size="small"
            color={getTypeChipColor(params.value)}
            variant="filled"
          />
        </CellRow>
      ),
    },
    {
      field: "isDefault",
      headerName: t("email_templates.table_default"),
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <CellRow centered>
            <Chip label={t("common.yes")} size="small" color="primary" />
          </CellRow>
        ) : null,
    },
    {
      field: "createdByName",
      headerName: t("email_templates.table_created_by"),
      width: 150,
    },
    {
      field: "createdAt",
      headerName: t("email_templates.table_created_at"),
      width: 150,
      renderCell: (params) => <DateCell value={params.value} />,
    },
    {
      field: "actions",
      headerName: t("email_templates.table_actions"),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionsCell
          onView={() => previewDialog.openWith(params.row.uid)}
          onEdit={
            canManage ? () => updateDialog.openWith(params.row) : undefined
          }
          onDelete={
            canManage ? () => deleteDialog.openWith(params.row) : undefined
          }
        />
      ),
    },
  ];

  if (!canManage) {
    return (
      <AccessDeniedMessage requiredRoles={["HR", "ADMIN", "SUPER_ADMIN"]} />
    );
  }

  return (
    <Box>
      <PageHeader
        title="email_templates.title"
        subtitle="email_templates.subtitle"
        action={
          canManage
            ? {
                label: "email_templates.create_template",
                icon: <AddIcon />,
                onClick: () => createDialog.open(),
              }
            : undefined
        }
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {t("email_templates.trigger_info_title")}
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <Typography variant="body2">
              {t("email_templates.trigger_APPLICATION_RECEIVED")}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              {t("email_templates.trigger_APPLICATION_UNDER_REVIEW")}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              {t("email_templates.trigger_APPLICATION_SHORTLISTED")}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              {t("email_templates.trigger_APPLICATION_REJECTED")}
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              {t("email_templates.trigger_INTERVIEW_INVITATION")}
            </Typography>
          </li>
        </ul>
      </Alert>

      <Paper sx={{ p: 2, mb: 3 }}>
        <SearchBar
          onSearch={setSearchQuery}
          placeholder={t("email_templates.search_placeholder")}
          value={searchQuery}
        />
      </Paper>

      <Box sx={{ height: 600, width: "100%" }}>
        <EnhancedDataGrid
          rows={filteredTemplates}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          getRowId={(row) => row.uid}
          onboardingKey="email-templates"
        />
      </Box>

      {/* Create/Update Dialog */}
      <EmailTemplateDialog
        open={createDialog.isOpen || updateDialog.isOpen}
        onClose={() => {
          createDialog.close();
          updateDialog.close();
        }}
        template={updateDialog.selectedItem ?? undefined}
      />

      {/* Preview Dialog */}
      <EmailTemplatePreviewDialog
        open={previewDialog.isOpen}
        onClose={previewDialog.close}
        templateUid={previewDialog.selectedItem || null}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDelete}
        title={t("dialogs.delete_confirmation")}
        message={t("email_templates.delete_message")}
        itemName={deleteDialog.selectedItem?.name}
        isDeleting={isDeleting}
      />
    </Box>
  );
};

export default EmailTemplatesPage;
