import {
  Close as CloseIcon,
  Home as HomeIcon,
  WorkOutline as CareersIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemButtonBaseProps,
  ListItemText,
  ListItemIcon,
  PropTypes,
  Box,
  Typography,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User } from "../../types/user.types";
import { isAdmin, canManageResources } from "../../utils/permissions";
import UserAvatar from "../user/UserAvatar";

type NavbarDrawerProps = {
  isOpen?: boolean;
  onClose?: () => void;
  color?: PropTypes.Color;
  linkSx?: ListItemButtonBaseProps["sx"];
  handleMenuClick?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
};

const NavbarDrawer: React.FC<NavbarDrawerProps> = ({
  isOpen,
  onClose,
  color,
  linkSx,
  handleMenuClick,
  isAuthenticated,
  user,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Modern drawer link styling
  const drawerLinkSx = {
    borderRadius: 2,
    mx: 1,
    my: 0.5,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: alpha(theme.palette.secondary.light, 0.1),
      transform: "translateX(4px)",
    },
    "&.active": {
      bgcolor: alpha(theme.palette.secondary.main, 0.15),
      color: "secondary.main",
      fontWeight: 600,
      borderLeft: `4px solid ${theme.palette.secondary.main}`,
      "&:hover": {
        bgcolor: alpha(theme.palette.secondary.main, 0.2),
      },
    },
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      id="navbar-drawer"
      aria-label={t("aria.navigation")}
      sx={{
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          backgroundImage: "none",
        },
      }}
      SlideProps={{
        timeout: {
          enter: 300,
          exit: 250,
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            {t("navbar.menu")}
          </Typography>
          <IconButton
            onClick={handleMenuClick}
            aria-label={t("aria.close_drawer")}
            sx={{
              color: "inherit",
              "&:hover": {
                bgcolor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Profile Section (if authenticated) */}
        {isAuthenticated && user && (
          <>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: alpha(theme.palette.secondary.light, 0.05),
              }}
            >
              <UserAvatar name={user.name} avatarUrl={user.profilePicture} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {/* Navigation Links */}
        <List sx={{ py: 2, flexGrow: 1 }} role="navigation">
          <ListItemButton
            component={NavLink}
            sx={drawerLinkSx}
            to="/"
            end
            onClick={handleMenuClick}
            aria-label={t("navbar.home")}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={t("navbar.home")} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            sx={drawerLinkSx}
            to="/careers"
            onClick={handleMenuClick}
            aria-label={t("navbar.careers")}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CareersIcon />
            </ListItemIcon>
            <ListItemText primary={t("navbar.careers")} />
          </ListItemButton>

          {/* HR Panel (for HR users) */}
          {isAuthenticated && canManageResources(user ?? null) && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                component={NavLink}
                sx={drawerLinkSx}
                to="/hr/dashboard"
                onClick={handleMenuClick}
                aria-label={t("navbar.hr_panel")}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary={t("navbar.hr_panel")} />
              </ListItemButton>
            </>
          )}

          {/* Admin Panel (for admins) */}
          {isAuthenticated && isAdmin(user ?? null) && (
            <ListItemButton
              component={NavLink}
              sx={drawerLinkSx}
              to="/admin"
              onClick={handleMenuClick}
              aria-label={t("navbar.admin_panel")}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary={t("navbar.admin_panel")} />
            </ListItemButton>
          )}
        </List>

        {/* Bottom Actions */}
        <Divider />
        <List sx={{ py: 2 }}>
          {isAuthenticated ? (
            <ListItemButton
              component={NavLink}
              sx={drawerLinkSx}
              to="/logout"
              onClick={handleMenuClick}
              aria-label={t("navbar.logout")}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={t("navbar.logout")} />
            </ListItemButton>
          ) : (
            <>
              <ListItemButton
                component={NavLink}
                sx={drawerLinkSx}
                to="/login"
                onClick={handleMenuClick}
                aria-label={t("navbar.login")}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary={t("navbar.login")} />
              </ListItemButton>
              <ListItemButton
                component={NavLink}
                sx={{
                  ...drawerLinkSx,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
                to="/register"
                onClick={handleMenuClick}
                aria-label={t("navbar.signup")}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                  <SignupIcon />
                </ListItemIcon>
                <ListItemText primary={t("navbar.signup")} />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default NavbarDrawer;
