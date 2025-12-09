import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'react-i18next';

interface TeamMemberCardProps {
  uid: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
  onEditRole?: (uid: string) => void;
  onRemove?: (uid: string) => void;
  canManage: boolean;
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
    <Card sx={{ height: '100%', width: 360, maxWidth: '100%', mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={profilePicture}
            alt={name}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>
            </Box>
          </Box>
          {canManage && (
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {roles?.map((role) => (
            <Chip
              key={role}
              label={t(`company_roles.roles.${role}`)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onEditRole && (
          <MenuItem onClick={handleEditRole}>{t('team.edit_role')}</MenuItem>
        )}
        {onRemove && (
          <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
            {t('team.remove_member')}
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TeamMemberCard;
