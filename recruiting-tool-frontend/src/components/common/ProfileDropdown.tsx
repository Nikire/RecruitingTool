import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PersonIcon from "@mui/icons-material/Person";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LogoutIcon from "@mui/icons-material/Logout";
import UserAvatar from "../user/UserAvatar";
import { useLogout } from "../../hooks/api/useAuth";

interface ProfileDropdownProps {
  /** User's name for avatar display */
  name?: string;
  /** User's profile picture URL */
  avatarUrl?: string;
}

/**
 * ProfileDropdown - Reusable profile dropdown menu component
 *
 * Provides a consistent profile menu across all layouts with:
 * - User avatar with dropdown menu
 * - Profile navigation
 * - Subscription navigation
 * - Logout functionality
 *
 * Used by DashboardLayout and any layout that shows a profile picture.
 *
 * @example
 * ```tsx
 * <ProfileDropdown name={user?.name} avatarUrl={user?.profilePicture} />
 * ```
 */
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  name,
  avatarUrl,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleSubscription = () => {
    handleClose();
    navigate("/profile/subscription");
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ p: 0.5 }}
        aria-label={t("profile_dropdown.aria_label")}
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} />
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          mt: 1.5,
        }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("profile_dropdown.my_profile")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSubscription}>
          <ListItemIcon>
            <SubscriptionsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("profile_dropdown.subscription")}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("profile_dropdown.logout")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileDropdown;
