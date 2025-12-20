import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ContactSupport as ContactIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserRoles } from "../../types/user.types";
import { useAuthMe } from "../../hooks/api/useAuth";
import { getDefaultDashboard } from "../../utils/permissions";

interface UnauthorizedAccessProps {
  requiredRoles: UserRoles[];
}

/**
 * UnauthorizedAccess component displayed when a user tries to access
 * a route they don't have permission for.
 */
const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  requiredRoles,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthMe();

  const handleGoHome = () => {
    const defaultRoute = user ? getDefaultDashboard(user) : "/";
    navigate(defaultRoute);
  };

  const handleRequestAccess = () => {
    // Navigate to profile or team management where they can request access
    navigate("/settings/team");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: "100%",
          p: 4,
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <BlockIcon
            sx={{
              fontSize: 80,
              color: "error.main",
            }}
          />
        </Box>

        {/* Title */}
        <Typography variant="h4" gutterBottom color="error">
          {t("unauthorized.title")}
        </Typography>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" paragraph>
          {t("unauthorized.description")}
        </Typography>

        {/* Required Roles */}
        <Box sx={{ my: 3, textAlign: "left" }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("unauthorized.required_roles")}
          </Typography>
          <List dense>
            {requiredRoles.map((role) => (
              <ListItem key={role}>
                <ListItemIcon>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={t(`roles.${role.toLowerCase()}`)} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Current Roles */}
        {user && user.roles && user.roles.length > 0 && (
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="subtitle2" gutterBottom>
              {t("unauthorized.your_roles")}
            </Typography>
            <List dense>
              {user.roles.map((role) => (
                <ListItem key={role}>
                  <ListItemIcon>
                    <CheckIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t(`roles.${role.toLowerCase()}`)} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            {t("unauthorized.go_home")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContactIcon />}
            onClick={handleRequestAccess}
          >
            {t("unauthorized.request_access")}
          </Button>
        </Box>

        {/* Help Text */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 3 }}
        >
          {t("unauthorized.help_text")}
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnauthorizedAccess;
