import { Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  PropTypes,
  Toolbar,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useAtom } from "jotai";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavbarDrawer from "./NavbarDrawer";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import UserAvatar from "../user/UserAvatar";
import LanguageSelector from "../common/LanguageSelector";
import { NotificationBell } from "../notifications";
import { canManageResources, isAdmin } from "../../utils/permissions";
import { themeModeAtom } from "../../store/preferences.atoms";
import {
  Person as ProfileIcon,
  CreditCard as SubscriptionIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const color: PropTypes.Color = "secondary";

  // Modern link styling with smooth transitions
  const linkSx = {
    textTransform: "none",
    borderRadius: 1,
    px: 2,
    py: 1,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      bgcolor: alpha(theme.palette.secondary.light, 0.15),
      transform: "translateY(-1px)",
    },
    "&.active": {
      bgcolor: alpha(theme.palette.secondary.main, 0.2),
      color: "secondary.contrastText",
      fontWeight: 600,
      "&:hover": {
        bgcolor: alpha(theme.palette.secondary.main, 0.3),
      },
    },
  };

  const { user: logedUser, isAuthenticated } = useUserAtom();
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const handleThemeToggle = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  const handleMenuClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUserMenuNavigation = (path: string) => {
    handleUserMenuClose();
    navigate(path);
  };

  return (
    <>
      <NavbarDrawer
        isOpen={menuOpen}
        color={color}
        linkSx={linkSx}
        onClose={handleMenuClick}
        handleMenuClick={handleMenuClick}
        isAuthenticated={isAuthenticated}
        user={logedUser}
      />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="fixed"
          color={color}
          component="nav"
          role="navigation"
          aria-label={t("aria.navigation")}
          elevation={2}
          sx={{
            backdropFilter: "blur(8px)",
            bgcolor: alpha(theme.palette.secondary.main, 0.95),
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
            {/* Mobile menu button */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label={menuOpen ? t("aria.close_menu") : t("aria.open_menu")}
              aria-expanded={menuOpen}
              aria-controls="navbar-drawer"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                },
              }}
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo/Brand */}
            <Box
              component={NavLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "inherit",
                mr: { xs: "auto", md: 4 },
                "&:hover": {
                  opacity: 0.9,
                },
              }}
              aria-label={t("navbar.home")}
            >
              {isAuthenticated && logedUser?.company?.logoUrl ? (
                <Box
                  component="img"
                  src={logedUser.company.logoUrl}
                  alt={logedUser.company.name || "Company Logo"}
                  sx={{
                    height: { xs: 32, sm: 40 },
                    maxWidth: 150,
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={
                    theme.palette.mode === "dark"
                      ? "/borderless-logo-light.png"
                      : "/borderless-logo-dark.png"
                  }
                  alt="Borderless"
                  sx={{
                    height: { xs: 28, sm: 32 },
                    width: "auto",
                  }}
                />
              )}
            </Box>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1, mr: "auto" }}>
                <Button
                  color="inherit"
                  component={NavLink}
                  to="/"
                  end
                  sx={linkSx}
                  aria-label={t("navbar.home")}
                >
                  {t("navbar.home")}
                </Button>
                <Button
                  color="inherit"
                  component={NavLink}
                  to="/careers"
                  sx={linkSx}
                  aria-label={t("navbar.careers")}
                >
                  {t("navbar.careers")}
                </Button>

                {/* Contact (for unauthenticated users) */}
                {!isAuthenticated && (
                  <Button
                    color="inherit"
                    component={NavLink}
                    to="/contact"
                    sx={linkSx}
                    aria-label={t("navbar.contact")}
                  >
                    {t("navbar.contact")}
                  </Button>
                )}

                {/* HR Panel (for HR users) */}
                {isAuthenticated && canManageResources(logedUser) && (
                  <Button
                    color="inherit"
                    component={NavLink}
                    to="/hr/dashboard"
                    sx={linkSx}
                    aria-label={t("navbar.hr_panel")}
                    startIcon={<DashboardIcon />}
                  >
                    {t("navbar.hr_panel")}
                  </Button>
                )}

                {/* Admin Panel (for admins) */}
                {isAuthenticated && isAdmin(logedUser) && (
                  <Button
                    color="inherit"
                    component={NavLink}
                    to="/admin"
                    sx={linkSx}
                    aria-label={t("navbar.admin_panel")}
                    startIcon={<AdminIcon />}
                  >
                    {t("navbar.admin_panel")}
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

            {/* Right side actions */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* Dark / Light mode toggle */}
              <Tooltip
                title={
                  themeMode === "dark"
                    ? t("theme.switch_to_light")
                    : t("theme.switch_to_dark")
                }
              >
                <IconButton
                  color="inherit"
                  onClick={handleThemeToggle}
                  aria-label={
                    themeMode === "dark"
                      ? t("aria.switch_to_light_mode")
                      : t("aria.switch_to_dark_mode")
                  }
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <LanguageSelector />

              {isAuthenticated ? (
                <>
                  {/* Notifications Bell with Dropdown */}
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <NotificationBell />
                  </Box>

                  {/* User Avatar with Dropdown */}
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      p: 0.5,
                      ml: 0.5,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                    aria-label={t("aria.user_menu")}
                    aria-controls={userMenuAnchor ? "user-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={userMenuAnchor ? "true" : undefined}
                  >
                    <UserAvatar
                      name={logedUser?.name}
                      avatarUrl={logedUser?.profilePicture}
                    />
                  </IconButton>

                  {/* User Menu Dropdown */}
                  <Menu
                    id="user-menu"
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                      paper: {
                        elevation: 3,
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 2,
                          "& .MuiMenuItem-root": {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              bgcolor: alpha(
                                theme.palette.secondary.light,
                                0.1,
                              ),
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => handleUserMenuNavigation("/profile")}
                    >
                      <ListItemIcon>
                        <ProfileIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{t("navbar.profile")}</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        handleUserMenuNavigation("/profile/subscription")
                      }
                    >
                      <ListItemIcon>
                        <SubscriptionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{t("navbar.subscription")}</ListItemText>
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={() => handleUserMenuNavigation("/logout")}
                    >
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText sx={{ color: "error.main" }}>
                        {t("navbar.logout")}
                      </ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={NavLink}
                    to="/login"
                    sx={{
                      ...linkSx,
                      display: { xs: "none", sm: "inline-flex" },
                    }}
                    aria-label={t("navbar.login")}
                  >
                    {t("navbar.login")}
                  </Button>
                  <Button
                    variant="contained"
                    component={NavLink}
                    to="/register"
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      boxShadow: 2,
                      display: { xs: "none", sm: "inline-flex" },
                      "&:hover": {
                        bgcolor: "primary.dark",
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                    aria-label={t("navbar.signup")}
                  >
                    {t("navbar.signup")}
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};

export default Navbar;
