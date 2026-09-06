import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Modal,
  Skeleton,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { keyframes } from "@mui/material/styles";
import { useAuthMe } from "../../hooks/api/useAuth";
import { usePlanLimits } from "../../hooks/api/usePlanLimits";
import { UserRoles } from "../../types/user.types";
import { buildPlanFeatures } from "../../utils/buildPlanFeatures";
import type { PlanLimits } from "../../types/subscription.types";
import { SOCIAL_LINKS } from "../../config/social-links";
import {
  AGENCY_MONTHLY_PRICE,
  ANNUAL_DISCOUNT_PERCENT,
  PLAN_PRICING,
  annualDiscountPercent,
  effectiveMonthlyRate,
} from "../../config/pricing";
import BookDemoDialog from "../../components/contact/BookDemoDialog";
import BillingToggle, {
  BillingInterval,
} from "../../components/subscription/BillingToggle";
import Seo from "../../components/common/Seo";
import {
  buildOrganizationLd,
  buildSoftwareApplicationLd,
  SITE_NAME,
} from "../../utils/structuredData";
import { track, ANALYTICS_EVENTS } from "../../analytics";

// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CloudDoneIcon from "@mui/icons-material/CloudDone";

/**
 * Screenshots of the running product, served from `public/screenshots/`.
 *
 * Each caption was written against the image itself, so it describes what the
 * screen actually shows rather than what we wish it showed. The records visible
 * in them come from a demo account — the disclaimer under the slider says so
 * out loud, because pretending sample data is customer data is the first step
 * onto a very slippery slope.
 */
const SLIDES = [
  {
    src: "/screenshots/dashboard-analytics.png",
    titleKey: "landing.product_preview.slides.analytics.title",
    captionKey: "landing.product_preview.slides.analytics.caption",
  },
  {
    src: "/screenshots/dashboard-calendar.png",
    titleKey: "landing.product_preview.slides.calendar.title",
    captionKey: "landing.product_preview.slides.calendar.caption",
  },
  {
    src: "/screenshots/dashboard-hiring-detail.png",
    titleKey: "landing.product_preview.slides.process_detail.title",
    captionKey: "landing.product_preview.slides.process_detail.caption",
  },
  {
    src: "/screenshots/dashboard-hiring-processes.png",
    titleKey: "landing.product_preview.slides.process_list.title",
    captionKey: "landing.product_preview.slides.process_list.caption",
  },
];

/**
 * Prices come from src/config/pricing.ts, which mirrors the live Dodo products.
 * They are NOT derived from a months-charged multiplier: a clean ten-for-twelve
 * multiplier yielded $790/$2,490 while Dodo actually bills $799/$2,499, so the
 * page advertised one number and the checkout charged another.
 */

/**
 * Third-party services Borderless is genuinely wired to. Every entry was
 * verified against backend source before being listed here:
 *  - Google Calendar  -> modules/google-calendar (googleapis OAuth2 client)
 *  - Dodo Payments    -> modules/dodo-payments (dodopayments SDK)
 *  - Resend           -> modules/email (POST https://api.resend.com/emails)
 *  - S3-compatible    -> modules/storage (@aws-sdk/client-s3)
 * Nothing goes in this list that does not have a module behind it.
 */
const INTEGRATIONS = [
  {
    icon: EventAvailableIcon,
    nameKey: "landing.integrations.google_calendar.name",
    descriptionKey: "landing.integrations.google_calendar.description",
  },
  {
    icon: CreditCardIcon,
    nameKey: "landing.integrations.dodo.name",
    descriptionKey: "landing.integrations.dodo.description",
  },
  {
    icon: MarkEmailReadIcon,
    nameKey: "landing.integrations.resend.name",
    descriptionKey: "landing.integrations.resend.description",
  },
  {
    icon: CloudDoneIcon,
    nameKey: "landing.integrations.storage.name",
    descriptionKey: "landing.integrations.storage.description",
  },
];

/**
 * The founder block.
 *
 * With no customers there is no testimonial worth printing, but there is a real
 * person accountable for the product — which is the most credible thing an
 * unknown tool can put on the page. `photo` is optional on purpose: if the file
 * is missing the Avatar falls back to initials rather than rendering a broken
 * image.
 */
/**
 * Static bullets for the Agency tier.
 *
 * Every other tier reads its bullets from `GET /quota/plan-limits`, but that
 * endpoint is keyed by the Prisma SubscriptionPlan enum, which has no AGENCY
 * member yet. These mirror the AGENCY row in
 * `plan-limits.service.ts` so the two do not drift; once AGENCY exists in the
 * enum the API values take over automatically.
 */
const AGENCY_FEATURE_KEYS = [
  "landing.pricing.agency.features.positions",
  "landing.pricing.agency.features.candidates",
  "landing.pricing.agency.features.seats",
  "landing.pricing.agency.features.storage",
  "landing.pricing.agency.features.ai",
  "landing.pricing.agency.features.analytics",
  "landing.pricing.agency.features.templates",
];

/**
 * Static limits for the tiers the API does serve, used only while
 * `GET /quota/plan-limits` is still loading or has failed. They mirror the
 * seeded rows in `plan-limits.service.ts` and run through the same
 * `buildPlanFeatures` as the live data, so the fallback bullets read exactly
 * like the real ones; once the request resolves the API values take over.
 */
const FALLBACK_PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxJobPositions: 1,
    maxCandidatesPerPosition: 50,
    maxUsers: 1,
    maxStorageMB: 500,
    aiScoringEnabled: false,
    aiScoringCreditsPerMonth: 0,
    emailTemplatesEnabled: true,
    analyticsEnabled: false,
  },
  PROFESSIONAL: {
    maxJobPositions: 15,
    maxCandidatesPerPosition: 200,
    maxUsers: -1,
    maxStorageMB: 10000,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: 200,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
  ENTERPRISE: {
    maxJobPositions: -1,
    maxCandidatesPerPosition: -1,
    maxUsers: -1,
    maxStorageMB: -1,
    aiScoringEnabled: true,
    aiScoringCreditsPerMonth: -1,
    emailTemplatesEnabled: true,
    analyticsEnabled: true,
  },
};

/** Switches decorative motion off for visitors who asked the OS for it. */
const REDUCED_MOTION = "@media (prefers-reduced-motion: reduce)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const FOUNDER = {
  photo: "/founder.jpg",
  linkedin: SOCIAL_LINKS.linkedin,
};

