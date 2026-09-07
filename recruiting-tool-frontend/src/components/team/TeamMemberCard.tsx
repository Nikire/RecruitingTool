import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EmailIcon from "@mui/icons-material/Email";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "../common";
import { wrapLongText } from "../../utils/textOverflow";

interface TeamMemberCardProps {
  uid: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
  onEditRole?: (uid: string) => void;
  onRemove?: (uid: string) => void;
  canManage: boolean;
  /** True when this card represents the signed-in user; hides the actions menu. */
  isSelf?: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  uid,
  name,
  email,
  roles,
  profilePicture,
  onEditRole,
  onRemove,
  canManage,
  isSelf = false,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditRole = () => {
    onEditRole?.(uid);
    handleMenuClose();
  };

  const handleRemove = () => {
    onRemove?.(uid);
    handleMenuClose();
  };

  return (
    <Card sx={{ height: "100%", width: 360, maxWidth: "100%", mx: "auto" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar
            src={profilePicture}
            alt={name}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" sx={wrapLongText}>
              {name}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
            >
              <EmailIcon
                sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={wrapLongText}
              >
                {email}
              </Typography>
            </Box>
          </Box>
          {isSelf ? (
            <Chip
              label={t("team.you")}
              size="small"
              variant="filled"
              sx={{ flexShrink: 0 }}
            />
          ) : (
            canManage && (
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ flexShrink: 0 }}
                aria-label={t("aria.actions")}
              >
                <MoreVertIcon />
              </IconButton>
            )
          )}
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {roles?.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onEditRole && (
          <MenuItem onClick={handleEditRole}>{t("team.edit_role")}</MenuItem>
        )}
        {onRemove && (
          <MenuItem onClick={handleRemove} sx={{ color: "error.main" }}>
            {t("team.remove_member")}
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TeamMemberCard;
