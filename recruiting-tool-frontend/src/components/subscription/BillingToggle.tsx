import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export type BillingInterval = "monthly" | "annual";

interface BillingToggleProps {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  discount?: number; // Percentage discount for annual billing
}

const BillingToggle: React.FC<BillingToggleProps> = ({
  value,
  onChange,
  discount = 20,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newInterval: BillingInterval | null,
  ) => {
    if (newInterval !== null) {
      onChange(newInterval);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        mb: 4,
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label={t("subscription.billing.toggle_label")}
        sx={{
          backgroundColor: "background.paper",
          boxShadow: 1,
          "& .MuiToggleButton-root": {
            px: 4,
            py: 1.5,
            border: "none",
            fontWeight: "medium",
            textTransform: "none",
            fontSize: "1rem",
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
            "&:not(.Mui-selected)": {
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
          },
        }}
      >
        <ToggleButton
          value="monthly"
          aria-label={t("subscription.billing.monthly")}
        >
          {t("subscription.billing.monthly")}
        </ToggleButton>
        <ToggleButton
          value="annual"
          aria-label={t("subscription.billing.annual")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>{t("subscription.billing.annual")}</span>
            {value === "annual" && (
              <Chip
                label={t("subscription.billing.save_percent", {
                  percent: discount,
                })}
                size="small"
                color="success"
                sx={{
                  height: 20,
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            )}
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      {value === "annual" && (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          {t("subscription.billing.annual_savings", { percent: discount })}
        </Typography>
      )}
    </Box>
  );
};

export default BillingToggle;
