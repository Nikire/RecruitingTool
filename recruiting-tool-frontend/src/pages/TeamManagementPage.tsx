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
  Divider,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
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
                          • {new Date(invitation.createdAt).toLocaleDateString()}
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
                        variant="outlined"
                        color="warning"
                      />
                      {canManage && (
                        <Button
                          size="small"
                          variant="outlined"
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
        {isLoadingRequests ? (
          <CenteredLoadingSpinner minHeight="30vh" />
        ) : !connectionRequests || connectionRequests.length === 0 ? (
          <Alert severity="info" icon={<PendingIcon />}>
            {t("team.no_connection_requests")}
          </Alert>
        ) : (
          <Stack spacing={2}>
            {connectionRequests.map((request) => (
              <Card
                key={request.uid}
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
                        <PendingIcon color="warning" fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {request.userName}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {request.userEmail}
                        </Typography>
                        <Chip
                          label={t("team.requested_role", {
                            role: t(
                              `roles.${request.requestedRole.toLowerCase()}`,
                            ),
                          })}
                          size="small"
                          color="primary"
                          sx={{ width: "fit-content" }}
                        />
                        {request.message && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              backgroundColor: "action.hover",
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: "primary.main",
                            }}
                          >
                            <Typography variant="caption" fontStyle="italic">
                              "{request.message}"
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                    {canManage && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          startIcon={<CheckCircleIcon />}
                        >
                          {t("team.approve")}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="medium"
                          startIcon={<CancelIcon />}
                        >
                          {t("team.deny")}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </TabPanel>

      {/* Invite Dialog */}
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        companyUid={companyUid}
      />
    </Container>
  );
};

export default TeamManagementPage;
