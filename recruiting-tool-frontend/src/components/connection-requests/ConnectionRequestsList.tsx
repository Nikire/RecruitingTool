import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useCompanyConnectionRequests,
  useApproveConnectionRequest,
  useDenyConnectionRequest,
} from "../../hooks/connection-requests";
import {
  ConnectionRequest,
  ConnectionRequestStatus,
  ApproveConnectionRequestDto,
  DenyConnectionRequestDto,
  RolesType,
} from "../../types/connection-requests";
import { useValidationRules } from "../../utils/validation";
import FormErrorSummary from "../common/FormErrorSummary";
import { formatDate } from "../../utils/dateUtils";

interface ConnectionRequestsListProps {
  companyUid: string;
}

const ConnectionRequestsList: React.FC<ConnectionRequestsListProps> = ({
  companyUid,
}) => {
  const { t } = useTranslation();
  const validationRules = useValidationRules();
  const [selectedRequest, setSelectedRequest] =
    useState<ConnectionRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "deny" | null>(null);

  const { data: requests, isLoading } = useCompanyConnectionRequests(
    companyUid,
    {
      status: ConnectionRequestStatus.PENDING,
    },
  );

  const { mutate: approve, isPending: isApproving } =
    useApproveConnectionRequest();
  const { mutate: deny, isPending: isDenying } = useDenyConnectionRequest();

  const {
    register: registerApprove,
    handleSubmit: handleSubmitApprove,
    reset: resetApprove,
    formState: { errors: errorsApprove },
  } = useForm<ApproveConnectionRequestDto>();

  const {
    register: registerDeny,
    handleSubmit: handleSubmitDeny,
    reset: resetDeny,
    formState: { errors: errorsDeny },
  } = useForm<DenyConnectionRequestDto>();

  const handleApproveClick = (request: ConnectionRequest) => {
    setSelectedRequest(request);
    setActionType("approve");
    resetApprove({
      assignedRole: request.requestedRole,
      reviewNote: "",
    });
  };

  const handleDenyClick = (request: ConnectionRequest) => {
    setSelectedRequest(request);
    setActionType("deny");
    resetDeny({ reviewNote: "" });
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    resetApprove();
    resetDeny();
  };

  const onApproveSubmit = (data: ApproveConnectionRequestDto) => {
    if (!selectedRequest) return;
    approve(
      { requestUid: selectedRequest.uid, dto: data },
      {
        onSuccess: () => {
          handleCloseDialog();
        },
      },
    );
  };

  const onDenySubmit = (data: DenyConnectionRequestDto) => {
    if (!selectedRequest) return;
    deny(
      { requestUid: selectedRequest.uid, dto: data },
      {
        onSuccess: () => {
          handleCloseDialog();
        },
      },
    );
  };

  const getStatusColor = (status: ConnectionRequestStatus) => {
    switch (status) {
      case ConnectionRequestStatus.PENDING:
        return "warning";
      case ConnectionRequestStatus.APPROVED:
        return "success";
      case ConnectionRequestStatus.DENIED:
        return "error";
      case ConnectionRequestStatus.CANCELLED:
        return "default";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Alert severity="info">
        {t("connection_requests.no_pending_requests")}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid item xs={12} key={request.uid}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6">{request.userName}</Typography>
                      <Chip
                        label={t(
                          `connection_requests.status.${request.status.toLowerCase()}`,
                        )}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {request.userEmail}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <WorkIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {t("connection_requests.requested_role")}:{" "}
                        {t(`roles.${request.requestedRole.toLowerCase()}`)}
                      </Typography>
                    </Box>
                    {request.message && (
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={1}
                        mt={2}
                      >
                        <MessageIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                          {request.message}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(request.createdAt)}
                  </Typography>
                </Box>

                {request.status === ConnectionRequestStatus.PENDING && (
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApproveClick(request)}
                    >
                      {t("common.approve")}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DenyIcon />}
                      onClick={() => handleDenyClick(request)}
                    >
                      {t("common.deny")}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Approve Dialog */}
      <Dialog
        open={actionType === "approve" && selectedRequest !== null}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("connection_requests.approve_dialog_title")}
        </DialogTitle>
        <form onSubmit={handleSubmitApprove(onApproveSubmit)}>
          <DialogContent>
            <FormErrorSummary errors={errorsApprove} />

            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("connection_requests.approve_dialog_description", {
                userName: selectedRequest?.userName,
              })}
            </Typography>

            <TextField
              label={t("connection_requests.fields.assigned_role")}
              select
              fullWidth
              margin="normal"
              defaultValue={selectedRequest?.requestedRole}
              {...registerApprove("assignedRole")}
            >
              <MenuItem value={RolesType.HR}>{t("roles.hr")}</MenuItem>
              <MenuItem value={RolesType.HR_MANAGER}>
                {t("roles.hr_manager")}
              </MenuItem>
              <MenuItem value={RolesType.RECRUITER}>
                {t("roles.recruiter")}
              </MenuItem>
            </TextField>

            <TextField
              label={t("connection_requests.fields.review_note")}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              {...registerApprove("reviewNote", validationRules.maxLength(500))}
              error={!!errorsApprove.reviewNote}
              helperText={errorsApprove.reviewNote?.message}
              placeholder={t(
                "connection_requests.fields.review_note_placeholder",
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isApproving}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={isApproving}
            >
              {isApproving ? t("common.approving") : t("common.approve")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog
        open={actionType === "deny" && selectedRequest !== null}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("connection_requests.deny_dialog_title")}</DialogTitle>
        <form onSubmit={handleSubmitDeny(onDenySubmit)}>
          <DialogContent>
            <FormErrorSummary errors={errorsDeny} />

            <Typography variant="body2" sx={{ mb: 2 }}>
              {t("connection_requests.deny_dialog_description", {
                userName: selectedRequest?.userName,
              })}
            </Typography>

            <TextField
              label={t("connection_requests.fields.denial_reason")}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              {...registerDeny(
                "reviewNote",
                validationRules.combine(
                  validationRules.required(
                    t("connection_requests.fields.denial_reason"),
                  ),
                  validationRules.maxLength(500),
                ),
              )}
              error={!!errorsDeny.reviewNote}
              helperText={errorsDeny.reviewNote?.message}
              placeholder={t(
                "connection_requests.fields.denial_reason_placeholder",
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isDenying}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={isDenying}
            >
              {isDenying ? t("common.denying") : t("common.deny")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ConnectionRequestsList;
