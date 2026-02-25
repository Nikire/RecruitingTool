import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { useJobPositions } from "../../../hooks/api/useJobPositions";
import { JobPosition } from "../../../types/jobPosition.types";
import StatusLabel from "../../../components/StatusLabel";
import { HiringProcessStatus } from "../../../types/hiringProcess.types";
import { useUserAtom } from "../../../hooks/api/state/useUserAtom";
import { canManageResources } from "../../../utils/permissions";
import { UserRoles } from "../../../types/user.types";
import { useTranslation } from "react-i18next";
import UpdateJobPositionDialog from "../../../components/dialogs/UpdateJobPositionDialog";
import ConfirmDeleteDialog from "../../../components/dialogs/ConfirmDeleteDialog";
import ManageStagesDialog from "../../../components/dialogs/ManageStagesDialog";
import { useDialog } from "../../../hooks/useDialog";
import { useConfirmDelete } from "../../../hooks/useConfirmDelete";
import { useDeleteJobPosition } from "../../../hooks/api/useJobPositions";
import {
  StagesList,
  CustomQuestionsList,
} from "../../../components/job-position";
import {
  CenteredLoadingSpinner,
  MetadataDisplay,
} from "../../../components/common";

const getStatusColor = (
  status: HiringProcessStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "primary";
    case "CLOSED":
      return "success";
    case "CANCELLED":
      return "default";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

const HRJobPositionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useUserAtom();
  const {
    data: jobPositionData,
    isLoading,
    error,
  } = useJobPositions(uid || "");
  const [statusFilter, setStatusFilter] = useState<HiringProcessStatus | "ALL">(
    "ALL",
  );

  // Dialog management
  const updateDialog = useDialog<JobPosition>();
  const manageStagesDialog = useDialog<JobPosition>();
  const deleteMutation = useDeleteJobPosition();
  const deleteConfirm = useConfirmDelete<JobPosition>(deleteMutation);

  const canManage = canManageResources(user);

  const statusOptions: Array<HiringProcessStatus | "ALL"> = [
    "ALL",
    "OPEN",
    "IN_PROGRESS",
    "CLOSED",
    "CANCELLED",
    "REJECTED",
  ];

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (error || !jobPositionData) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography color="error">
          {t("job_position_detail.error_loading")}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/hr/job-positions")}
          sx={{ mt: 2 }}
        >
          {t("job_position_detail.back_to_positions")}
        </Button>
      </Box>
    );
  }

  const jobPosition = jobPositionData as JobPosition;

  // Company permission check
  const canAccess =
    user?.roles.includes(UserRoles.ADMIN) ||
    user?.roles.includes(UserRoles.SUPER_ADMIN) ||
    user?.companyUid === jobPosition.companyUid;

  if (!canAccess) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            {t("common.access_denied")}
          </Typography>
          <Typography variant="body2">
            {t("job_position_detail.access_denied_message")}
          </Typography>
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/hr/job-positions")}
          sx={{ mt: 2 }}
        >
          {t("job_position_detail.back_to_positions")}
        </Button>
      </Box>
    );
  }

  // Filter hiring processes by status
  const filteredHiringProcesses =
    jobPosition.hiringProcesses?.filter(
      (process) => statusFilter === "ALL" || process.status === statusFilter,
    ) || [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/hr/job-positions")}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {t("job_position_detail.back_to_positions")}
      </Button>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
            >
              {jobPosition.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {t("job_position_detail.hr_detail_title")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              width: { xs: "100%", sm: "auto" },
              flexWrap: "wrap",
            }}
          >
            <StatusLabel status={jobPosition.status} />
            {canManage && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => updateDialog.openWith(jobPosition)}
                  sx={{ flex: { xs: 1, sm: "none" } }}
                >
                  {t("common.edit")}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => manageStagesDialog.openWith(jobPosition)}
                  sx={{ flex: { xs: 1, sm: "none" } }}
                >
                  {t("job_positions.manage_stages")}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteConfirm.confirmDelete(jobPosition)}
                  sx={{ flex: { xs: 1, sm: "none" } }}
                >
                  {t("common.delete")}
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <MetadataDisplay
          items={[
            {
              label: "job_position_detail.company",
              value: jobPosition.companyName || t("common.n_a"),
            },
            ...(jobPosition.createdAt
              ? [
                  {
                    label: "careers.posted_date",
                    value: new Date(jobPosition.createdAt).toLocaleDateString(),
                  },
                ]
              : []),
            ...(jobPosition.createdBy
              ? [
                  {
                    label: "job_position_detail.created_by_hr",
                    value: jobPosition.createdBy.name,
                    subValue: jobPosition.createdBy.email,
                  },
                ]
              : []),
            {
              label: "job_position_detail.total_stages",
              value: jobPosition.stages?.length || 0,
            },
            {
              label: "job_position_detail.active_processes",
              value: jobPosition.hiringProcesses?.length || 0,
            },
          ]}
          translate
        />
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          {t("job_position_detail.hiring_processes_count", {
            filtered: filteredHiringProcesses.length,
            total: jobPosition.hiringProcesses?.length || 0,
          })}
        </Typography>
      </Box>

      <Box
        sx={{ mb: { xs: 2, sm: 3 }, display: "flex", gap: 1, flexWrap: "wrap" }}
      >
        {statusOptions.map((status) => {
          const count =
            status === "ALL"
              ? jobPosition.hiringProcesses?.length || 0
              : jobPosition.hiringProcesses?.filter((p) => p.status === status)
                  .length || 0;

          return (
            <Chip
              key={status}
              label={`${t(`hiring_process_status.${status.toLowerCase()}`)} (${count})`}
              onClick={() => setStatusFilter(status)}
              color={statusFilter === status ? "primary" : "default"}
              variant={statusFilter === status ? "filled" : "outlined"}
              clickable
            />
          );
        })}
      </Box>

      {filteredHiringProcesses.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>{t("job_position_detail.table_title")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("job_position_detail.table_status")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("job_position_detail.table_candidate")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("job_position_detail.table_actions")}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHiringProcesses.map((process) => (
                <TableRow
                  key={process.uid}
                  hover
                  sx={{
                    backgroundColor: !process.candidate
                      ? "rgba(255, 193, 7, 0.05)"
                      : "inherit",
                  }}
                >
                  <TableCell>{process.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={process.status}
                      color={getStatusColor(process.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {process.candidate ? (
                      <>
                        {process.candidate.name}
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          {process.candidate.email}
                        </Typography>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ fontWeight: 500 }}
                      >
                        {t("hiring_processes.no_candidate")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/hiring-process/${process.uid}`)}
                    >
                      {t("job_positions.view_details")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            {statusFilter === "ALL"
              ? t("job_position_detail.no_processes")
              : t("job_position_detail.no_processes_with_status", {
                  status: statusFilter.replace(/_/g, " "),
                })}
          </Typography>
        </Paper>
      )}

      <Typography
        variant="h5"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          mt: { xs: 3, sm: 5 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t("job_position_detail.stage_template")}
      </Typography>
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <StagesList stages={jobPosition.stages || []} translate />
        </CardContent>
      </Card>

      <Typography
        variant="h5"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          mt: { xs: 3, sm: 4 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t("job_position_detail.custom_questions")}
      </Typography>
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <CustomQuestionsList
            questions={jobPosition.customQuestions || []}
            emptyMessage={t("job_position_detail.no_custom_questions")}
          />
        </CardContent>
      </Card>

      {/* Management Dialogs */}
      <UpdateJobPositionDialog
        open={updateDialog.isOpen}
        onClose={updateDialog.close}
        jobPosition={updateDialog.selectedItem}
      />

      {manageStagesDialog.selectedItem && (
        <ManageStagesDialog
          open={manageStagesDialog.isOpen}
          onClose={manageStagesDialog.close}
          jobPositionUid={manageStagesDialog.selectedItem.uid}
          jobPositionTitle={manageStagesDialog.selectedItem.title}
          existingStages={manageStagesDialog.selectedItem.stages}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteConfirm.isOpen}
        onClose={deleteConfirm.handleCancel}
        onConfirm={deleteConfirm.handleConfirm}
        title={t("job_positions_table.delete_title")}
        message={t("job_positions_table.delete_message")}
        itemName={deleteConfirm.selectedItem?.title}
        isDeleting={deleteConfirm.isDeleting}
      />
    </Box>
  );
};

export default HRJobPositionDetailPage;
