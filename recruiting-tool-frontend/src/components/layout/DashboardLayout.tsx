import React, { useState } from "react";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  AppBar,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAtom } from "jotai";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../common/LanguageSelector";
import { ProfileDropdown } from "../common";
import { NotificationBell } from "../notifications";
import { useNotificationSSE } from "../../hooks/useNotificationSSE";
import { FeedbackButton } from "../feedback";
import { SubscriptionWarningBanner } from "../subscription";
import { useSubscription } from "../../api/subscription";
import { EmailVerificationBanner } from "../common";
import AddEmailBanner from "../navbar/AddEmailBanner";
import { themeModeAtom } from "../../store/preferences.atoms";

const drawerWidth = 240;

/**
 * Menu item configuration for DashboardLayout
 */
export interface DashboardMenuItem {
  /** Display text for menu item (can be i18n key or plain text) */
  text: string;
  /** Icon element to display */
  icon: React.ReactNode;
  /** Navigation path */
  path: string;
  /** Whether this item requires super admin role */
  requiresSuperAdmin?: boolean;
}

/**
 * Grouped menu section with collapsible children
 */
export interface DashboardMenuGroup {
  /** Display label for the group header */
  label: string;
  /** Icon for the group header */
  icon: React.ReactNode;
  /** Child menu items */
  items: DashboardMenuItem[];
}

/**
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Title displayed in drawer and app bar (can be i18n key or plain text) */
  title: string;
  /** Flat menu items shown at the top of the nav list */
  menuItems?: DashboardMenuItem[];
  /** Grouped/collapsible menu sections */
  menuGroups?: DashboardMenuGroup[];
  /** Child components (typically from Outlet) */
  children?: React.ReactNode;
  /** ARIA label for navigation */
  ariaLabel?: string;
  /** Whether to translate title and menu items using i18n (default: false) */
  translate?: boolean;
  /** Function to check if user has required permissions for menu items */
  canShowMenuItem?: (item: DashboardMenuItem) => boolean;
}

/**
 * DashboardLayout - Reusable layout component for dashboard pages
 *
 * Provides a consistent layout with:
 * - Responsive drawer navigation (mobile + desktop)
 * - App bar with user avatar
 * - Navigation menu items
 * - Profile and "Back to Careers" links
 * - Mobile-optimized spacing and layout
 *
 * Used by HRLayout, AdminLayout, and other dashboard layouts.
 *
 * @example
 * ```tsx
 * const menuItems = [
 *   { text: 'Dashboard', icon: <DashboardIcon />, path: '/hr/dashboard' },
 *   { text: 'Applications', icon: <AssignmentIcon />, path: '/hr/applications' },
 * ];
 *
 * <DashboardLayout
 *   title="HR Panel"
 *   menuItems={menuItems}
 *   ariaLabel="hr navigation"
 * />
 * ```
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  menuItems = [],
  menuGroups = [],
  children,
  ariaLabel = "dashboard navigation",
  translate = false,
  canShowMenuItem,
}) => {
  const { user } = useUserAtom();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: subscription } = useSubscription();
  const [themeMode, setThemeMode] = useAtom(themeModeAtom);

  // Track which groups are open (auto-open if current route is inside the group)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      const isActive = group.items.some((item) =>
        location.pathname.startsWith(item.path),
      );
      initial[group.label] = isActive;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleThemeToggle = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  // Establish SSE connection for real-time notifications
  useNotificationSSE();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Translate title if requested
  const displayTitle = translate ? t(title) : title;

  // Filter menu items based on permission check
  const visibleMenuItems = canShowMenuItem
    ? menuItems.filter(canShowMenuItem)
    : menuItems;

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ bgcolor: "primary.main", flexShrink: 0 }}>
        <Box
          component="img"
          src="/borderless-logo-light.png"
          alt="Borderless ATS"
          sx={{ height: 28, width: "auto", mr: 1 }}
        />
      </Toolbar>
      <Divider />
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: (theme) =>
            `${theme.palette.primary.main} transparent`,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 3,
            bgcolor: "primary.main",
            opacity: 0.6,
          },
        }}
      >
        {/* Flat items */}
        {visibleMenuItems.map((item) => {
          const itemText = translate ? t(item.text) : item.text;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                end={item.path.endsWith("/dashboard") || item.path === "/admin"}
                sx={{
                  "&.active": {
                    bgcolor: "primary.dark",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
                onClick={() => setMobileOpen(false)}
                aria-label={itemText}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={itemText} />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Grouped items */}
        {menuGroups.map((group) => {
          const visibleGroupItems = canShowMenuItem
            ? group.items.filter(canShowMenuItem)
            : group.items;
          if (visibleGroupItems.length === 0) return null;
          const isOpen = !!openGroups[group.label];
          return (
            <React.Fragment key={group.label}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={isOpen}
                >
                  <ListItemIcon>{group.icon}</ListItemIcon>
                  <ListItemText primary={group.label} />
                  {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              <Collapse in={isOpen} unmountOnExit>
                <List disablePadding>
                  {visibleGroupItems.map((item) => {
                    const itemText = translate ? t(item.text) : item.text;
                    return (
                      <ListItem key={item.text} disablePadding>
                        <ListItemButton
                          component={NavLink}
                          to={item.path}
                          end={
                            item.path.endsWith("/dashboard") ||
                            item.path === "/admin"
                          }
                          sx={{
                            pl: 4,
                            "&.active": {
                              bgcolor: "primary.dark",
                              color: "primary.contrastText",
                              "& .MuiListItemIcon-root": {
                                color: "primary.contrastText",
                              },
                            },
                          }}
                          onClick={() => setMobileOpen(false)}
                          aria-label={itemText}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={itemText} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
      <Divider />
      <List sx={{ flexShrink: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/profile"
            onClick={() => setMobileOpen(false)}
            aria-label={translate ? t("common.my_profile") : "My Profile"}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={translate ? t("common.my_profile") : "My Profile"}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/profile/subscription"
            onClick={() => setMobileOpen(false)}
            aria-label={translate ? t("common.subscription") : "Subscription"}
          >
            <ListItemIcon>
              <SubscriptionsIcon />
            </ListItemIcon>
            <ListItemText
              primary={translate ? t("common.subscription") : "Subscription"}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setMobileOpen(false);
              navigate("/careers");
            }}
            aria-label={
              translate ? t("common.back_to_careers") : "Back to Careers"
            }
          >
            <ListItemIcon>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                translate ? t("common.back_to_careers") : "Back to Careers"
              }
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ display: "flex" }}>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label={ariaLabel}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            aria-label={ariaLabel}
          >
            {drawer}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
            aria-label={ariaLabel}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* App bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
          component="div"
          role="banner"
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label={
                mobileOpen ? t("aria.close_drawer") : t("aria.open_drawer")
              }
              aria-expanded={mobileOpen}
              aria-controls="dashboard-drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {displayTitle}
            </Typography>
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
              >
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <LanguageSelector />
            <NotificationBell />
            <ProfileDropdown
              name={user?.name}
              avatarUrl={user?.profilePicture}
            />
          </Toolbar>
        </AppBar>
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          p: { xs: 2, sm: 3 },
        }}
        role="main"
        aria-label={t("aria.main_content")}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <AddEmailBanner />
        <EmailVerificationBanner />
        {subscription && (
          <SubscriptionWarningBanner subscription={subscription} />
        )}
        {children || <Outlet />}
      </Box>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </Box>
  );
};

export default DashboardLayout;