// Keyframe animations - More dynamic
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const LandingPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthMe();
  const { data: planLimits, isLoading: planLimitsLoading } = usePlanLimits();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderHovered, setSliderHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlide, setLightboxSlide] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [bookDemoOpen, setBookDemoOpen] = useState(false);
  /**
   * Annual is the default on purpose. Annual prepay is the difference between
   * one month of revenue and ten on the day a customer signs, and a visitor who
   * wants monthly is one click away.
   */
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("annual");

  useEffect(() => {
    if (sliderHovered) return;
    // Respect the OS motion preference: no auto-advance, the visitor uses the
    // arrows and dots instead.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.(REDUCED_MOTION_QUERY).matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderHovered]);

  // Detect applicant-only users (USER role with no HR/admin roles)
  const isApplicantOnly =
    isAuthenticated &&
    user?.roles?.length === 1 &&
    user.roles.includes(UserRoles.USER);

  // Three cards only. Each one maps to a reason an agency switches ATS —
  // multi-client pipelines, bilingual AI screening, and the candidate-facing
  // front end. Anything beyond three dilutes the positioning.
  const features = [
    {
      icon: <GroupWorkIcon sx={{ fontSize: 48 }} />,
      title: t("landing.features.multi_client_pipelines.title"),
      description: t("landing.features.multi_client_pipelines.description"),
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      title: t("landing.features.bilingual_ai_screening.title"),
      description: t("landing.features.bilingual_ai_screening.description"),
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 48 }} />,
      title: t("landing.features.careers_and_scheduling.title"),
      description: t("landing.features.careers_and_scheduling.description"),
      gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
    },
  ];

  const howItWorksSteps = [
    {
      icon: <LooksOneIcon sx={{ fontSize: 60 }} />,
      title: t("landing.how_it_works.step1.title"),
      description: t("landing.how_it_works.step1.description"),
    },
    {
      icon: <LooksTwoIcon sx={{ fontSize: 60 }} />,
      title: t("landing.how_it_works.step2.title"),
      description: t("landing.how_it_works.step2.description"),
    },
    {
      icon: <Looks3Icon sx={{ fontSize: 60 }} />,
      title: t("landing.how_it_works.step3.title"),
      description: t("landing.how_it_works.step3.description"),
    },
  ];

  /**
   * `GET /quota/plan-limits` is typed as `Record<SubscriptionPlan, PlanLimits>`
   * and the SubscriptionPlan union has no AGENCY member yet (that needs the
   * Prisma enum), so the map is read defensively by string key. A tier with no
   * row simply falls back to its static feature list.
   */
  const planLimitsByType = planLimits as
    | Record<string, PlanLimits | undefined>
    | undefined;

  /**
   * API row first, static mirror second: a slow, failed or rate-limited
   * `GET /quota/plan-limits` must never leave a priced card with no bullets.
   */
  const resolvedLimits = (planType: string): PlanLimits | undefined =>
    planLimitsByType?.[planType] ?? FALLBACK_PLAN_LIMITS[planType];

  const featuresForPlan = (planType: string): string[] => {
    const limits = resolvedLimits(planType);
    return limits ? buildPlanFeatures(limits, t) : [];
  };

  /**
   * "Unlimited recruiters" is a claim about a specific number, so it renders
   * only when that number actually says unlimited. If a plan still carries a
   * seat cap the line stays off rather than contradicting the feature bullet
   * three lines below it.
   */
  const seatsAreUnlimited = (planType: string, fallback: boolean): boolean => {
    const limits = resolvedLimits(planType);
    return limits ? limits.maxUsers === -1 : fallback;
  };

  const usd = (value: number): string =>
    `$${new Intl.NumberFormat("en-US").format(value)}`;

  // Agency has no PlanLimit row served by the API yet, so fall back to the
  // static bullets that mirror the seeded AGENCY tier.
  const agencyApiFeatures = featuresForPlan("AGENCY");
  const agencyFeatures = agencyApiFeatures.length
    ? agencyApiFeatures
    : AGENCY_FEATURE_KEYS.map((key) => t(key));

  const pricingPlans = [
    {
      planKey: "FREE",
      name: t("landing.pricing.free.name"),
      monthlyPrice: 0,
      annualPrice: 0,
      description: t("landing.pricing.free.description"),
      features: featuresForPlan("FREE"),
      seatsUnlimited: false,
      recommended: false,
      contactSales: false,
      color: theme.palette.grey[600],
      buttonVariant: "outlined" as const,
      ctaLabel: t("landing.pricing.cta_free"),
    },
    {
      planKey: "PROFESSIONAL",
      name: t("landing.pricing.professional.name"),
      monthlyPrice: PLAN_PRICING.PROFESSIONAL.monthly,
      annualPrice: PLAN_PRICING.PROFESSIONAL.annual,
      description: t("landing.pricing.professional.description"),
      features: featuresForPlan("PROFESSIONAL"),
      seatsUnlimited: seatsAreUnlimited("PROFESSIONAL", false),
      recommended: true,
      contactSales: false,
      color: theme.palette.primary.main,
      buttonVariant: "contained" as const,
      ctaLabel: t("landing.pricing.cta_trial"),
    },
    {
      planKey: "AGENCY",
      name: t("landing.pricing.agency.name"),
      monthlyPrice: AGENCY_MONTHLY_PRICE,
      // Contact-sales only: no Dodo product, so no annual price is ever charged.
      annualPrice: null,
      description: t("landing.pricing.agency.description"),
      features: agencyFeatures,
      seatsUnlimited: seatsAreUnlimited("AGENCY", true),
      recommended: false,
      // Agency cannot be self-served yet: the Prisma SubscriptionPlan enum has
      // no AGENCY member, so no subscription row could record the purchase.
      // Routing to contact is the honest CTA until that lands.
      contactSales: true,
      color: theme.palette.info.main,
      buttonVariant: "outlined" as const,
      ctaLabel: t("landing.pricing.cta_talk"),
    },
    {
      planKey: "ENTERPRISE",
      name: t("landing.pricing.enterprise.name"),
      monthlyPrice: PLAN_PRICING.ENTERPRISE.monthly,
      annualPrice: PLAN_PRICING.ENTERPRISE.annual,
      description: t("landing.pricing.enterprise.description"),
      features: featuresForPlan("ENTERPRISE"),
      seatsUnlimited: seatsAreUnlimited("ENTERPRISE", true),
      recommended: false,
      contactSales: false,
      color:
        theme.palette.mode === "dark"
          ? theme.palette.primary.light
          : theme.palette.secondary.main,
      buttonVariant: "outlined" as const,
      ctaLabel: t("landing.pricing.cta"),
    },
  ];

  // SEO structured data. `offers` is built from the same `pricingPlans` array
  // the cards above render, so the markup can never drift from the prices a
  // visitor actually sees.
  const softwareApplicationLd = useMemo(
    () =>
      buildSoftwareApplicationLd({
        name: SITE_NAME,
        description: t("seo.landing.description"),
        url: "/",
        applicationCategory: "BusinessApplication",
        featureList: [
          t("landing.features.multi_client_pipelines.title"),
          t("landing.features.bilingual_ai_screening.title"),
          t("landing.features.careers_and_scheduling.title"),
        ],
        // Offers are derived from the same `monthlyPrice` numbers the cards
        // render, so the markup cannot drift from the visible price. Monthly
        // list price is quoted regardless of the toggle — it is the higher of
        // the two, and quoting the annual-equivalent rate as the price would
        // read as a cheaper offer than a monthly buyer actually gets.
        offers: pricingPlans.map((plan) => ({
          price: String(plan.monthlyPrice),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: plan.contactSales ? "/contact" : "/register",
        })),
      }),
    // `pricingPlans` is rebuilt on every render, so it is deliberately not a
    // dependency — the offer prices are static list prices that only change
    // when the copy does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const organizationLd = useMemo(
    () =>
      buildOrganizationLd({
        description: t("seo.landing.description"),
        sameAs: [SOCIAL_LINKS.linkedin],
        availableLanguage: ["en", "es"],
      }),
    [t],
  );

  const landingJsonLd = useMemo(
    () => [softwareApplicationLd, organizationLd],
    [softwareApplicationLd, organizationLd],
  );

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /**
   * Records a landing CTA click before navigating.
   *
   * `position` identifies the band the button lives in (hero / pricing /
   * founding / final); `label` identifies the button itself so two CTAs in the
   * same band stay distinguishable. `location` is emitted alongside `position`
   * with the same value because the analytics catalogue documents this event
   * as `{ location, label }`.
   */
  const trackCtaClick = (
    position: "hero" | "pricing" | "founding" | "final",
    label: string,
    plan?: string,
  ) => {
    track(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, {
      position,
      location: position,
      label,
      ...(plan ? { plan } : {}),
    });
  };

  const openBookDemo = (
    position: "hero" | "pricing" | "founding" | "final",
  ) => {
    trackCtaClick(position, "book_demo");
    track(ANALYTICS_EVENTS.DEMO_DIALOG_OPENED, { position });
    setBookDemoOpen(true);
  };

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Seo
        title={t("seo.landing.title")}
        description={t("seo.landing.description")}
        canonical="/"
        jsonLd={landingJsonLd}
      />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          background: `linear-gradient(135deg,
						${theme.palette.primary.main} 0%,
						${theme.palette.primary.dark} 50%,
						${theme.palette.secondary.main} 100%)`,
          backgroundSize: "200% 200%",
          animation: `${gradientShift} 5s ease infinite`,
          [REDUCED_MOTION]: { animation: "none" },
          color: theme.palette.common.white,
          pt: { xs: 10, sm: 12, md: 14 },
          pb: { xs: 8, sm: 10, md: 14 },
          overflow: "hidden",
          minHeight: {
            xs: "auto",
            sm: "calc(100vh - 56px)",
            md: "calc(100vh - 64px)",
          },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Decorative floating elements - more subtle */}
        <Box
          sx={{
            position: "absolute",
            top: "12%",
            right: "8%",
            width: { xs: 60, md: 100 },
            height: { xs: 60, md: 100 },
            borderRadius: "50%",
            background: alpha(theme.palette.common.white, 0.08),
            animation: `${float} 8s ease-in-out infinite`,
            [REDUCED_MOTION]: { animation: "none" },
            filter: "blur(40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            left: "10%",
            width: { xs: 50, md: 80 },
            height: { xs: 50, md: 80 },
            borderRadius: "50%",
            background: alpha(theme.palette.common.white, 0.06),
            animation: `${float} 10s ease-in-out infinite`,
            [REDUCED_MOTION]: { animation: "none" },
            filter: "blur(30px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            left: "5%",
            width: { xs: 40, md: 60 },
            height: { xs: 40, md: 60 },
            borderRadius: "50%",
            background: alpha(theme.palette.common.white, 0.05),
            animation: `${float} 12s ease-in-out infinite`,
            [REDUCED_MOTION]: { animation: "none" },
            filter: "blur(25px)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 5 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 2, md: 1 } }}>
              <Box
                sx={{
                  animation: `${fadeInUp} 0.8s ease-out`,
                  [REDUCED_MOTION]: { animation: "none" },
                }}
              >
                {/* Founding program teaser — amber pill */}
                <Box
                  component="button"
                  onClick={() => scrollToSection("founding-program")}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 3.5,
                    px: 2,
                    py: 0.75,
                    borderRadius: 99,
                    border: `1px solid ${alpha(theme.palette.warning.light, 0.5)}`,
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                    color: theme.palette.warning.light,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.warning.main, 0.25),
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <StarIcon sx={{ fontSize: 14 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      letterSpacing: "0.04em",
                      color: "inherit",
                    }}
                  >
                    {t("landing.hero.founding_teaser")}
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 13 }} />
                </Box>

                {/* Segment eyebrow — tells the visitor in one line who this is
                    for, before the headline tells them what it is. */}
                <Typography
                  variant="overline"
                  component="p"
                  sx={{
                    display: "block",
                    mb: 1.5,
                    fontWeight: 800,
                    fontSize: { xs: "0.75rem", md: "0.82rem" },
                    letterSpacing: "0.12em",
                    lineHeight: 1.6,
                    color: alpha(theme.palette.common.white, 0.85),
                  }}
                >
                  {t("landing.hero.eyebrow")}
                </Typography>

                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 900,
                    // Smaller than the previous four-word headline — the new
                    // one is a full sentence and needs room to wrap cleanly in
                    // the narrow hero column.
                    fontSize: { xs: "2.15rem", sm: "2.6rem", md: "3rem" },
                    lineHeight: 1.15,
                    mb: 3,
                    color: theme.palette.common.white,
                    textShadow: "0 2px 20px rgba(0,0,0,0.1)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("landing.hero.new_headline")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    opacity: 0.92,
                    fontWeight: 400,
                    fontSize: { xs: "1.05rem", sm: "1.2rem", md: "1.3rem" },
                    lineHeight: 1.65,
                    color: alpha(theme.palette.common.white, 0.95),
                  }}
                >
                  {t("landing.hero.new_subheadline")}
                </Typography>
                {!isAuthenticated && (
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 5,
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      lineHeight: 1.6,
                      color: alpha(theme.palette.warning.light, 0.95),
                      fontWeight: 500,
                    }}
                  >
                    {t("landing.hero.founding_subtitle")}
                  </Typography>
                )}
                {isAuthenticated ? (
                  // Logged-in state: Welcome message and context-aware CTA
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 4,
                        opacity: 0.95,
                        fontWeight: 500,
                        fontSize: { xs: "1.1rem", sm: "1.3rem" },
                      }}
                    >
                      {t("landing.hero.welcome_back", { name: user?.name })}
                    </Typography>
                    {isApplicantOnly ? (
                      // Applicant-only users: show Browse Jobs CTA
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/careers")}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: theme.palette.common.white,
                          color: theme.palette.primary.main,
                          px: 6,
                          py: 2.5,
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: "none",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.common.white, 0.95),
                            transform: "translateY(-3px)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.2)",
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {t("landing.hero.cta_browse_jobs")}
                      </Button>
                    ) : (
                      // HR/admin users: show Go to Dashboard CTA
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/hr/dashboard")}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: theme.palette.common.white,
                          color: theme.palette.primary.main,
                          px: 6,
                          py: 2.5,
                          fontSize: "1.125rem",
                          fontWeight: 700,
                          borderRadius: 2.5,
                          textTransform: "none",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.common.white, 0.95),
                            transform: "translateY(-3px)",
                            boxShadow: "0 15px 50px rgba(0,0,0,0.2)",
                          },
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {t("common.go_to_dashboard")}
                      </Button>
                    )}
                  </Box>
                ) : (
                  // Not logged in: Show login/register buttons
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => {
                        trackCtaClick("hero", "start_free");
                        navigate("/register");
                      }}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: theme.palette.common.white,
                        color: theme.palette.primary.main,
                        px: 5,
                        py: 2,
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        borderRadius: 2.5,
                        textTransform: "none",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.common.white, 0.95),
                          transform: "translateY(-3px)",
                          boxShadow: "0 15px 50px rgba(0,0,0,0.2)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {t("landing.hero.cta_start_now")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => openBookDemo("hero")}
                      sx={{
                        borderColor: alpha(theme.palette.common.white, 0.8),
                        bgcolor: "transparent",
                        color: theme.palette.common.white,
                        px: 5,
                        py: 2,
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        borderRadius: 2.5,
                        textTransform: "none",
                        borderWidth: 2,
                        "&:hover": {
                          borderColor: theme.palette.common.white,
                          bgcolor: alpha(theme.palette.common.white, 0.12),
                          borderWidth: 2,
                          transform: "translateY(-3px)",
                        },
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      {t("landing.hero.cta_secondary")}
                    </Button>
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }} sx={{ order: { xs: 1, md: 2 } }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.22)}`,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                  animation: `${scaleIn} 0.8s ease-out 0.3s both`,
                  [REDUCED_MOTION]: { animation: "none" },
                  "& video": {
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  },
                }}
              >
                <video
                  ref={videoRef}
                  controls
                  preload="metadata"
                  onPlay={() => setVideoStarted(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                >
                  <source
                    src="https://api.borderlessats.com/storage/borderless-files/videos/borderless-demo.mp4"
                    type="video/mp4"
                  />
                </video>
                {!videoStarted && (
                  <Box
                    component="button"
                    type="button"
                    aria-label={t("landing.hero.play_video")}
                    onClick={() => videoRef.current?.play()}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      border: "none",
                      p: 0,
                      bgcolor: "black",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      cursor: "pointer",
                      "&:hover .play-icon": {
                        transform: "scale(1.1)",
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/borderless-icon-transp.png"
                      alt="Borderless ATS"
                      sx={{ width: "22%", height: "auto" }}
                    />
                    <PlayCircleFilledIcon
                      className="play-icon"
                      sx={{
                        fontSize: 52,
                        color: "white",
                        opacity: 0.85,
                        transition: "all 0.2s ease",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Product Preview Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: "background.default",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              {t("landing.product_preview.title")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontWeight: 400, maxWidth: 560, mx: "auto" }}
            >
              {t("landing.product_preview.subtitle")}
            </Typography>
          </Box>
          {/* Image slider */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              mx: "auto",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.18)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              aspectRatio: "16/9",
              bgcolor: "black",
            }}
            onMouseEnter={() => setSliderHovered(true)}
            onMouseLeave={() => setSliderHovered(false)}
            // Touch devices never hover: a tap parks the slider so the caption
            // stays put while it is being read. Keyboard focus does the same.
            onTouchStart={() => setSliderHovered(true)}
            onFocus={() => setSliderHovered(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setSliderHovered(false);
              }
            }}
          >
            {/* Slides strip */}
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                transform: `translateX(-${activeSlide * 100}%)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {SLIDES.map((slide, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={slide.src}
                  alt={t(slide.titleKey)}
                  onClick={() => {
                    setLightboxSlide(idx);
                    setZoomed(false);
                    setLightboxOpen(true);
                  }}
                  sx={{
                    flexShrink: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    cursor: "zoom-in",
                  }}
                />
              ))}
            </Box>

            {/* Prev */}
            <IconButton
              aria-label={t("landing.product_preview.prev")}
              onClick={() =>
                setActiveSlide(
                  (prev) => (prev - 1 + SLIDES.length) % SLIDES.length,
                )
              }
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: alpha(theme.palette.common.black, 0.45),
                color: "white",
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.black, 0.7),
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Next */}
            <IconButton
              aria-label={t("landing.product_preview.next")}
              onClick={() =>
                setActiveSlide((prev) => (prev + 1) % SLIDES.length)
              }
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: alpha(theme.palette.common.black, 0.45),
                color: "white",
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.black, 0.7),
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>

            {/* Dot indicators */}
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
              }}
            >
              {SLIDES.map((_, idx) => (
                <Box
                  key={idx}
                  component="button"
                  type="button"
                  aria-label={t("landing.product_preview.go_to_slide", {
                    n: idx + 1,
                  })}
                  aria-current={idx === activeSlide ? "true" : undefined}
                  onClick={() => setActiveSlide(idx)}
                  sx={{
                    width: idx === activeSlide ? 20 : 8,
                    height: 8,
                    p: 0,
                    border: "none",
                    borderRadius: 4,
                    bgcolor:
                      idx === activeSlide
                        ? "white"
                        : alpha(theme.palette.common.white, 0.45),
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Caption for the visible screenshot.
              A screenshot with no caption asks the visitor to guess what they
              are looking at; naming the screen is the cheapest real proof the
              product exists. Fixed min-height so the page does not jump as the
              slider advances. */}
          <Box
            sx={{
              maxWidth: 900,
              mx: "auto",
              mt: 3,
              textAlign: "center",
              minHeight: 92,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, mb: 0.75, letterSpacing: "-0.01em" }}
            >
              {t(SLIDES[activeSlide].titleKey)}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7, maxWidth: 640, mx: "auto" }}
            >
              {t(SLIDES[activeSlide].captionKey)}
            </Typography>
          </Box>

          {/* Says out loud that the records in the screenshots are sample data. */}
          <Typography
            variant="caption"
            component="p"
            color="text.disabled"
            sx={{ mt: 2, textAlign: "center", fontStyle: "italic" }}
          >
            {t("landing.product_preview.demo_data_note")}
          </Typography>
        </Container>
      </Box>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        aria-label={t(SLIDES[lightboxSlide].titleKey)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "95vw", md: "90vw" },
            maxWidth: 1400,
            outline: "none",
          }}
        >
          {/* Controls row */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              px: 0.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                aria-label={
                  zoomed
                    ? t("landing.product_preview.zoom_out")
                    : t("landing.product_preview.zoom_in")
                }
                onClick={() => setZoomed((z) => !z)}
                sx={{
                  bgcolor: alpha("#000", 0.55),
                  color: "white",
                  "&:hover": { bgcolor: alpha("#000", 0.8) },
                }}
              >
                {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
              </IconButton>
              {/* Slide counter */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha("#000", 0.55),
                  color: "white",
                  fontSize: "0.85rem",
                }}
              >
                {lightboxSlide + 1} / {SLIDES.length}
              </Box>
            </Box>
            <IconButton
              aria-label={t("common.close")}
              onClick={() => setLightboxOpen(false)}
              sx={{
                bgcolor: alpha("#000", 0.55),
                color: "white",
                "&:hover": { bgcolor: alpha("#000", 0.8) },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Image container */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxHeight: "85vh",
              overflow: zoomed ? "auto" : "hidden",
              borderRadius: 2,
              bgcolor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={SLIDES[lightboxSlide].src}
              alt={t(SLIDES[lightboxSlide].titleKey)}
              onClick={() => setZoomed((z) => !z)}
              sx={{
                display: "block",
                maxWidth: zoomed ? "none" : "100%",
                maxHeight: zoomed ? "none" : "85vh",
                width: zoomed ? "150%" : "auto",
                objectFit: "contain",
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transition: "all 0.3s ease",
              }}
            />

            {/* Prev */}
            <IconButton
              aria-label={t("landing.product_preview.prev")}
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(false);
                setLightboxSlide(
                  (p) => (p - 1 + SLIDES.length) % SLIDES.length,
                );
              }}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: alpha("#000", 0.55),
                color: "white",
                "&:hover": { bgcolor: alpha("#000", 0.8) },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Next */}
            <IconButton
              aria-label={t("landing.product_preview.next")}
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(false);
                setLightboxSlide((p) => (p + 1) % SLIDES.length);
              }}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: alpha("#000", 0.55),
                color: "white",
                "&:hover": { bgcolor: alpha("#000", 0.8) },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Dot indicators */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1.5 }}
          >
            {SLIDES.map((_, idx) => (
              <Box
                key={idx}
                component="button"
                type="button"
                aria-label={t("landing.product_preview.go_to_slide", {
                  n: idx + 1,
                })}
                aria-current={idx === lightboxSlide ? "true" : undefined}
                onClick={() => {
                  setZoomed(false);
                  setLightboxSlide(idx);
                }}
                sx={{
                  width: idx === lightboxSlide ? 20 : 8,
                  height: 8,
                  p: 0,
                  border: "none",
                  borderRadius: 4,
                  bgcolor: idx === lightboxSlide ? "white" : alpha("#fff", 0.4),
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        </Box>
      </Modal>

      {/* Integrations — replaces the commented-out "trusted by 500+ companies"
          bar. We have no company count worth printing, but we do have working
          integrations, and each one below was checked against backend source
          before it was allowed on the page (see INTEGRATIONS). */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            align="center"
            component="p"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 800,
              fontSize: "0.8rem",
              letterSpacing: 2,
              mb: 1,
            }}
          >
            {t("landing.integrations.section_label")}
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            align="center"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: "-0.01em" }}
          >
            {t("landing.integrations.section_title")}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: 620, mx: "auto", mb: 5, lineHeight: 1.7 }}
          >
            {t("landing.integrations.section_subtitle")}
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={integration.nameKey}>
                  <Stack
                    spacing={1}
                    alignItems="center"
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Icon
                      sx={{ fontSize: 34, color: theme.palette.primary.main }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {t(integration.nameKey)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem", lineHeight: 1.6 }}
                    >
                      {t(integration.descriptionKey)}
                    </Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 800,
              fontSize: "0.875rem",
              letterSpacing: 2,
            }}
          >
            {t("landing.features.section_label")}
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "2.25rem", md: "3rem" },
              mt: 2,
              letterSpacing: "-0.02em",
            }}
          >
            {t("landing.features.section_new_title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 680,
              mx: "auto",
              fontSize: "1.2rem",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            {t("landing.features.section_new_subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={index}
              sx={{ overflow: "visible" }}
            >
              <Card
                sx={{
                  height: "100%",
                  width: 320,
                  maxWidth: "100%",
                  mx: "auto",
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  bgcolor: "background.paper",
                  overflow: "visible",
                  animation: `${fadeInUp} 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0,
                  [REDUCED_MOTION]: { animation: "none", opacity: 1 },
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.02)",
                    boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 4.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2.5,
                      background: feature.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3.5,
                      color: "white",
                      flexShrink: 0,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      mb: 1.5,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box
        id="how-it-works"
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.015),
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: "0.875rem",
                letterSpacing: 2,
              }}
            >
              {t("landing.how_it_works.section_label")}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: "2.25rem", md: "3rem" },
                mt: 2,
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.how_it_works.section_title")}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 6 }} justifyContent="center">
            {howItWorksSteps.map((step, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={index}
                sx={{ overflow: "visible" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    width: 320,
                    maxWidth: "100%",
                    mx: "auto",
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    bgcolor: "background.paper",
                    p: 4,
                    textAlign: "center",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "visible",
                    animation: `${scaleIn} 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.2}s`,
                    opacity: 0,
                    [REDUCED_MOTION]: { animation: "none", opacity: 1 },
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.03)",
                      boxShadow: `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: "white",
                      mb: 4,
                      boxShadow: `0 12px 36px ${alpha(theme.palette.primary.main, 0.3)}`,
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: -4,
                        borderRadius: "50%",
                        padding: "4px",
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        opacity: 0.3,
                      },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      fontSize: "1.4rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, fontSize: "1rem" }}
                  >
                    {step.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section — hidden for authenticated users */}
      {!isAuthenticated && (
        <Container id="pricing" maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: "0.875rem",
                letterSpacing: 2,
              }}
            >
              {t("landing.pricing.section_label")}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: "2.25rem", md: "3rem" },
                mt: 2,
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.pricing.section_title")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: "1.2rem",
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 680,
                mx: "auto",
              }}
            >
              {t("landing.pricing.section_subtitle")}
            </Typography>
          </Box>

          {/* Monthly / annual switch. Reuses the same BillingToggle the
              in-app subscription screen uses so the two never drift apart. */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <BillingToggle
              value={billingInterval}
              onChange={(interval) => {
                setBillingInterval(interval);
                track(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, {
                  position: "pricing",
                  location: "pricing",
                  label: `billing_interval_${interval}`,
                });
              }}
              discount={ANNUAL_DISCOUNT_PERCENT}
            />
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={plan.planKey}
                sx={{ display: "flex", overflow: "visible" }}
              >
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    maxWidth: 360,
                    mx: "auto",
                    position: "relative",
                    borderRadius: 4,
                    border: plan.recommended
                      ? `2px solid ${plan.color}`
                      : theme.palette.mode === "dark"
                        ? `1px solid ${alpha(plan.color, 0.35)}`
                        : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    overflow: "visible",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    bgcolor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    animation: `${slideInLeft} 0.6s ease-out forwards`,
                    animationDelay: `${index * 0.15}s`,
                    opacity: 0,
                    [REDUCED_MOTION]: { animation: "none", opacity: 1 },
                    ...(plan.recommended && {
                      boxShadow: `0 20px 60px ${alpha(plan.color, 0.15)}`,
                    }),
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: plan.recommended
                        ? `0 30px 80px ${alpha(plan.color, 0.25)}`
                        : `0 25px 70px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                  }}
                >
                  {plan.recommended && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 18 }} />}
                      label={t("landing.pricing.recommended")}
                      sx={{
                        position: "absolute",
                        top: -16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: plan.color,
                        color: theme.palette.getContrastText(plan.color),
                        fontWeight: 800,
                        fontSize: "0.875rem",
                        height: 32,
                        px: 2,
                        boxShadow: `0 4px 12px ${alpha(plan.color, 0.4)}`,
                        "& .MuiChip-icon": {
                          color: theme.palette.getContrastText(plan.color),
                        },
                      }}
                    />
                  )}
                  <CardContent
                    sx={{
                      // Tighter than the old three-card row: four cards share
                      // the same container width.
                      p: { xs: 4, md: 3.5 },
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        fontSize: "1.5rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 4, minHeight: 44, lineHeight: 1.6 }}
                    >
                      {plan.description}
                    </Typography>
                    <Box sx={{ mb: 5 }}>
                      {(() => {
                        // The headline number is the effective monthly rate and
                        // the line beneath it states the amount actually
                        // charged up front. Showing only "$799/yr" hides the
                        // comparison a visitor is trying to make; showing only
                        // "$67/mo" hides the bill. annualTotal comes from the
                        // live Dodo product price, never from a multiplier.
                        const isAnnual = billingInterval === "annual";
                        const annualTotal = plan.annualPrice;
                        const showAnnual = isAnnual && annualTotal !== null;
                        const headline =
                          plan.monthlyPrice === 0
                            ? 0
                            : showAnnual
                              ? effectiveMonthlyRate(annualTotal as number)
                              : plan.monthlyPrice;

                        return (
                          <>
                            <Typography
                              variant="h3"
                              component="span"
                              sx={{
                                fontWeight: 900,
                                color: plan.color,
                                fontSize: "3rem",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {usd(headline)}
                            </Typography>
                            <Typography
                              variant="h6"
                              component="span"
                              color="text.secondary"
                              sx={{ ml: 1.5, fontWeight: 500 }}
                            >
                              /{t("landing.pricing.per_month")}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1, minHeight: 40, lineHeight: 1.5 }}
                            >
                              {plan.monthlyPrice === 0
                                ? t("landing.pricing.free_forever_note")
                                : showAnnual
                                  ? t("landing.pricing.billed_annually_note", {
                                      total: usd(annualTotal as number),
                                      percent: annualDiscountPercent(
                                        plan.planKey as "PROFESSIONAL",
                                      ),
                                    })
                                  : t("landing.pricing.billed_monthly_note")}
                            </Typography>
                          </>
                        );
                      })()}

                      {/* The sharpest claim we have against per-seat ATS
                          pricing — it belongs directly under the number. It is
                          rendered only for plans whose seat limit really is
                          unlimited (see `seatsAreUnlimited`), so the card can
                          never promise unlimited seats above a bullet that
                          caps them. */}
                      {plan.seatsUnlimited && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1.5,
                            fontWeight: 700,
                            lineHeight: 1.5,
                            color: plan.color,
                          }}
                        >
                          {t("landing.pricing.unlimited_recruiters")}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ mb: 5, flexGrow: 1 }}>
                      {planLimitsLoading &&
                        Array.from({ length: 4 }, (_, idx) => (
                          <Skeleton
                            key={idx}
                            variant="text"
                            sx={{ fontSize: "0.95rem", mb: 2 }}
                          />
                        ))}
                      {!planLimitsLoading &&
                        plan.features.map((feature, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mb: 2,
                            }}
                          >
                            <CheckCircleIcon
                              sx={{
                                fontSize: 22,
                                color: plan.color,
                                mr: 2,
                                mt: 0.2,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}
                            >
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: { xs: 4, md: 3.5 }, pt: 0 }}>
                    <Button
                      variant={plan.buttonVariant}
                      fullWidth
                      size="large"
                      onClick={() => {
                        trackCtaClick("pricing", "plan_cta", plan.planKey);
                        if (plan.contactSales) {
                          navigate("/contact");
                          return;
                        }
                        // The chosen interval rides along so the onboarding
                        // payment step can preselect it instead of dropping
                        // the visitor back on monthly.
                        navigate(
                          `/register?plan=${plan.planKey}&interval=${billingInterval}`,
                        );
                      }}
                      sx={{
                        py: 2,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        borderRadius: 2.5,
                        textTransform: "none",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        ...(plan.recommended && {
                          bgcolor: plan.color,
                          boxShadow: `0 4px 16px ${alpha(plan.color, 0.3)}`,
                          "&:hover": {
                            bgcolor: alpha(plan.color, 0.9),
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 24px ${alpha(plan.color, 0.4)}`,
                          },
                        }),
                        ...(!plan.recommended && {
                          borderColor: plan.color,
                          borderWidth: 2,
                          color: plan.color,
                          "&:hover": {
                            borderColor: plan.color,
                            borderWidth: 2,
                            bgcolor: alpha(plan.color, 0.06),
                            transform: "translateY(-2px)",
                          },
                        }),
                      }}
                    >
                      {plan.ctaLabel}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Founder — replaces the commented-out testimonial cards.
          We have no customers, so we have no quotes; inventing three would be
          both dishonest and trivially disprovable. What we do have is a named
          person who is accountable for the product and reachable on LinkedIn,
          which is the strongest honest proof an unknown tool can offer. */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.015),
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="overline"
              component="p"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: "0.8rem",
                letterSpacing: 2,
              }}
            >
              {t("landing.founder.section_label")}
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 900,
                mt: 1.5,
                fontSize: { xs: "1.9rem", md: "2.4rem" },
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.founder.section_title")}
            </Typography>
          </Box>

          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              bgcolor: "background.paper",
              p: { xs: 3, md: 5 },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 4 }}
              alignItems={{ xs: "center", sm: "flex-start" }}
            >
              <Avatar
                src={FOUNDER.photo}
                alt={t("landing.founder.name")}
                sx={{
                  width: 112,
                  height: 112,
                  flexShrink: 0,
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              >
                {t("landing.founder.initials")}
              </Avatar>

              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
                >
                  {t("landing.founder.name")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 600, mb: 2.5 }}
                >
                  {t("landing.founder.role")}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ lineHeight: 1.85, mb: 2, fontSize: "1.02rem" }}
                >
                  {t("landing.founder.bio")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8, mb: 3 }}
                >
                  {t("landing.founder.commitment")}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<LinkedInIcon />}
                    href={FOUNDER.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackCtaClick("founding", "founder_linkedin")
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2.5,
                      px: 3,
                    }}
                  >
                    {t("landing.founder.linkedin_cta")}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      trackCtaClick("founding", "founder_contact");
                      navigate("/contact");
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2.5,
                    }}
                  >
                    {t("landing.founder.contact_cta")}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Contact Us Section */}
      <Box
        id="contact"
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.015),
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              bgcolor: "background.paper",
              boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.06)}`,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                mx: "auto",
                mb: 3,
              }}
            >
              <ContactMailIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                letterSpacing: "-0.02em",
              }}
            >
              {t("contact.cta_title")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                lineHeight: 1.7,
                fontSize: { xs: "1rem", md: "1.1rem" },
                maxWidth: 500,
                mx: "auto",
              }}
            >
              {t("contact.cta_subtitle")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/contact")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 700,
                borderRadius: 2.5,
                textTransform: "none",
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {t("contact.cta_button")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Founding Companies Program Section */}
      <Box
        id="founding-program"
        sx={{
          position: "relative",
          py: { xs: 10, md: 14 },
          overflow: "hidden",
          background: `linear-gradient(160deg,
            ${alpha(theme.palette.warning.light, 0.08)} 0%,
            ${alpha(theme.palette.warning.main, 0.04)} 50%,
            ${theme.palette.background.default} 100%)`,
          borderTop: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
        }}
      >
        {/* Decorative blur */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: alpha(theme.palette.warning.main, 0.07),
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            {/* Left: copy */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                icon={<StarIcon sx={{ fontSize: 14 }} />}
                label={t("landing.founding.badge")}
                size="small"
                sx={{
                  mb: 3,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  bgcolor: alpha(theme.palette.warning.main, 0.12),
                  color: theme.palette.warning.dark,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  "& .MuiChip-icon": { color: theme.palette.warning.dark },
                }}
              />
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2rem", md: "2.75rem" },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  mb: 2.5,
                  color: "text.primary",
                }}
              >
                {t("landing.founding.title")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  mb: 4,
                  maxWidth: 500,
                }}
              >
                {t("landing.founding.description")}
              </Typography>

              {/* Says plainly how early this is. A founding-member programme
                  that does not admit there are no members yet is just a
                  discount with a flattering name. */}
              <Box
                sx={{
                  mb: 4,
                  p: 2,
                  borderRadius: 2,
                  borderLeft: `3px solid ${theme.palette.warning.main}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.06),
                  maxWidth: 500,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ lineHeight: 1.75, fontSize: "0.92rem" }}
                >
                  {t("landing.founding.honesty_note")}
                </Typography>
              </Box>

              {/* What you get */}
              <Stack spacing={2} sx={{ mb: 5 }}>
                {[
                  t("landing.founding.perk_1"),
                  t("landing.founding.perk_2"),
                  t("landing.founding.perk_3"),
                  t("landing.founding.perk_4"),
                ].map((perk, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <CheckCircleIcon
                      sx={{
                        color: "warning.main",
                        fontSize: 20,
                        mt: 0.3,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.95rem", lineHeight: 1.6 }}
                    >
                      {perk}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    trackCtaClick("founding", "claim_founding_spot");
                    navigate("/register");
                  }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.75,
                    fontSize: "1rem",
                    fontWeight: 700,
                    borderRadius: 2.5,
                    textTransform: "none",
                    bgcolor: "warning.main",
                    color: "warning.contrastText",
                    boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.35)}`,
                    "&:hover": {
                      bgcolor: "warning.dark",
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 32px ${alpha(theme.palette.warning.main, 0.45)}`,
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {t("landing.founding.cta_primary")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    trackCtaClick("founding", "talk_to_us");
                    navigate("/contact");
                  }}
                  sx={{
                    px: 4,
                    py: 1.75,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2.5,
                    textTransform: "none",
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: "warning.dark",
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.warning.main, 0.18),
                      boxShadow: "none",
                    },
                  }}
                >
                  {t("landing.founding.cta_secondary")}
                </Button>
              </Stack>
            </Grid>

            {/* Right: program card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  border: `2px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                  borderRadius: 4,
                  background: `linear-gradient(145deg, ${alpha(theme.palette.warning.light, 0.06)}, ${theme.palette.background.paper})`,
                  p: { xs: 3, md: 4 },
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Corner accent */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: `linear-gradient(225deg, ${alpha(theme.palette.warning.main, 0.15)}, transparent)`,
                    borderRadius: "0 16px 0 100%",
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ mb: 3 }}
                >
                  <AutoAwesomeIcon
                    sx={{ color: "warning.main", fontSize: 28 }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ letterSpacing: "-0.01em" }}
                  >
                    {t("landing.founding.card_title")}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.8 }}
                >
                  {t("landing.founding.card_description")}
                </Typography>

                <Stack spacing={2.5}>
                  {[
                    {
                      label: t("landing.founding.step_1_title"),
                      desc: t("landing.founding.step_1_desc"),
                    },
                    {
                      label: t("landing.founding.step_2_title"),
                      desc: t("landing.founding.step_2_desc"),
                    },
                    {
                      label: t("landing.founding.step_3_title"),
                      desc: t("landing.founding.step_3_desc"),
                    },
                  ].map((step, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "warning.main",
                          color: "warning.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          flexShrink: 0,
                          mt: 0.2,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ mb: 0.3 }}
                        >
                          {step.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {step.desc}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="warning.dark"
                    fontWeight={700}
                    sx={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    {t("landing.founding.spots_label")}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          position: "relative",
          background: `linear-gradient(135deg,
						${theme.palette.primary.main} 0%,
						${theme.palette.primary.dark} 50%,
						${theme.palette.secondary.main} 100%)`,
          backgroundSize: "200% 200%",
          animation: `${gradientShift} 5s ease infinite`,
          [REDUCED_MOTION]: { animation: "none" },
          color: "white",
          py: { xs: 10, md: 12 },
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: { xs: 80, md: 120 },
            height: { xs: 80, md: 120 },
            borderRadius: "50%",
            background: alpha(theme.palette.common.white, 0.06),
            filter: "blur(40px)",
            animation: `${float} 8s ease-in-out infinite`,
            [REDUCED_MOTION]: { animation: "none" },
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "2.25rem", md: "3.25rem" },
              letterSpacing: "-0.02em",
              textShadow: "0 2px 20px rgba(0,0,0,0.1)",
            }}
          >
            {t("landing.final_cta.title")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              opacity: 0.93,
              fontSize: "1.25rem",
              lineHeight: 1.6,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            {t("landing.final_cta.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              trackCtaClick("final", "start_free");
              navigate("/register");
            }}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "white",
              color: theme.palette.primary.main,
              px: 7,
              py: 2.5,
              fontSize: "1.25rem",
              fontWeight: 800,
              borderRadius: 3,
              textTransform: "none",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              "&:hover": {
                bgcolor: alpha(theme.palette.common.white, 0.95),
                transform: "translateY(-3px)",
                boxShadow: "0 16px 50px rgba(0,0,0,0.3)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {t("landing.final_cta.button")}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: theme.palette.grey[900],
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 900, mb: 2.5, letterSpacing: "-0.01em" }}
              >
                {t("landing.footer.brand_name")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  opacity: 0.75,
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                }}
              >
                {t("landing.footer.brand_description")}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <IconButton
                  size="small"
                  component="a"
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  sx={{
                    color: "white",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2.5, fontSize: "0.9rem" }}
              >
                {t("landing.footer.product")}
              </Typography>
              <Stack spacing={2}>
                {/* Real anchors/links, not onClick handlers: keyboard users
                    can tab to them and open them in a new tab. The in-page
                    ones keep the smooth scroll on plain clicks. */}
                <Typography
                  variant="body2"
                  component="a"
                  href="#features"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    scrollToSection("features");
                  }}
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.features")}
                </Typography>
                {/* The pricing section is not rendered for signed-in users,
                    so the link goes with it rather than pointing at nothing. */}
                {!isAuthenticated && (
                  <Typography
                    variant="body2"
                    component="a"
                    href="#pricing"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      scrollToSection("pricing");
                    }}
                    sx={{
                      opacity: 0.7,
                      color: "inherit",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                      "&:hover": { opacity: 1, pl: 0.5 },
                    }}
                  >
                    {t("landing.footer.pricing")}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  component={RouterLink}
                  to="/careers"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.careers")}
                </Typography>
              </Stack>
            </Grid>
            {/* Company + Resources merged into one column: every link that
                used to live here (About, Blog, Documentation, API) pointed at a
                "coming soon" toast rather than a route, so they were removed
                instead of advertising pages that do not exist. */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2.5, fontSize: "0.9rem" }}
              >
                {t("landing.footer.company")}
              </Typography>
              <Stack spacing={2}>
                {/* Real anchor, not a navigate() handler: this is the crawl
                    path from the landing page into the article index. */}
                <Typography
                  variant="body2"
                  component="a"
                  href="/blog"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.blog")}
                </Typography>
                <Typography
                  variant="body2"
                  component={RouterLink}
                  to="/contact"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.contact")}
                </Typography>
                <Typography
                  variant="body2"
                  component={RouterLink}
                  to="/contact"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.support")}
                </Typography>
                <Typography
                  variant="caption"
                  component="a"
                  href={`mailto:${t("app.contact_email")}`}
                  sx={{
                    opacity: 0.6,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, textDecoration: "underline" },
                  }}
                >
                  {t("app.contact_email")}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2.5, fontSize: "0.9rem" }}
              >
                {t("landing.footer.legal")}
              </Typography>
              <Stack spacing={2}>
                <Typography
                  variant="body2"
                  component="a"
                  href="/privacy"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.privacy")}
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="/terms"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.terms")}
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="/security"
                  sx={{
                    opacity: 0.7,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": { opacity: 1, pl: 0.5 },
                  }}
                >
                  {t("landing.footer.security")}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 8,
              pt: 5,
              borderTop: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{ opacity: 0.65, fontSize: "0.9rem" }}
            >
              {t("landing.footer.copyright", {
                year: new Date().getFullYear(),
              })}
            </Typography>
          </Box>
        </Container>
      </Box>

      <BookDemoDialog
        open={bookDemoOpen}
        onClose={() => setBookDemoOpen(false)}
      />
    </Box>
  );
};

export default LandingPage;
