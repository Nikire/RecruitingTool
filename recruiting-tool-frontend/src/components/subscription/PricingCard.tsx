import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { SubscriptionPlan } from "../../types/subscription.types";

export type BillingInterval = "monthly" | "annual";

interface PricingCardProps {
  plan: SubscriptionPlan;
  monthlyPrice: number;
  annualPrice: number;
  interval: BillingInterval;
  features: string[];
  isCurrentPlan: boolean;
  onUpgrade?: () => void;
  upgradeDisabled?: boolean;
  highlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  monthlyPrice,
  annualPrice,
  interval,
  features,
  isCurrentPlan,
  onUpgrade,
  upgradeDisabled = false,
  highlighted = false,
}) => {
  const { t } = useTranslation();

  // Calculate the display price based on interval
  const displayPrice = interval === "annual" ? annualPrice / 12 : monthlyPrice;
  const savings =
    interval === "annual"
      ? Math.round(
          ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100,
        )
      : 0;

  return (
    <Card
      sx={{
        height: "100%",
        width: 360,
        maxWidth: "100%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: highlighted ? 2 : 1,
        borderColor: highlighted ? "primary.main" : "divider",
        boxShadow: highlighted ? 4 : 1,
        transition: "all 0.3s",
        overflow: "visible",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
        },
      }}
    >
      {highlighted && (
        <Chip
          label={t("subscription.recommended")}
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            right: 16,
            zIndex: 1,
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
          {t(`subscription.plans.${plan.toLowerCase()}.name`)}
        </Typography>

        {plan === SubscriptionPlan.FREE ? (
          <Typography variant="h3" component="div" color="primary" gutterBottom>
            {t("subscription.plans.free.price")}
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h3"
              component="div"
              color="primary"
              sx={{ display: "inline" }}
            >
              ${displayPrice.toFixed(0)}
              <Typography
                variant="subtitle1"
                component="span"
                color="text.secondary"
              >
                /{t("subscription.per_month")}
              </Typography>
            </Typography>
            {interval === "annual" && savings > 0 && (
              <Typography
                variant="body2"
                color="success.main"
                fontWeight="medium"
                sx={{ mt: 0.5 }}
              >
                {t("subscription.billing.billed_annually")} •{" "}
                {t("subscription.billing.save_percent", { percent: savings })}
              </Typography>
            )}
            {interval === "monthly" && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {t("subscription.billing.billed_monthly")}
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t(`subscription.plans.${plan.toLowerCase()}.description`)}
        </Typography>

        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ width: "100%" }}>
          {isCurrentPlan ? (
            <Chip
              label={t("subscription.current_plan")}
              color="primary"
              sx={{ width: "100%" }}
            />
          ) : onUpgrade ? (
            <Button
              variant={highlighted ? "contained" : "outlined"}
              fullWidth
              onClick={onUpgrade}
              disabled={upgradeDisabled}
            >
              {t("subscription.upgrade_to_plan")}
            </Button>
          ) : null}
        </Box>
      </CardActions>
    </Card>
  );
};

export default PricingCard;
