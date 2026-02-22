import React from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface RoleBadgeProps {
  role: string;
}

/**
 * Shared role badge/pill component used across the application to display
 * user roles consistently. Translates role names using the company_roles.roles
 * i18n namespace.
 */
const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const { t } = useTranslation();

  return (
    <Chip
      key={role}
      label={t(`company_roles.roles.${role}`, { defaultValue: role })}
      size="small"
      color="primary"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default RoleBadge;
