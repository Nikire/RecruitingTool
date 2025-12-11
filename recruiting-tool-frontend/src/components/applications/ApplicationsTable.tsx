import { useState } from "react";
import { Typography, Box, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useApplications } from "../../hooks/api/useApplications";
import { Application, ApplicationStatus } from "../../types/application.types";
import ApplicationDetailDialog from "../dialogs/ApplicationDetailDialog";
import {
  DateCell,
  StatusCell,
  ActionsCell,
  CellColumn,
  CellRow,
} from "../tables";
import { DataTable, DataTableColumn } from "../shared/DataTable";

interface ApplicationsTableProps {
  statusFilter?: ApplicationStatus;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  statusFilter,
}) => {
  const { t } = useTranslation();
  const {
    data: applications,
    isLoading,
    isError,
  } = useApplications(statusFilter ? { status: statusFilter } : undefined);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewClick = (application: Application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
  };

  // Custom color mapping for application statuses
  const applicationStatusColors: Record<
    string,
    "success" | "warning" | "error" | "primary" | "default"
  > = {
    PENDING: "warning",
    REVIEWED: "primary",
    ACCEPTED: "success",
    REJECTED: "error",
  };

  const columns: DataTableColumn<Application>[] = [
    {
      field: "applicantName",
      headerName: t("applications.applicant_name"),
      flex: 1,
      minWidth: 150,
      mobileRender: (app) => (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {app.applicantName}
        </Typography>
      ),
    },
    {
      field: "applicantEmail",
      headerName: t("applications.email"),
      flex: 1,
      minWidth: 180,
      mobileRender: (app) => (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
          {app.applicantEmail}
        </Typography>
      ),
    },
    {
      field: "applicantPhone",
      headerName: t("applications.phone"),
      width: 130,
      renderCell: (params) => params.value || "-",
      mobileRender: (app) =>
        app.applicantPhone ? (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {app.applicantPhone}
          </Typography>
        ) : null,
    },
    {
      field: "jobPositionTitle",
      headerName: t("applications.job_position"),
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <CellColumn gap={0.25}>
          <Typography variant="body2">{params.value}</Typography>
          {params.row.companyName && (
            <Typography variant="caption" color="text.secondary">
              {params.row.companyName}
            </Typography>
          )}
        </CellColumn>
      ),
      mobileRender: (app) => (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">{app.jobPositionTitle}</Typography>
          {app.companyName && (
            <Typography variant="caption" color="text.secondary">
              {app.companyName}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: t("applications.status"),
      width: 130,
      renderCell: (params) => (
        <CellRow centered>
          <StatusCell
            status={params.value}
            colorMap={applicationStatusColors}
          />
        </CellRow>
      ),
      mobileRender: (app) => (
        <StatusCell
          status={app.status}
          colorMap={applicationStatusColors}
        />
      ),
    },
    {
      field: "appliedAt",
      headerName: t("applications.applied_date"),
      width: 170,
      renderCell: (params) => <DateCell value={params.value} showTime />,
      mobileRender: (app) => (
        <Typography variant="caption" color="textSecondary">
          {new Date(app.appliedAt).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ActionsCell onView={() => handleViewClick(params.row)} />
      ),
      showInMobile: false, // Hide actions in mobile, rely on row click
    },
  ];

  const emptyMessage = statusFilter
    ? "applications.no_applications_with_status"
    : "applications.no_applications_submitted";

  return (
    <>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            {t("applications.total_applications", {
              count: applications?.length || 0,
            })}
          </Typography>
        </Box>
      </Paper>

      <DataTable
        data={applications || []}
        columns={columns}
        getRowId={(row) => row.uid}
        loading={isLoading}
        error={isError}
        emptyMessage={emptyMessage}
        errorMessage="applications.error_loading"
        onboardingKey="applications-table"
        dataGridProps={{
          initialState: {
            pagination: { paginationModel: { pageSize: 25 } },
          },
          onRowClick: (params) => handleViewClick(params.row),
          sx: {
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },
          },
        }}
      />

      <ApplicationDetailDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        application={selectedApplication}
      />
    </>
  );
};

export default ApplicationsTable;
