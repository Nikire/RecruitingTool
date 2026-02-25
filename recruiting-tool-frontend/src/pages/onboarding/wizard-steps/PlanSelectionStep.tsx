import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import { SubscriptionPlan } from "../../../types/subscription.types";

interface PlanSelectionStepProps {
  selectedPlan: SubscriptionPlan | null;
  onNext: (plan: SubscriptionPlan) => void;
}

interface PlanFeature {
  key: string;
  included: boolean;
}

interface PlanCard {
  plan: SubscriptionPlan;
  nameKey: string;
  priceKey: string;
  descriptionKey: string;
  features: PlanFeature[];
  recommended?: boolean;
  color: string;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({ onNext }) => {
  const { t } = useTranslation();

  const plans: PlanCard[] = [
    {
      plan: SubscriptionPlan.FREE,
      nameKey: "onboarding.plans.free.name",
      priceKey: "onboarding.plans.free.price",
      descriptionKey: "onboarding.plans.free.description",
      color: "default",
      features: [
        {
          key: "onboarding.plans.features.basic_candidate_management",
          included: true,
        },
        { key: "onboarding.plans.features.up_to_candidates", included: true },
        { key: "onboarding.plans.features.basic_job_postings", included: true },
        {
          key: "onboarding.plans.features.email_notifications",
          included: true,
        },
        {
          key: "onboarding.plans.features.ai_resume_screening",
          included: false,
        },
        {
          key: "onboarding.plans.features.advanced_analytics",
          included: false,
        },
        { key: "onboarding.plans.features.priority_support", included: false },
      ],
    },
    {
      plan: SubscriptionPlan.PROFESSIONAL,
      nameKey: "onboarding.plans.professional.name",
      priceKey: "onboarding.plans.professional.price",
      descriptionKey: "onboarding.plans.professional.description",
      recommended: true,
      color: "primary",
      features: [
        { key: "onboarding.plans.features.everything_in_free", included: true },
        {
          key: "onboarding.plans.features.unlimited_candidates",
          included: true,
        },
        {
          key: "onboarding.plans.features.ai_resume_screening",
          included: true,
        },
        { key: "onboarding.plans.features.advanced_analytics", included: true },
        {
          key: "onboarding.plans.features.custom_email_templates",
          included: true,
        },
        { key: "onboarding.plans.features.priority_support", included: true },
        {
          key: "onboarding.plans.features.calendar_integration",
          included: true,
        },
      ],
    },
    {
      plan: SubscriptionPlan.ENTERPRISE,
      nameKey: "onboarding.plans.enterprise.name",
      priceKey: "onboarding.plans.enterprise.price",
      descriptionKey: "onboarding.plans.enterprise.description",
      color: "secondary",
      features: [
        {
          key: "onboarding.plans.features.everything_in_professional",
          included: true,
        },
        { key: "onboarding.plans.features.unlimited_users", included: true },
        {
          key: "onboarding.plans.features.dedicated_account_manager",
          included: true,
        },
        {
          key: "onboarding.plans.features.custom_integrations",
          included: true,
        },
        { key: "onboarding.plans.features.sla_guarantee", included: true },
        { key: "onboarding.plans.features.advanced_security", included: true },
        { key: "onboarding.plans.features.custom_branding", included: true },
      ],
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, textAlign: "center" }}>
        {t("onboarding.plan_selection.title")}
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mb: 4, textAlign: "center" }}
      >
        {t("onboarding.plan_selection.subtitle")}
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {plans.map((planCard) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={planCard.plan}
            sx={{ overflow: "visible" }}
          >
            <Card
              elevation={planCard.recommended ? 8 : 2}
              sx={{
                height: "100%",
                width: 360,
                maxWidth: "100%",
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "visible",
                border: planCard.recommended ? 2 : 0,
                borderColor: "primary.main",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              {planCard.recommended && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: 16,
                    bgcolor: "primary.main",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <StarIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight="bold">
                    {t("onboarding.plan_selection.recommended")}
                  </Typography>
                </Box>
              )}

              <CardContent
                sx={{ flexGrow: 1, pt: planCard.recommended ? 4 : 3 }}
              >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {t(planCard.nameKey)}
                </Typography>
                <Typography variant="h3" gutterBottom color="primary">
                  {t(planCard.priceKey)}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 3 }}
                >
                  {t(planCard.descriptionKey)}
                </Typography>

                <List dense>
                  {planCard.features.map((feature, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon
                          sx={{
                            fontSize: 20,
                            color: feature.included
                              ? "success.main"
                              : "text.disabled",
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={t(feature.key)}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: feature.included
                            ? "text.primary"
                            : "text.disabled",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={planCard.recommended ? "contained" : "outlined"}
                  size="large"
                  onClick={() => onNext(planCard.plan)}
                >
                  {t("onboarding.plan_selection.select_plan")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="textSecondary">
          {t("onboarding.plan_selection.change_plan_later")}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlanSelectionStep;
