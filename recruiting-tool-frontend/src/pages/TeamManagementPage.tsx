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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import PendingIcon from "@mui/icons-material/Pending";
import { useTranslation } from "react-i18next";
import { useUserAtom } from "../hooks/api/state/useUserAtom";
import InviteTeamMemberDialog from "../components/team/InviteTeamMemberDialog";
import TeamMemberCard from "../components/team/TeamMemberCard";
import { useCompanyMembers } from "../hooks/useCompanyRoles";
import {
  useCompanyInvitations,
  useCancelInvitation,
} from "../hooks/useInvitations";
import { useCompanyConnectionRequests } from "../hooks/useConnectionRequests";
import { InvitationStatus } from "../types/invitations";
import { PageHeader, CenteredLoadingSpinner } from "../components/common";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TeamManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();
  const [activeTab, setActiveTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const companyUid = user?.company?.uid || "";

  // Fetch data
  const { data: members, isLoading: isLoadingMembers } =
    useCompanyMembers(companyUid);
  const { data: invitations, isLoading: isLoadingInvitations } =
    useCompanyInvitations(companyUid);
  const { data: connectionRequests, isLoading: isLoadingRequests } =
    useCompanyConnectionRequests(companyUid, "PENDING");

  const { mutate: cancelInvitation } = useCancelInvitation(companyUid);

  // Check if user can manage team
  const canManage =
    user?.roles?.includes("COMPANY_OWNER") ||
    user?.roles?.includes("COMPANY_ADMIN") ||
    user?.roles?.includes("ADMIN");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCancelInvitation = (invitationUid: string) => {
    if (window.confirm(t("team.confirm_cancel_invitation"))) {
      cancelInvitation(invitationUid);
    }
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
    <Box sx={{ p: 3 }}>
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

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            icon={<GroupIcon />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.current_members")}
                <Chip label={members?.length || 0} size="small" />
              </Box>
            }
          />
          <Tab
            icon={<MailIcon />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.pending_invitations")}
                <Chip
                  label={pendingInvitations.length}
                  size="small"
                  color="primary"
                />
              </Box>
            }
          />
          <Tab
            icon={<PendingIcon />}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t("team.connection_requests")}
                <Chip
                  label={connectionRequests?.length || 0}
                  size="small"
                  color="warning"
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
          <Grid container spacing={3}>
            {members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.uid}>
                <TeamMemberCard
                  uid={member.uid}
                  name={member.name}
                  email={member.email}
                  roles={member.roles}
                  profilePicture={member.profilePicture}
                  canManage={canManage}
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
          <Alert severity="info">{t("team.no_pending_invitations")}</Alert>
        ) : (
          <Grid container spacing={2}>
            {pendingInvitations.map((invitation) => (
              <Grid item xs={12} key={invitation.uid}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h6">{invitation.email}</Typography>
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
                      </Box>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Chip
                          label={t(`team.expires_at`, {
                            date: new Date(
                              invitation.expiresAt,
                            ).toLocaleDateString(),
                          })}
                          size="small"
                          variant="outlined"
                        />
                        {canManage && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              handleCancelInvitation(invitation.uid)
                            }
                          >
                            {t("common.cancel")}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Connection Requests Tab */}
      <TabPanel value={activeTab} index={2}>
        {isLoadingRequests ? (
          <CenteredLoadingSpinner minHeight="30vh" />
        ) : !connectionRequests || connectionRequests.length === 0 ? (
          <Alert severity="info">{t("team.no_connection_requests")}</Alert>
        ) : (
          <Grid container spacing={2}>
            {connectionRequests.map((request) => (
              <Grid item xs={12} key={request.uid}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h6">{request.userName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.userEmail}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {t("team.requested_role", {
                            role: t(
                              `roles.${request.requestedRole.toLowerCase()}`,
                            ),
                          })}
                        </Typography>
                        {request.message && (
                          <Typography variant="caption" color="text.secondary">
                            {request.message}
                          </Typography>
                        )}
                      </Box>
                      {canManage && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                          >
                            {t("team.approve")}
                          </Button>
                          <Button variant="outlined" color="error" size="small">
                            {t("team.deny")}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Invite Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        companyUid={companyUid}
      />
    </Box>
  );
};

export default TeamManagementPage;
