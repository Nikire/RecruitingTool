import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  Chip,
  Alert,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../hooks/api/state/useUserAtom";
import InviteTeamMemberDialog from "../components/team/InviteTeamMemberDialog";
import TeamMemberCard from "../components/team/TeamMemberCard";
import ChangeRoleDialog from "../components/team/ChangeRoleDialog";
import ConfirmDeleteDialog from "../components/dialogs/ConfirmDeleteDialog";
import {
  useCompanyMembers,
  useUpdateUserRole,
  useRemoveUserFromCompany,
} from "../hooks/api/useCompanyRoles";
import {
  useCompanyInvitations,
  useCancelInvitation,
} from "../hooks/useInvitations";
import { useCompanyConnectionRequests } from "../hooks/connection-requests";
import { ConnectionRequestsList } from "../components/connection-requests";
import { ConnectionRequestStatus } from "../types/connection-requests";
import { InvitationStatus } from "../types/invitations";
import { UserRoles } from "../types/user.types";
import {
  PageHeader,
  CenteredLoadingSpinner,
  QuotaBanner,
} from "../components/common";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const TeamManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [activeTab, setActiveTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Remove member state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    uid: string;
    name: string;
  } | null>(null);

  // Change role state
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [memberToChangeRole, setMemberToChangeRole] = useState<{
    uid: string;
    name: string;
    roles: string[];
  } | null>(null);

  const companyUid = user?.company?.uid || "";

  // Check if user can manage team
  const canManage = Boolean(
    user?.roles?.includes(UserRoles.COMPANY_OWNER) ||
    user?.roles?.includes(UserRoles.COMPANY_ADMIN) ||
    user?.roles?.includes(UserRoles.ADMIN),
  );

  // Fetch data
  const { data: members, isLoading: isLoadingMembers } =
    useCompanyMembers(companyUid);
  const { data: invitations, isLoading: isLoadingInvitations } =
    useCompanyInvitations(companyUid);
  // Pending connection requests are an owner/admin-only endpoint (403 for
  // anyone else), so only query when the viewer can actually manage them.
  // Same query key as <ConnectionRequestsList />, so React Query dedupes it.
  const { data: connectionRequests } = useCompanyConnectionRequests(
    canManage ? companyUid : "",
    {
      status: ConnectionRequestStatus.PENDING,
    },
  );

  const { mutate: cancelInvitation } = useCancelInvitation(companyUid);
  const { mutate: removeUserFromCompany, isPending: isRemoving } =
    useRemoveUserFromCompany(companyUid);
  const { mutate: updateUserRole, isPending: isUpdatingRole } =
    useUpdateUserRole(companyUid);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCancelInvitation = (invitationUid: string) => {
    if (window.confirm(t("team.confirm_cancel_invitation"))) {
      cancelInvitation(invitationUid);
    }
  };

  // Remove member handlers
  const handleRemoveMember = (uid: string) => {
    const member = members?.find((m) => m.uid === uid);
    if (member) {
      setMemberToRemove({ uid: member.uid, name: member.name });
      setRemoveDialogOpen(true);
    }
  };

  const handleConfirmRemove = () => {
    if (memberToRemove) {
      removeUserFromCompany(memberToRemove.uid, {
        onSuccess: () => {
          setRemoveDialogOpen(false);
          setMemberToRemove(null);
        },
      });
    }
  };

  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  // Change role handlers
  const handleEditRole = (uid: string) => {
    const member = members?.find((m) => m.uid === uid);
    if (member) {
      setMemberToChangeRole({
        uid: member.uid,
        name: member.name,
        roles: member.roles,
      });
      setChangeRoleDialogOpen(true);
    }
  };

  const handleConfirmChangeRole = (memberUid: string, roles: UserRoles[]) => {
    updateUserRole(
      { userUid: memberUid, data: { roles } },
      {
        onSuccess: () => {
          setChangeRoleDialogOpen(false);
          setMemberToChangeRole(null);
        },
      },
    );
  };

  const handleCloseChangeRoleDialog = () => {
    setChangeRoleDialogOpen(false);
    setMemberToChangeRole(null);
  };

  if (!user?.company) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{t("team.no_company")}</Alert>
      </Box>
    );
  }

  const pendingInvitations =
    invitations?.filter((inv) => inv.status === InvitationStatus.PENDING) || [];

  return (
    <Box>
      <PageHeader
        title="team.page_title"
        action={
          canManage
            ? {
                label: "team.invite_member",
                icon: <AddIcon />,
                onClick: () => setInviteDialogOpen(true),
              }
            : undefined
        }
      />

      <QuotaBanner resource="users" labelKey="subscription.quota.users" />

      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 72,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<GroupIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.current_members")}
                <Chip
                  label={members?.length || 0}
                  size="small"
                  color="default"
                  sx={{ ml: 0.5 }}
                />
              </Box>
            }
          />
          <Tab
            icon={<MailIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.pending_invitations")}
                <Chip
                  label={pendingInvitations.length}
                  size="small"
                  color={pendingInvitations.length > 0 ? "primary" : "default"}
                  sx={{ ml: 0.5 }}
                />
              </Box>
            }
          />
          <Tab
            icon={<PendingIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.connection_requests")}
                <Chip
                  label={connectionRequests?.length || 0}
                  size="small"
                  color={
                    connectionRequests && connectionRequests.length > 0
                      ? "warning"
                      : "default"
                  }
                  sx={{ ml: 0.5 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Current Members Tab */}
      <TabPanel value={activeTab} index={0}>
        {isLoadingMembers ? (
          <CenteredLoadingSpinner minHeight="30vh" />
        ) : !members || members.length === 0 ? (
          <Alert severity="info">{t("team.no_members")}</Alert>
        ) : (
          <Grid
            container
            spacing={3}
            alignItems="stretch"
            justifyContent="center"
          >
            {members.map((member) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={member.uid}
                sx={{ display: "flex" }}
              >
                <TeamMemberCard
                  uid={member.uid}
                  name={member.name}
                  email={member.email}
                  roles={member.roles}
                  profilePicture={member.profilePicture}
                  canManage={canManage}
                  onEditRole={canManage ? handleEditRole : undefined}
                  onRemove={canManage ? handleRemoveMember : undefined}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Pending Invitations Tab */}
      <TabPanel value={activeTab} index={1}>
        {isLoadingInvitations ? (
          <CenteredLoadingSpinner minHeight="30vh" />
        ) : pendingInvitations.length === 0 ? (
          <Alert severity="info" icon={<MailIcon />}>
            {t("team.no_pending_invitations")}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {pendingInvitations.map((invitation) => (
              <Card
                key={invitation.uid}
                elevation={2}
                sx={{
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <MailIcon color="primary" fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {invitation.email}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {t("team.invited_as", {
                            role: t(`roles.${invitation.role.toLowerCase()}`),
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("team.invited_by", {
                            name: invitation.invitedByName,
                          })}{" "}
                          •{" "}
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={t(`team.expires_at`, {
                          date: new Date(
                            invitation.expiresAt,
                          ).toLocaleDateString(),
                        })}
                        size="small"
                        variant="filled"
                        color="warning"
                      />
                      {canManage && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelInvitation(invitation.uid)}
                        >
                          {t("common.cancel")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </TabPanel>

      {/* Connection Requests Tab */}
      <TabPanel value={activeTab} index={2}>
        {!canManage ? (
          <Alert severity="info" icon={<PendingIcon />}>
            {t("team.connection_requests_no_permission")}
          </Alert>
        ) : (
          // ConnectionRequestsList owns the list, the approve/deny dialogs and
          // the mutations. The page previously inlined a copy of the cards whose
          // Approve/Deny buttons had no onClick handler at all.
          <ConnectionRequestsList companyUid={companyUid} />
        )}
      </TabPanel>

      {/* Invite Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        companyUid={companyUid}
      />

      {/* Remove Member Dialog */}
      <ConfirmDeleteDialog
        open={removeDialogOpen}
        onClose={handleCloseRemoveDialog}
        onConfirm={handleConfirmRemove}
        title={t("team.remove_member_title")}
        message={t("team.remove_member_confirm", {
          name: memberToRemove?.name || "",
        })}
        isDeleting={isRemoving}
        confirmText={t("team.remove_member_button")}
      />

      {/* Change Role Dialog */}
      {memberToChangeRole && (
        <ChangeRoleDialog
          open={changeRoleDialogOpen}
          onClose={handleCloseChangeRoleDialog}
          memberName={memberToChangeRole.name}
          memberUid={memberToChangeRole.uid}
          currentRoles={memberToChangeRole.roles}
          onConfirm={handleConfirmChangeRole}
          isPending={isUpdatingRole}
        />
      )}
    </Box>
  );
};

export default TeamManagementPage;
