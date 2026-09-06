import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Alert,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  useCompany,
  useCompanyUsers,
  useForceJoinUser,
  useTransferOwnership,
} from "../../hooks/api/useCompanies";
import { CenteredLoadingSpinner, RoleBadge } from "../../components/common";
import Pagination from "../../components/pagination/Pagination";
import { CompanyUser } from "../../types/company.types";
import { PaginationParams } from "../../types/pagination.types";
import { UserRoles } from "../../types/user.types";
import { formatDate } from "../../utils/dateFormatters";

const ASSIGNABLE_ROLES = [
  UserRoles.HR,
  UserRoles.HR_MANAGER,
  UserRoles.RECRUITER,
  UserRoles.COMPANY_ADMIN,
];

// ─── Transfer Ownership Dialog ───────────────────────────────────────────────

interface TransferOwnershipDialogProps {
  open: boolean;
  onClose: () => void;
  companyUid: string;
  users: CompanyUser[];
  /** Member preselected as the new owner when the dialog is opened from a row. */
  defaultUserUid?: string;
}

const TransferOwnershipDialog: React.FC<TransferOwnershipDialogProps> = ({
  open,
  onClose,
  companyUid,
  users,
  defaultUserUid,
}) => {
  const { t } = useTranslation();
  const [selectedUserUid, setSelectedUserUid] = useState("");
  const { mutate: transfer, isPending } = useTransferOwnership(companyUid);

  // Seed the picker every time the dialog opens so the per-row "Transfer to X"
  // action actually arrives with X selected instead of an empty, disabled form.
  useEffect(() => {
    if (open) {
      setSelectedUserUid(defaultUserUid ?? "");
    }
  }, [open, defaultUserUid]);

  const currentOwner = users.find((u) => u.roles.includes("COMPANY_OWNER"));
  const eligibleMembers = users.filter(
    (u) => !u.roles.includes("COMPANY_OWNER"),
  );

  const handleConfirm = () => {
    if (!selectedUserUid) return;
    transfer(
      { newOwnerUid: selectedUserUid },
      {
        onSuccess: () => {
          setSelectedUserUid("");
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setSelectedUserUid("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("company_detail.transfer_ownership_title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning">
            {t("company_detail.transfer_ownership_warning")}
          </Alert>

          {currentOwner && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {t("company_detail.current_owner")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {currentOwner.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentOwner.email}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth>
            <InputLabel>{t("company_detail.new_owner_label")}</InputLabel>
            <Select
              value={selectedUserUid}
              label={t("company_detail.new_owner_label")}
              onChange={(e) => setSelectedUserUid(e.target.value)}
            >
              {eligibleMembers.map((member) => (
                <MenuItem key={member.uid} value={member.uid}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {member.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={!selectedUserUid || isPending}
        >
          {isPending
            ? t("company_detail.transferring")
            : t("company_detail.confirm_transfer")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Force Join Dialog ────────────────────────────────────────────────────────

interface ForceJoinDialogProps {
  open: boolean;
  onClose: () => void;
  companyUid: string;
}

const ForceJoinDialog: React.FC<ForceJoinDialogProps> = ({
  open,
  onClose,
  companyUid,
}) => {
  const { t } = useTranslation();
  const [userUid, setUserUid] = useState("");
  const [role, setRole] = useState<string>(UserRoles.HR);
  const { mutate: forceJoin, isPending } = useForceJoinUser(companyUid);

  const handleConfirm = () => {
    if (!userUid.trim()) return;
    forceJoin(
      { userUid: userUid.trim(), role },
      {
        onSuccess: () => {
          setUserUid("");
          setRole(UserRoles.HR);
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setUserUid("");
    setRole(UserRoles.HR);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("company_detail.force_join_title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={t("company_detail.user_uid_label")}
            value={userUid}
            onChange={(e) => setUserUid(e.target.value)}
            fullWidth
            helperText={t("company_detail.user_uid_helper")}
            required
          />
          <FormControl fullWidth>
            <InputLabel>{t("company_detail.role_label")}</InputLabel>
            <Select
              value={role}
              label={t("company_detail.role_label")}
              onChange={(e) => setRole(e.target.value)}
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {t(`company_roles.roles.${r}`, { defaultValue: r })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!userUid.trim() || isPending}
        >
          {isPending
            ? t("company_detail.joining")
            : t("company_detail.assign_to_company")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Company Info Card ────────────────────────────────────────────────────────

interface CompanyInfoCardProps {
  name: string;
  description?: string;
  userCount?: number;
  jobPositionCount?: number;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  name,
  description,
  userCount,
  jobPositionCount,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
        </Stack>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PeopleIcon fontSize="small" color="action" />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1 }}
                >
                  {userCount ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("users.title")}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WorkIcon fontSize="small" color="action" />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, lineHeight: 1 }}
                >
                  {jobPositionCount ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("job_positions.title")}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CompanyDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { uid } = useParams<{ uid: string }>();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetUid, setTransferTargetUid] = useState<
    string | undefined
  >(undefined);
  const [forceJoinDialogOpen, setForceJoinDialogOpen] = useState(false);

  // The API's PaginationDto reads `pageSize`; a bare `limit` is silently dropped
  // and the page size falls back to the DTO default, so send both.
  const usersParams: PaginationParams & { pageSize?: number } = {
    page,
    limit,
    pageSize: limit,
  };

  const { data: company, isLoading: companyLoading } = useCompany(uid ?? "");
  const { data: usersData, isLoading: usersLoading } = useCompanyUsers(
    uid ?? "",
    usersParams,
  );

  const users = usersData?.data ?? [];
  const totalUsers = usersData?.pagination?.total ?? 0;
  const totalUserPages = usersData?.pagination?.totalPages ?? 0;

  // The ownership picker has to reach every member, not just the page currently
  // rendered in the table — fetched only while the dialog is open.
  const transferPickerParams: PaginationParams & { pageSize?: number } = {
    page: 1,
    limit: 200,
    pageSize: 200,
  };
  const { data: transferPickerData } = useCompanyUsers(
    transferDialogOpen ? (uid ?? "") : "",
    transferPickerParams,
  );
  const transferCandidates = transferPickerData?.data ?? users;

  const handleOpenTransfer = (userUid?: string) => {
    setTransferTargetUid(userUid);
    setTransferDialogOpen(true);
  };

  if (companyLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (!company) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t("company_detail.not_found")}</Typography>
      </Box>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return t("common.n_a");
    const formatted = formatDate(dateStr, "MMM d, yyyy", i18n.language);
    return formatted === "-" ? t("common.n_a") : formatted;
  };

  return (
    <Box>
      {/* Back Button + Title */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton
          onClick={() => navigate("/admin/companies")}
          aria-label={t("company_detail.back_to_companies")}
          size="small"
          sx={{ mr: 0.5 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
        >
          {company.name}
        </Typography>
      </Stack>

      {/* Company Info Card */}
      <CompanyInfoCard
        name={company.name}
        description={company.description}
        userCount={company.userCount}
        jobPositionCount={company.jobPositionCount}
      />

      {/* Users Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t("company_detail.users_section_title")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<SwapHorizIcon />}
            onClick={() => handleOpenTransfer(undefined)}
            disabled={users.length < 2}
          >
            {t("company_detail.transfer_ownership")}
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setForceJoinDialogOpen(true)}
          >
            {t("company_detail.force_join")}
          </Button>
        </Stack>
      </Stack>

      {/* Users Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {usersLoading ? (
          <CenteredLoadingSpinner minHeight="200px" />
        ) : users.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              {t("company_detail.no_users")}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("company_detail.col_name")}</TableCell>
                  <TableCell>{t("company_detail.col_email")}</TableCell>
                  <TableCell>{t("company_detail.col_roles")}</TableCell>
                  <TableCell>{t("company_detail.col_status")}</TableCell>
                  <TableCell>{t("company_detail.col_joined")}</TableCell>
                  <TableCell align="center">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const isOwner = user.roles.includes("COMPANY_OWNER");
                  return (
                    <TableRow key={user.uid} hover>
                      {/* Name + Avatar */}
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.75rem",
                              bgcolor: "primary.main",
                            }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {user.name}
                            </Typography>
                            {user.position && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {user.position}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>

                      {/* Roles */}
                      <TableCell>
                        <Stack direction="row" flexWrap="wrap" gap={0.5}>
                          {user.roles.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))}
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={
                            user.isActive
                              ? t("company_detail.status_active")
                              : t("company_detail.status_inactive")
                          }
                          size="small"
                          color={user.isActive ? "success" : "default"}
                          variant={user.isActive ? "filled" : "outlined"}
                        />
                      </TableCell>

                      {/* Joined date */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatJoinedDate(user.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        {!isOwner && (
                          <Tooltip
                            title={t("company_detail.transfer_to_user", {
                              name: user.name,
                            })}
                          >
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleOpenTransfer(user.uid)}
                              aria-label={t("company_detail.transfer_to_user", {
                                name: user.name,
                              })}
                            >
                              <EmojiEventsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Members are server-paginated; without these controls everything past the
          first page was invisible and unreachable. */}
      {!usersLoading && totalUsers > 0 && (
        <Pagination
          meta={{
            total: totalUsers,
            page,
            pageSize: limit,
            totalPages: totalUserPages,
            hasNextPage: page < totalUserPages,
            hasPreviousPage: page > 1,
          }}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {/* Dialogs */}
      <TransferOwnershipDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        companyUid={uid ?? ""}
        users={transferCandidates}
        defaultUserUid={transferTargetUid}
      />

      <ForceJoinDialog
        open={forceJoinDialogOpen}
        onClose={() => setForceJoinDialogOpen(false)}
        companyUid={uid ?? ""}
      />
    </Box>
  );
};

export default CompanyDetailPage;
