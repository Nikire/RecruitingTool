import { useState } from "react";
import {
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { useTranslation } from "react-i18next";

/**
 * DataGridToolbarHelp - Help icon with popover for DataGrid features
 *
 * Provides a permanent reference point for users who need
 * a reminder about column menu features.
 */
const DataGridToolbarHelp: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const features = [
    {
      icon: <FilterListIcon fontSize="small" />,
      title: t("dataGrid.help.filter.title"),
      description: t("dataGrid.help.filter.description"),
    },
    {
      icon: <SortIcon fontSize="small" />,
      title: t("dataGrid.help.sort.title"),
      description: t("dataGrid.help.sort.description"),
    },
    {
      icon: <ViewColumnIcon fontSize="small" />,
      title: t("dataGrid.help.columns.title"),
      description: t("dataGrid.help.columns.description"),
    },
  ];

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label={t("dataGrid.help.ariaLabel")}
        aria-describedby={anchorEl ? "datagrid-help-popover" : undefined}
        sx={{
          ml: 1,
          color: "text.secondary",
          "&:hover": {
            color: "primary.main",
          },
        }}
        title={t("dataGrid.help.tooltip")}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        id="datagrid-help-popover"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              maxWidth: 320,
              boxShadow: 4,
            },
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {t("dataGrid.help.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t("dataGrid.help.intro")}
        </Typography>
        <List dense disablePadding>
          {features.map((feature, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{feature.icon}</ListItemIcon>
              <ListItemText
                primary={feature.title}
                secondary={feature.description}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  variant: "caption",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default DataGridToolbarHelp;
